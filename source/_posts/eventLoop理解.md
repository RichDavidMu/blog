---
title: EventLoop理解
date: 2020-04-01 23:16:10
index_img: /img/blogCovers/blog-post6.png
tags: [JavaScript, 异步编程]
categories: [学习笔记]
---
不多说，大家先看一段代码

```javascript
console.log('script start');

setTimeout(function() {
  console.log('setTimeout');
}, 0);

Promise.resolve().then(function() {
  console.log('promise1');
}).then(function() {
  console.log('promise2');
});

console.log('script end');
```
请问这段代码的打印顺序是什么

正确的答案是：`script start`, `script end`, `promise1`, `promise2`, `setTimeout`。

## 为什么会这样
这就要引出事件循环了。可以看到，上面的代码中有几种任务种类，有`setTimeout`、`Promise`和可立即执行的`script代码`，事件循环可以理解为是一种规范，规定我们单线程的JavaScript以何种顺序去执行`js脚本`。

在JavaScript中，任务被分为两种，一种宏任务（`MacroTask`）也叫`Task`，一种叫微任务（`MicroTask`）。这两种任务有各自的执行队列。
先来几个概念：

 - Tasks：任务，有的地方称为MacroTask(宏任务)，以下几类任务被执行时会进入此队列：`script`代码、计时器（`setTimeout`、`setInterval`、`setImmediate`）、`I/O`、`UI Rendering`。
 - MicroTask：微任务，以下几类任务被执行时会进入此队列：`Process.nextTick`（`Node`）、`Promise`、`Object.observe`、`MutationObserver`

分清楚以后，再说一下这两条队列的执行逻辑。一段代码开始执行总会先执行一个`Task`队列中的第一任务，在上例中，第一个`Task`是整个`script`代码，也就是说，代码开始执行时，将全部`script`代码放入`Task`队列中，JavaScript开始执行其中的代码。遇到同步任务时，如`console.log()`，JavaScript会将他放入执行栈，立即执行。遇到异步任务时，先不管他，让他自己执行，执行完毕后，该任务会向任务队列发出信号，根据他的任务类型，放入不同的队列，以便执行后续的回调函数。如`setTimeout`在`0s`后向Task队列发出信号，将`setTimeout`的回调函数放入`Task`队列中，位置在`script`代码之后。遇到`promise`时，同样先让他自己执行，当他执行完毕，向`MicroTask`队列发出信号，将他的回调函数放入`Microtask`队列。

当第一个`Task`，即`script`全部代码执行完毕后，会先执行所有`MicroTask`队列中的任务，执行的逻辑与之前相同，遇到同步代码立即执行，异步代码待自行完成后，将各自回调函数加入相应队列。

当所有微任务完成后，JavaScript才会执行`Task`队列中的下个任务，即`setTimeout`的回调函数`console.log('setTimeout');`，以此往复循环（Event Loop）。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200401161628154.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2pvaG5ueV9tdQ==,size_16,color_FFFFFF,t_70)
下面是示例代码运行的动图
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200401164245792.gif#pic_center)
## 再来几个题，来巩固一下
**题目：写出运行结果**

```javascript
setTimeout(function(){
    console.log(1);
}, 0)
new Promise(function(resolve){
    console.log(2);
    resolve();
    console.log(3);
}).then(function(){
    console.log(4);
})
console.log(5);

```
解析

```
// 解析：
// 1. new Promise(fn)后，函数fn会立即执行；
// 2. fn在执行过程中，由于调用了resolve，使得Promise立即转换为resolve状态，
//    这也促使p.then(fn)中的函数fn被立即放入microTask队列中，因此fn将会在
//    本轮事件循环的结束时执行，而不是下一轮事件循环的开始时执行；
// 3. setTimeout属于macroTask，是在下一轮事件循环中执行；
//答案：
// 2 3 5 4 1
```
**题目：写出运行结果**

```javascript
Promise.resolve(1)
  .then((res) => {
    console.log(res);
    return 2;
  })
  .catch((res) => {
    console.log(res);
    return 3;
  })
  .then((res) => {
    console.log(res);
  });

```
解析

```
// 解析：每次调用p.then或p.catch都会返回一个新的promise，
//       从而实现了链式调用；第一个.then中未抛出异常，
//       所以不会被.catch语句捕获，会正常进入第二个.then执行；
// 答案：1 2
```
**题目：写出运行结果**
```javascript
new Promise(resolve => { // p1
    resolve(1);
    
    // p2
    Promise.resolve().then(() => {
      console.log(2); // t1
    });

    console.log(4)
}).then(t => {
  console.log(t); // t2
});

console.log(3);
```
解析

```
// 解析：
// 1. new Promise(fn), fn 立即执行，所以先输出 4；
// 2. p1和p2的Promise在执行then之前都已处于resolve状态，
//    故按照then执行的先后顺序，将t1、t2放入microTask中等待执行；
// 3. 完成执行console.log(3)后，macroTask执行结束，然后microTask
//    中的任务t1、t2依次执行，所以输出3、2、1；
// 答案：
// 4 3 2 1
```
## 参考文献
[https://juejin.im/post/5cf7857ff265da1bac4005b2](https://juejin.im/post/5cf7857ff265da1bac4005b2)
[https://hongfanqie.github.io/tasks-microtasks-queues-and-schedules/](https://hongfanqie.github.io/tasks-microtasks-queues-and-schedules/)
[https://zhuanlan.zhihu.com/p/55511602](https://zhuanlan.zhihu.com/p/55511602)