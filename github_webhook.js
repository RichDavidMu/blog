const Koa = require('koa');
const app = new Koa();
const child_process = require('child_process')
const crypto = require('crypto')
const bodyParser = require('koa-bodyparser')

const sigHeaderName = 'x-hub-signature-256'
const sigHashAlg = 'sha256'
const xGithubHookId = 'x-github-hook-id'
const xGithubHookInstallationTarget = 'x-github-hook-installation-target-id'

app.use(bodyParser())

const secret = 'm7758521'

const main = ctx => {
  const sig = Buffer.from(ctx.request.headers[`${sigHeaderName}`] || '', 'utf8')
  const hmac = crypto.createHmac(sigHashAlg, secret)
  const digest = Buffer.from(sigHashAlg + '=' + hmac.update(ctx.request.rawBody).digest('hex'), 'utf8')
  if (sig.length !== digest.length || !crypto.timingSafeEqual(digest, sig)) {
    console.log(`Request body digest (${digest}) did not match ${sigHeaderName} (${sig})`)
    ctx.status = 403
    return
  }

  console.log('start cmd')
  const cmd = 'git stash && git stash clear && git pull && npm install'
  const process = child_process.spawn(cmd, {shell: true})
  process.stderr.on('data', (data) => {
    console.error(data.toString())
    const response = {code: 500, message: 'update failed'}
    ctx.response.body = response
    ctx.status = 500
    return;
  })
  process.stdout.on('close',()=>{
    const cmd1 = 'hexo clean && hexo generate && pm2 restart all'
    const process1 = child_process.spawn(cmd1, {shell: true})
    process1.stdout.on('close',()=>{
            console.log('hexo blog start !!!!')
            const response = {code: 200, message: 'update successfully'}
            ctx.response.body = response
            ctx.status = 200
            return;
      })
    })
  };
  
app.use(main);
app.listen(1996);
console.log('github hook server listen at port 1996')