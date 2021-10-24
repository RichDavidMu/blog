const Koa = require('koa');
const app = new Koa();
const child_process = require('child_process')

const main = ctx => {
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
          const cmd3 = 'pm2 start hexo_server.js'
          console.log(cmd3)
          const process3 = child_process.spawn(cmd3, {shell: true})
          process3.on('close',()=>{
            console.log(data.toString())
            const response = {code: 200, message: 'update successfully'}
            ctx.response.body = response
            ctx.status = 200
          })
        })
      
      })
      
  })
  };
  
app.use(main);
app.listen(3000);
console.log('github hook server listen at port 3000')