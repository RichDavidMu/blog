---
title: promise详解(promise.all实现、promise.race实现)
date: 2020-03-10 23:08:45
tags: [JavaScript, 异步编程]
index_img: /img/blogCovers/blog-post1.jpg
categories: [学习笔记]
---
## promise解决了什么问题
JavaScript是单线程的，所以我们要用一些异步编程方案来实现异步。
回调函数就是其中的一种方案，比如说在node中写读取一个文件，使用回调函数这是没有问题的。

```javascript
fs.readFile('/etc/passwd', function (err, data) {
  if (err) throw err;
  console.log(data);
});
```
但如果新的需求是必须先读取A文件，才能读取B文件

```javascript
fs.readFile(fileA, function (err, data) {
	fs.readFile(fileB, function (err, data) {	
  		//...
  		})
});
```
不难想象，如果依次读取多个文件，就会出现多重嵌套。代码不是纵向发展，而是横向发展，很快就会乱成一团，无法管理。这种情况就称为"回调地狱"（callback hell）。
而`promise`就是为了解决这个问题而生的
## 什么是promise
它不是新的语法功能，而是一种新的写法，允许将回调函数的横向加载，改成纵向加载。采用Promise，连续读取多个文件，写法如下。

```javascript
var readFile = require('fs-readfile-promise');
readFile(fileA)//读取文件A
.then(function(data){//如果读取成功则执行该函数，打印数据
  console.log(data.toString());
}).then(function(){//如果打印成功，则开始读取文件B
  return readFile(fileB);
}).then(function(data){//如果文件B读取成功，则打印文件B的数据
  console.log(data.toString());
}).catch(function(err) {//过程中发生任何错误则捕获，打印该错误
  console.log(err);
});
```
上面代码中，我使用了 `fs-readfile-promise` 模块，它的作用就是返回一个 Promise 版本的 `readFile` 函数。Promise 提供 `then` 方法加载回调函数，`catch`方法捕捉执行过程中抛出的错误。看起来清爽多了
再来看一段伪代码

```javascript
//传统写法（层层嵌套，可读性差）：
step1(function (value1) { 
  step2(value1, function(value2) { 
    step3(value2, function(value3) { 
      step4(value3, function(value4) { // ... });
     }); 
  });
});

//Promises的写法（清晰舒服）：
(new Promise(step1))
  .then(step2)
  .then(step3)
  .catch(step4);
```
promise对象，充当异步操作与回调函数之间的中介，将异步编程大大简化了。


### Promise 的状态

等待（`pending`）：初始状态。
已完成（`fulfilled`）：意味着操作成功完成。
已失败（`rejected`）：意味着操作失败。

Promise对象的状态只可能处于这三种之一，它的状态改变只可能是两种可能：从 Pending 变为 `fulfilled` 和从 `Pending` 变为 `Rejected`。一旦状态发生改变，就不会再变，这也是`Promise[承诺]`这个名字的由来。
### promise的使用
再来看一个简单的例子
```javascript
function getNumber(num){
  return new Promise(function(resolve,reject){//返回一个promise对象
      if(num > 5){
        resolve(num)//如果数字大于5则，执行resolve
      }else{
        reject('数字太小')}//否则执行reject
  })
}
function printData(data){
    console.log('resolve');
    console.log(data);
  }
function printError(data){
	console.log('reject');
    console.log(data);
}
getNumber(4).then(printData).catch(printError);//reject 4
getNumber(6).then(printData).catch(printError);//resolve 6
```
当`promise`执行了`resolve`语句（模拟异步操作执行成功），那么`promise`的状态就回变为`resolve`，可以使用`then`方法，调用传入的回调函数，而回调函数的参数就是`resolve`中返回的数据。

相反

promise执行了`reject`语句（模拟异步操作执行失败），那么promise的状态就回变为`reject`，可以使用`catch`方法，调用传入的回调函数，而回调函数的参数就是reject中返回的数据。

### promise的其他方法
#### promise.all
`Promise.all(iterable)` 方法返回一个 `Promise` 实例，此实例在 `iterable` 参数内所有的 `promise` 都“`完成（resolved）`”或参数中不包含 `promise` 时回调`完成（resolve）`；如果参数中  `promise` 有一个`失败（rejected）`，此实例回调`失败（reject）`，失败原因的是第一个失败 `promise` 的结果

将两个promise对象拼成一个数组传进`all`方法。看有没有失败，有一个失败的，则整个`all`方法产生的promise对象失败。

只要有一个失败了，这个promise就失败，结果为第一个失败的结果。如果都成了，就返回全部成功的结果。

```javascript
const p1 = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve('hello');
}, 1000);
})
const p2 = new Promise((resolve, reject) => {
    resolve(1);
  })
 Promise.all([p1,p2]).then(//传入的是两个promise对象
    result=>console.log(result)
  ).catch(
    e=>console.log(e)        
  )// Array(2) ["hello", 1]
```
将因为两个`promise`对象的状态都是已完成，所以返回的是数组，包含着两个`promise`的回调参数
在看另外一个例子

```javascript
const p1 = new Promise((resolve, reject) => {
        resolve('第一个任务');
})
const p2 = new Promise((resolve,reject) =>{
    setTimeout(() => {
        reject('第二个任务')
    }, 1000);
})
const p3 = new Promise((resolve, reject) => {
    setTimeout(() => {
        reject('第三个任务');    
    }, 500);
  })
Promise.all([p1,p2,p3]).then(
    result=>console.log(result)
  ).catch(
    e=>console.log(e)        
  )//第三个任务
```
执行结果打印的是第三个任务，细品这段代码就能明白`Promise.all`干的是啥了
#### `promise.all`的实现

```javascript
/** 仅考虑 promises 传入的是数组的情况时 */
Promise.all = function (promise) {
	let promises = Array.from(promise)//将iterator转换为数组
    return new Promise((resolve, reject) => {
        if (promises.length === 0) {//如果数组长度为0则返回空数组
            resolve([]);
        } else {
            let result = [];//存放已成功的异步操作
            let index = 0;//记录已成功的操作数
            for (let i = 0;  i < promises.length; i++ ) {
                Promise.resolve(promises[i])//执行每一个promise
                	.then(data => {
                    	result[i] = data;
                    	if (++index === promises.length) {
                        //所有的 promises 状态都是 fulfilled，promise.all返回的实例才变成 fulfilled 态
                       	 resolve(result);
                    }
                }, err => {
                    reject(err);
                    return;
                });
            }
        }
    });
}
```
#### `Promise.race()`
`Promise.race(iterable)` 方法返回一个 `promise`，一旦迭代器中的某个`promise`解决或拒绝，返回的 `promise`就会解决或拒绝
举个例子

```javascript
const p1 = new Promise((resolve, reject) => {
    setTimeout(() => {
         resolve('第一个任务');
    }, 200);
})
const p2 = new Promise((resolve,reject) =>{
    setTimeout(() => {
        reject('第二个任务')
    }, 1000);
})
const p3 = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve('第三个任务');    
    }, 500);
  })
Promise.all([p1,p2,p3]).then(
    result=>console.log(result)
  ).catch(
    e=>console.log(e)        
  )//第一个任务
```
只要其中一个实例先改变状态，状态就跟着改变将率先改变的`Promise`返回值传递给回调函数，大白话：看谁快
#### `Promise.race()`实现

```javascript
var race = function(promise) {
	let promises = Array.from(promise)
    return new Promise(function(resolve, reject) {
        for (var i = 0; i < promises.length; i++) {
       		 Promise.resolve(promises[i]).then(data => {
				resolve(data);
       			 }, err => {
          			return reject(err)
        })
      }
    })
  }
```
#### `Promise.resolve()`和`Promise.reject()`

```javascript
// Promise.reject(reason)方法也会返回一个新的 Promise 实例，该实例的状态为rejected
const p = Promise.reject('出错了');
// 等同于
const p = new Promise((resolve, reject) => reject('出错了'))

p.then(null, function (s) {
  console.log(s)      // 出错了
});
```

```javascript
Promise.resolve('foo')
// 等价于
new Promise(resolve => resolve('foo'))
```
