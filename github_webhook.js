const Koa = require('koa');
const app = new Koa();
const child_process = require('child_process')
const crypto = require('crypto')
const bodyParser = require('koa-bodyparser')

const sigHeaderName = 'x-hub-signature'
const sigHashAlg = 'sha1'
const xGithubHookId = 'x-github-hook-id'
const xGithubHookInstallationTarget = 'x-github-hook-installation-target-id'

app.use(bodyParser())

const secret = 'm7758521'

const main = ctx => {

  const githubSig = ctx.request.headers[`${sigHeaderName}`]
  console.log(githubSig)
  const expectSig = crypto.createHmac(sigHashAlg, secret).update(JSON.stringify(ctx.request.body)).digest('hex')
  console.log(expectSig)
  
    console.log(ctx.request.headers)
    console.log(ctx.request.body)

    console.log('start cmd')
    const cmd = 'git stash && git stash clear && git pull && npm install'
    const process = child_process.spawn(cmd, {shell: true})
    process.stderr.on('data', (data) => {
      console.error(data.toString())
      const response = {code: 500, message: 'update failed'}
      ctx.response.body = response
      ctx.status = 500
    })
    process.stdout.on('close',()=>{
      const cmd1 = 'hexo clean && hexo generate && pm2 restart all'
      console.log(cmd1)
      const process1 = child_process.spawn(cmd1, {shell: true})
      process1.stdout.on('close',()=>{
              console.log('hexo blog start !!!!')
              const response = {code: 200, message: 'update successfully'}
              ctx.response.body = response
              ctx.status = 200
              return ctx;
      })
    })
  };
  
app.use(main);
app.listen(1996);
console.log('github hook server listen at port 1996')