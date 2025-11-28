---
title: Javascript学习笔记一
date: 2020-02-11 16:26:09
index_img: /img/blogCovers/js1.jpg
tags: [JavaScript]
categories: [学习笔记]
---

打算把最近学习的JavaScript写个博客整理记录一下，学习方式是《JavaScript语言精粹》这本书和[廖雪峰的博客](https://www.liaoxuefeng.com/wiki/1022910821149312)，不太明白的地方会去看《JavaScript权威指南》、[JavaScript|MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript)和[W3School](https://www.w3school.com.cn/js/index.asp)。
## 数据类型
JavaScript 变量能够保存多种数据类型：数值、字符串值、数组、对象等等：
### Numbers
JavaScript只有一种数字类型，不区分整型与浮点型，存储方式使用64位浮点数，1和1.0的值是相同的。
```javascript
123; // 整数123
0.456; // 浮点数0.456
1.2345e3; // 科学计数法表示1.2345x1000，等同于1234.5
-99; // 负数
NaN; // NaN表示Not a Number，当无法计算结果时用NaN表示，可以用isNaN检测NaN
Infinity; // Infinity表示无限大，当数值超过了JavaScript的Number所能表示的最大值时，就表示为Infinity
```
可以操作数字的方法 
- 五个number方法 [查看](https://www.w3school.com.cn/js/js_number_methods.asp)
	* 将数字以字符串返回：`number.toString(radix)`,`radix`控制进制，默认十进制。
	* 将number转换为一个十进制形式的字符串，保留`fractionDigits`位小数（多余的四舍五入）：`number.toFixed(fractionDigits)`
	* 将number转换成为一个指数形式的字符串，保留`fractionDigits`位小数（多余的四舍五入）`number.toExponential（fractionDigits）`
	* 将number转换为一个十进制形式的字符串，保留`precision`个有效数字（多余的四舍五入）：`number.toPrecision(precision)`
- 三个全局方法 [查看](https://www.w3school.com.cn/js/js_number_methods.asp)
  * 可以将x转换为数字，x为任意JavaScript变量（日期，布尔值等）：`Number(x)`
  * 解析一段字符串并返回整型数值（向下取整）。允许空格。只返回首个数字： `parseInt(string)`
  * 解析一段字符串并返回数值。允许空格。只返回首个数字：`parseFloat(string)`
- math对象方法执行数学数学任务 [查看](https://www.w3school.com.cn/js/js_math.asp)
  * 返回x的四舍五入：`Math.round(x)`
  * 返回x的y次幂：`Math.pow(x,y)`
  * 返回x的平方根：`Math.sqrt(x)`
  * 返回x的绝对值：`Math.abs(x)`
  * x向上取整：`Math.ceil(x)`，x向下取整：`Math.floor(x)`
  * x正弦余弦：`Math.sin(x)` , `Math.cos(x)`
  * 最大最小值：`Math.min(1,,2,3,4) //1` ，`Math.max(1,2,3,4) //4`,[用于数组](https://www.cnblogs.com/lguow/p/9725258.html)
  * 返回一个0-1的随机数：`Math.random()`，更多[随机数trick](https://www.w3school.com.cn/js/js_random.asp)

### Strings
JavaScript的字符串就是用`' '`或`" "`括起来的字符
例：
```javascript
'I\'m \"OK\"!';
```
含义`I'm "OK"!`
>字符串一旦创建就不能改变，可以使用字符串方法操作返回新的字符串

`\`是转义字符 

```javascript
'A' === '\u0041'; //true
```
string有`length`属性
```javascript
'seven'.length; //5
```
可以用`+`号连接其他字符串来创建一个新的字符串
```javascript
'c'+'a'+'t' ==='cat'; //true
```
string拥有方法 [查看](https://www.w3school.com.cn/js/js_string_methods.asp)

+ 查找：`string.indexOf(searchString,position)` , `string.lastIndexOf(seachString,position)` , `string.search(regexp)`.
`searchString`要搜索的字符串，`position`开始搜索的位置，`regexp`正则表达式对象，以number返回位置

	>  两种方法，`string.indexOf()` 与 `string.search()`，是相等的。
	> 
	> 这两种方法是不相等的。区别在于：
	> 
	> `string.search()` 方法无法设置第二个开始位置参数。 `string.indexOf()` 方法无法设置更强大的搜索值（正则表达式）。
+ 提取字符：`string.charAt(position)` 方法返回字符串中指定下标（位置）的字符串。
`string.charCodeAt(position)`方法返回字符串中指定索引的字符 unicode 编码，常用此方法建造哈希表，相反`string.fromCharCode(charCode...)`根据编码返回字符串

	>ECMAScript 5 (2009) 允许对字符串的属性访问 `[ ]`，如`str[0]`
	>用属性访问有点不太靠谱：
	> 
	> 不适用 Internet Explorer 7 或更早的版本 它让字符串看起来像是数组（其实并不	是） 如果找不到字符，`[ ]` 返回 `undefined`，而 `charAt()` 返回空字符串。 
	> 它是只读的。`str[0] = "A"` 不会产生错误（但也不会工作！）
	> 如果您希望按照数组的方式处理字符串，可以先把它转换为数组。
+ 把字符串转换为数组：`string.split(separator,limit)`
以`separator`分割，改参数可以是字符串或正则表达式，`limit`限制被分割的片段数量，返回元素为字符串的数组。
+ 提取字符串：`string.slice(start, end)`，`string.substring(start, end)`，`string.substr(start, length)`
`start`**开始**提取位置，`end`**最后**一个字符的位置，如果为负数则与`string.length`相加，即倒数位置，`length`要提取的字符串**长度**。
不改变原字符串，将提取结果以新字符串返回。

	> `substring()` 类似于 `slice()`。不同之处在于 `substring()` 无法接受负的索引。
	> `substr()` 类似于 `slice()`。不同之处在于第二个参数规定被提取部分的长度。
+ 替换：`replace(seachValue,replaceValue)`
`seachValue`可以是**字符串**或**正则表达式**，`replaceValue`可以是**字符串**或一个**函数**。
当`replaceValue`是一个**字符串**，字符`$`拥有特别含义：

	```javascript
	var oldareacode = /\((\d{3})\)/g;
	var p = '(555)666-1212'.replace(oldareacode,'$1-');
	//p 是 '555-666-1212'
	```
	美元符号序列 |替换对象
	----|-----
	$`$$`|$
	$`$&`|整个匹配文本
	$`$number`|分组捕获的文本
	$``$` ``|匹配之前的文本
	$`$'`|匹配之后的文本

	如果`replaceValue`是一个**函数**，那么每次遇到一次匹配函数就会调用一次，该函数返回的字符串用作替换文本，在下一个参数是分组2捕获的文本、
	

	```javascript
	var old = 'hello World';
	var p = old.replace('hello',function (c){
    	console.log(c);//hello
    	return 'Hello'    
		})
	console.log(p);//Hello World
	```

	>`replace()` 只替换首个匹配
	>默认地，`replace()` 对大小写敏感。
	>如需执行大小写不敏感的替换，请使用正则表达式 `/i`,请注意正则表达式不带引号。如：`replace(/he/i,'she')`
	>如需替换所有匹配，请使用正则表达式的 `/g` 标志（用于全局搜索)。如：`replace(/he/g,'she')`
+ 转换大小写：`toUpperCase()`,`toLowerCase()`
+ 连接字符串：`concat()`与`+`等效
+ 删除字符串两端的空白符：`String.trim()`
	> Internet Explorer 8 或更低版本不支持 `trim()` 方法。
	> 如需支持 IE 8，您可搭配正则表达式使用 `replace()` 方法代替：
	> `str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '')`; 
+ 匹配：`string.match(regexp)`方法让字符串与一个正则表达式匹配。根据g表示来决定如何匹配，如果没有`g`表示，那么结果与`regexp.exec(string)`的结果相同。否则会生成包含所有匹配的数组。

#### 多行字符串和模板字符串
ES6语法

```javascript
`这是一个
多行
字符串`;
```

```javascript
var name = '小明';
var age = 20;
var message = `你好, ${name}, 你今年${age}岁了!`;
message === '你好,小明,你今年20岁了'; //true
```
### boolean
布尔值只有`true`和`false`
```javascript
true; // 这是一个true值
false; // 这是一个false值
2 > 1; // 这是一个true值
2 >= 3; // 这是一个false值
```
几个tips
+ `NaN`这个特殊的Number与所有其他值都不相等，包括它自己
```javascript
NaN === NaN; // false
```
+ 唯一能判断`NaN`的方法是通过`isNaN()`函数：

```javascript
isNaN(NaN); // true
```

+ 最后要注意浮点数的相等比较：

```javascript
1 / 3 === (1 - 2 / 3); // false
```

> 这不是JavaScript的设计缺陷。浮点数在运算过程中会产生误差，因为计算机无法精确表示无限循环小数。要比较两个浮点数是否相等，只能计算它们之差的绝对值，看是否小于某个阈值：

```javascript
Math.abs(1 / 3 - (1 - 2 / 3)) < 0.0000001; // true
```
### null和undefined
`null`表示一个“空”的值
`undefined`表示值未定义

> JavaScript的设计者希望用null表示一个空的值，而undefined表示值未定义。事实证明，这并没有什么卵用，区分两者的意义不大。大多数情况下，我们都应该用null。undefined仅仅在判断函数参数是否传递的情况下有用。

### 数组
数组是一组按顺序排列的集合，集合的每个值称为元素。JavaScript的数组可以包括任意数据类型。

```javascript
var misc = [1, 2, 3.14, 'Hello', null, true，['',''],{'':''}];
misc.length  //8
misc[0] //1
misc[8] //undefined
```
与大多数其他语言不同，JavaScript的数组没有上界
```javascript
var myArray = [1,2,3,4,5];
myArray.length; // 5
myArray[10000] = true;
myArray.length; //10001
myArray.length = 3;//myArray是['1','2','3']
```
数组专题
数组拥有方法 [查看](https://www.w3school.com.cn/js/js_array_methods.asp)
数组的排序 [查看](https://www.w3school.com.cn/js/js_array_sort.asp)
 数组的遍历 [查看](https://www.w3school.com.cn/js/js_array_iteration.asp)

### 对象
JavaScript的对象是一组由键-值组成的无序集合，例如：

```javascript
var person = {
    name: 'Bob',
    age: 20,
    tags: ['js', 'web', 'mobile'],
    city: 'Beijing',
    hasCar: true,
    zipcode: null
};
```


