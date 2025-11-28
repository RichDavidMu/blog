---
title: Hexo博客使用Github_Webhook自动部署到个人服务器
date: 2022-02-10 11:16:21
index_img: https://d33wubrfki0l68.cloudfront.net/6657ba50e702d84afb32fe846bed54fba1a77add/827ae/logo.svg
tags: [hexo, 前端工程化]
categories: [CI/CD]
---

最近想把之前写的博客重新注册一个域名放到网上，地址：[https://luoluoqinghuan.cn/](https://luoluoqinghuan.cn/)
。博客框架使用的是hexo，部署到服务器上也很简单，把hexo生成的网站文件放在服务器上，用koa-static起一个服务就行了。

但这是一种非常麻烦的部署方式，每次更新博客都要登陆服务器手动上传，如果想要自动更新网站就要解决两个问题：
+ 从哪里拿到最新的代码（github）
+ 如何知道代码已经更新（github-webhook）
## What Is Webhook

webhook是github提供的一个钩子，这个钩子在触发github一些事件后，会向配置好的地址发一个http请求。在`任何一个仓库 -> Setting -> Webhooks` 可以进行配置。我们可以在服务器上监听这个请求，就可以知道更新网站的时机了。

github提供的事件非常丰富，有20多种，几乎覆盖了所有git相关的操作，比如打了个tag、新建了branch、有新的commit等。
![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/882c8bc589534941bd19cc2ffc53053a~tplv-k3u1fbpfcp-watermark.image?)

了解到这里，我们就知道如何去自动部署我们的博客网站了，首先将博客源码推到github上，并配置webhook，针对push事件进行监听，在个人服务器上另起一个服务，接收webhook的请求，收到请求后拉取最新代码并重新构建，done！

## 实现-web服务
我们有两个服务，一个是网站服务，一个是webhook监听服务。咱们一个一个来
```javascript
// 网站服务 hexo_server.js
const serve = require('koa-static');
const Koa = require('koa');
const app = new Koa();
 
const fs = require('fs')
const http = require('http')
const https = require('https')
const enforceHttps = require('koa-sslify').default

app.use(enforceHttps())
app.use(serve('public'));
 
const options = {
	key: fs.readFileSync('./ssl/luoluoqinghuan.cn.key'),
	cert: fs.readFileSync('./ssl/luoluoqinghuan.cn.pem')
}

http.createServer(app.callback()).listen(80);
https.createServer(options, app.callback()).listen(443)
console.log('listening on port 80 443');

```
直接使用koa-static这个中间件，很容易就可以将网站跑起来，我还在腾讯云申请了免费的证书，这样网站就可以支持https了，虽然一个简单的静态网站好像不需要https，但使用https可以帮助博客在搜索引擎中的排名更高一些。

## 实现-webhook服务
首先要在博客仓库里配置webhook

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/51073488f70a43998748ab2094c5ec0c~tplv-k3u1fbpfcp-watermark.image?)

在payloadUrl中填入你服务器的地址，webhook的http请求会发向该地址，secret是密码，webhook会在请求头中使用此密码生成哈希值，供我们鉴权使用，events我们选第一个就可以了，我们在本地写完文章，push上去，触发webhook回调，点击add就添加成功了

接下来就可以写一下服务了。
```javascript
// webhook服务 webhook_server.js
const Koa = require('koa');
const app = new Koa();
const child_process = require('child_process')
const crypto = require('crypto')
const bodyParser = require('koa-bodyparser')

const sigHeaderName = 'x-hub-signature-256'
const sigHashAlg = 'sha256'

app.use(bodyParser())

const secret = '123456'

const main = ctx => {
  // 鉴权
  const sig = Buffer.from(ctx.request.headers[`${sigHeaderName}`] || '', 'utf8')
  const hmac = crypto.createHmac(sigHashAlg, secret)
  const digest = Buffer.from(sigHashAlg + '=' + hmac.update(ctx.request.rawBody).digest('hex'), 'utf8')
  if (sig.length !== digest.length || !crypto.timingSafeEqual(digest, sig)) {
    console.log(`Request body digest (${digest}) did not match ${sigHeaderName} (${sig})`)
    ctx.status = 403
    return
  }

  console.log('start cmd')
  // 拉取最新代码
  const cmd = 'git checkout . && git pull'

  try{
    const log = child_process.spawnSync(cmd, {shell: true})
    console.log(log.stdout.toString())
  }catch(e){
    console.error(e.toString())
    const response = {code: 500, message: 'update failed'}
    ctx.response.body = response
    ctx.status = 500
    return;
  }

  // build网站
  const cmd1 = 'hexo clean && hexo generate'
  try{
    const log1 = child_process.spawnSync(cmd1, {shell: true})
    console.log(log1.stdout.toString())
    console.log('hexo blog update successed !!!!')
    const response = {code: 200, message: 'update successfully'}
    ctx.response.body = response
    ctx.status = 200
    return;
  }catch(e){
    console.log(e.toString())
    console.log('hexo blog update failed !!!!')
    const response = {code: 500, message: 'failed'}
    ctx.response.body = response
    ctx.status = 500
    return;
  }
}
app.use(main);
app.listen(3000);
console.log('github hook server listen at port 3000')
```
这样，我们的监听服务就搞定了，跑起来（推荐使用pm2），写一下文章，然后push一下，可以看到我们自动部署服务成功了。最新的文章也出现在了网站上。

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9aacf4c41b6c42458e25936ee383797a~tplv-k3u1fbpfcp-watermark.image?)

