const Koa = require('koa');
const app = new Koa();
const child_process = require('child_process')
const crypto = require('crypto')
const bodyParser = require('koa-bodyparser')

const sigHeaderName = 'x-hub-signature-256'
const sigHashAlg = 'sha256'

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
  const cmd = 'git stash && git stash clear && git pull'

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

  const cmd1 = 'hexo clean && hexo generate'
  try{
    const log1 = child_process.spawnSync(cmd1, {shell: true})
    console.log(log1.toString())
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
app.listen(1996);
console.log('github hook server listen at port 1996')