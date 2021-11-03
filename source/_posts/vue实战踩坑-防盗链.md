---
title: 踩坑日记：防盗链与x-tengine-error:denied by Referer ACL
date: 2020-03-28 23:14:16
index_img: /img/blogCovers/blog-post5.jpg
tags: [JavaScript, http, NodeJs]
categories: [项目实战]
---
## 踩坑
之前的写的知乎日报项目[https://blog.csdn.net/johnny_mu/article/details/105128678](https://blog.csdn.net/johnny_mu/article/details/105128678)

客户端曾爆出了这个403错误

> ![在这里插入图片描述](https://img-blog.csdnimg.cn/20200328193008768.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2pvaG5ueV9tdQ==,size_16,color_FFFFFF,t_70#pic_center)
> 看起来好像是css文件被跨域限制了，无法引用。那就用之前图片的代理服务器转发一下就好了。

我一开始以为是跨域限制导致的css文件无法加载，所以用代理服务器转发一下，设置上相应header字段就好，问题确实就解决了。
但是昨晚睡前一想，不对啊，css，图片等静态资源是不会被跨域限制的。于是我试了一下真正跨域限制的报错。果然不一样。
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200328193649824.png)
再试一下，将图片代理服务器中的取消跨域限制的代码注释掉

```javascript
			res.setHeader('Content-Type', contentType);
            // res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(body);
```
重新打开网页，没有任何变化，完美运行。
说明之前的bug不是因为跨域产生的，那是因为什么呢。
打开控制台看一下请求这个css文件时的network，发现了问题
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200328194744609.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2pvaG5ueV9tdQ==,size_16,color_FFFFFF,t_70)
在回复头字段里多了一个`x-tengine-error`，这是什么鬼，百度了一下，明白了，这是因为防盗链检测所出现的`error`
## 防盗链
具体可以看这篇文章 [什么是防盗链](https://www.jianshu.com/p/0a1338db6cab)

我简单说一下

首先有一个问题，B站点作为一个商业网站，有很多自主版权的图片，自身展示用于商业目的。而A站点，希望在自己的网站上面也展示这些图片，直接使用：

```javascript
<img src="http://b.com/photo.jpg"/>
```

这样，大量的客户端在访问A站点时，实际上消耗了B站点的流量，而A站点却从中达成商业目的。从而不劳而获。这样的A站点着实令B站点不快的。

这种行为又叫做盗链（那我岂不也是盗链者了QAQ）

如何解决这个问题呢？服务端利用了客户端的一个特性

客户端在加载非本站的资源时，会在头字段加上`Referer:`字段，用来告诉服务端，这个请求是来自哪里。
回头看一眼我们的network
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200328200214620.png)
确实是这样。

那我们可以推断，知乎服务器利用是否有referer字段来判断是否为盗链行为，如果是，那么返回403错误，与`x-tengine-error: denied by Referer ACL`字段。

而我们用代理服务器转发静态资源请求，代理服务器不会无端加上referer字段，相当于变相绕过了知乎服务器的盗链限制。

## 出坑

验证一下，让代理服务器发送请求时带上`referer`字段，将request模块设置为调试模式



```javascript
const imgServer = http.createServer((req, res) => {
    const url = req.url.split('/img/')[1];
    const options = {
        url: url,
        encoding: null,
        headers: {
            "Referer": "http://localhost:8080/",
        }
    };

    function callback (error, response, body) {
        if(error) console.log(error);
        if (!error && response.statusCode === 200) {
            const contentType = response.headers['content-type'];
            res.setHeader('Content-Type', contentType);
            // res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(body);
        }
    }
    request.get(options, callback);
});
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/2020032820280853.png)
看到控制台输出

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200328202537488.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2pvaG5ueV9tdQ==,size_16,color_FFFFFF,t_70)
踩坑结束。