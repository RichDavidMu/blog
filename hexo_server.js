const serve = require('koa-static');
const Koa = require('koa');
const app = new Koa();
 
const fs = require('fs')
const http = require('http')
const https = require('https')
const enforceHttps = require('koa-sslify').default

app.use(enforceHttps())

// $ GET /package.json
// app.use(serve('.'));
 
// $ GET /hello.txt
app.use(serve('public'));
 
// or use absolute paths
// app.use(serve(__dirname + '/public'));
 
// app.listen(80);
 
const options = {
	key: fs.readFileSync('./ssl/luoluoqinghuan.cn.key'),
	cert: fs.readFileSync('./ssl/luoluoqinghuan.cn.pem')
}

http.createServer(app.callback()).listen(80);
https.createServer(options, app.callback()).listen(443)
console.log('listening on port 80 443');
