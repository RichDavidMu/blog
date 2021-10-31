const Koa = require('koa');
const app = new Koa();
const child_process = require('child_process')
const crypto = require('crypto')
const bodyParser = require('koa-bodyparser')

const sigHeaderName = 'x-hub-signature'
const sigHashAlg = 'sha1'

app.use(bodyParser())

const secret = 'm7758521'
let server = undefined;

const main = ctx => {
  if(server){
    server.kill()
  }

  const githubSig = ctx.request.headers[`${sigHeaderName}`]
  console.log(githubSig)
  const hmac = crypto.createHmac(sigHashAlg, secret)
  console.log(hmac)
  const digest = sigHashAlg + '=' + hmac.update(JSON.stringify(ctx.request.body)).digest('hex')
  console.log(digest)
  const bufferA = Buffer.from(githubSig, 'utf8');
  const bufferB = Buffer.from(digest, 'utf8');
  const safe = crypto.timingSafeEqual(bufferA, bufferB);

  if(!safe) {
    ctx.status = 403
    return ctx
  }
    console.log(ctx.request.headers)
    console.log(ctx.request.body)
    console.log('start cmd')
    const cmd = 'git stash && git pull'
    console.log(cmd)
    const process = child_process.spawn(cmd, {shell: true})
    process.stderr.on('data', (data) => {
      console.error(data.toString())
      const response = {code: 500, message: 'update failed'}
      ctx.response.body = response
      ctx.status = 500
    })
    process.stdout.on('close',()=>{
      const cmd1 = 'hexo clean'
      console.log(cmd1)
      const process1 = child_process.spawn(cmd1, {shell: true})
      process1.stdout.on('close',()=>{
        const cmd2 = 'hexo generate'
        console.log(cmd2)
        const process2 = child_process.spawn(cmd2, {shell: true})
        process2.stdout.on('close',()=>{
          const cmd4 = 'pm2 delete hexo_server'
          console.log(cmd4)
          const process4 = child_process.spawn(cmd4, {shell: true})
          process4.on('close', () => {
            const cmd3 = 'pm2 start hexo_server.js'
            console.log(cmd3)
            const process3 = child_process.spawn(cmd3, {shell: true})
            process3.on('close',()=>{
              console.log('hexo blog start !!!!')
              const response = {code: 200, message: 'update successfully'}
              ctx.response.body = response
              ctx.status = 200
              return ctx;
            })
          })
          // const cmd3 = 'hexo server -p 80'
          // server = child_process.spawn(cmd3,{shell: true})
          // server.on('data',(data)=>{
          //   if(data.toString().includes('Hexo is running')){
          //     console.log(data.toString())
          //     console.log('hexo blog start !!!!')
          //     const response = {code: 200, message: 'update successfully'}
          //     ctx.response.body = response
          //     ctx.status = 200
          //   }
            
          // })

        })
      
      })
      
  })
  };
  
app.use(main);
app.listen(3000);
console.log('github hook server listen at port 3000')