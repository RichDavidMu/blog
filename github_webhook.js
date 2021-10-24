const Koa = require('koa');
const app = new Koa();
const child_process = require('child_process')

const main = ctx => {
    console.log(ctx.request.headers)
    console.log(ctx.request.body)
    const cmd = 'git stash && git pull && hexo clean && hexo generate && hexo server -p 80'
    const process = child_process.spawn(cmd, {shell: true})
    process.stderr.on('data', (data) => {
      console.error(data.toString())
      const response = {code: 500, message: 'update failed'}
      ctx.response.body = response
      ctx.status = 500
    })
    process.stdout.on('data',(data)=>{
      console.log(data.toString())
      const response = {code: 200, message: 'update successfully'}
      ctx.response.body = response
      ctx.status = 200
  })
  };
  
app.use(main);
app.listen(3000);
console.log('github hook server listen at port 3000')