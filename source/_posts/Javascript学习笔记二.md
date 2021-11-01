---
title: Javascript学习笔记二
date: 2020-02-11 16:26:09
index_img: /img/blogCovers/js1.jpg
tags: [JavaScript]
categories: [学习笔记]
---

数组是值的有序集合。每个值叫做一个元素，而每个元素在数组中的位置，以数字表示，称为索引。
JavaScript数组是JavaScript对象的特殊形式，数组索引实际上和碰巧是整数的属性名差不多。通常，数组的实现是经过优化的，用数字索引来访问数组元素一般来说比访问常规的对象属性要快很多
JavaScript数组可以包含任意数据类型



## 创建数组
1. 使用数组字面量`[]`
JavaScript数组可以包含任意数据类型
	```javascript
	var arr = [1,2,'hello',null,undefined,true,{'hei':'黑'},[1,2]];
	arr.length;//8
	```
	如果直接省略数组中某个值将被赋予`undefined`值
	

	```javascript
	var count=[1,,3];
	count[1];//undefined
	var undefs = [,,];//数组有个两个元素都是undefined,索引已经定义
	```
	因为数组字面量语法允许有可选的结尾的逗号，故`[,,]`只有两个元素而非三个
2. 调用构造函数`Array()`

	```javascript
	var a = new Array()//空数组，等同于数组字面量[].
	var b = new Array(10)//创建指定长度的数组，此时数组中没有元素，甚至索引属性‘0’、‘1’都未定义
	b.length();//10
	0 in b;//false
	var c = new Array(1,2,'hello',null,undefined,true,{'hei':'黑'},[1,2])
	//创建一数组，构造函数的参数将会成为新数组的元素，使用个数组字面量比使用构造函数要简单
	```
## 数组的读写
使用`[]`操作符来访问修改数组中的一个元素

```javascript
arr[0];//读取下标为0的元素，1
arr[8] = 'end';//在下标为8的地方写入数据
arr.length;//9
arr[-1.23] = true;//这将创建一个名为‘-1.23’的属性
arr['1000'] = 0;
arr.length;//9,不变
arr[1.000];//与a[1]相等
```
## 数组的长度
每个数组有一个`length`属性，就是这个属性使其区别于其他常规的JavaScript对象。

```javascript
arr.length;//9
arr.length = 3;//现在arr为[1,2,'hello']
arr.length = 0;//删除所有元素，a为[];
arr.length = 5;//长度为5，没有元素，就像new Array(5)
```
## 数组元素的添加和删除
- 添加
1. 添加数组元素最简单的方法：为新索引赋值：

	```javascript
	a = []   //空数组
	a[0] = 1;//[1]
	a[2] = 2;//[1,,2]
	```

2. 使用`push()`和`pop()`

	```javascript
	a = [0];
	a.push(1);//向末尾添加一个元素。 [0,1]
	a.unshift(0);//向开头添加一个元素。[0,0,1]
	```

- 删除
1. `delete()`,类似于赋值undefined，不会影响数组长度

	```javascript
	a =[1,2,3];
	delete a[1];
	1 in a;//false
	a.length;//3
	```
2. `pop()` `shift()`

	```javascript
	a = [1,2,3];
	a.shift();//移除开头元素,[2,3]
	a.pop();//移除末尾元素，[2]
	```
最后一个可删除，可添加的方法`splice()`,详细内容往下看
## 数组的遍历
1. `for`循环
最常用
2. `for in`循环，遍历的是索引
for in可以遍历对象，也可遍历数组，但遍历数组的时候有些问题

	> 1.index索引为字符串型数字，不能直接进行几何运算
	> 2.遍历顺序有可能不是按照实际数组的内部顺序
	> 3.使用for in会遍历数组所有的可枚举属性，包括原型。所以for in更适合遍历对象，不要使用for in遍历数组

3. `for of`循环（ES6），遍历的是元素。

	```javascript
	Array.prototype.method=function(){
	　　console.log(this.length);
	}
	var myArray=[1,2,4,5,6,7]
	myArray.name="数组";
	for (var value of myArray) {
	  console.log(value);
	}
	//1 2 4 5 6 7
	```

	> 	记住，for in遍历的是数组的索引（即键名），而for of遍历的是数组元素值。
	> 
	> for of遍历的只是数组内的元素，而不包括数组的原型属性method和索引name
4. `forEach()` (ES5)
	
	```javascript
	var a = ['A', 'B', 'C'];
	a.forEach(function (element) {
	    console.log(element);
	});//A,B,C
	```
	forEach()方法无法再所有元素都传递给调用函数之前终止遍历。也就是说，没有像for循环中使用的相应的break语句。如果要提前终止，必须把forEach()方法放在一个try中，并抛出一个异常。
## 数组方法
- `Array.concat(item...)`
该方法产生一个新数组，它包含一份array的赋值并把一个或多个item附加在它后面

	```javascript
	var a = ['A', 'B', 'C'];
	var b = ['x','y','z'];
	var c = a.concat(b,true);
	//['A', 'B', 'C','x','y','z',true]
	```

- `Array.join(separator)`
把一个array构造成一个字符串。他把array中的每个元素使用`separator`连接起来，构成一个字符串，默认的`separator` 是`,`，无间隔连接使用空字符串`''`

	```javascript
	var a = ['A', 'B', 'C'];
	var c = a.join('');//'ABC'
	```
- `Array.reverse()`
翻转array里的元素的排序，并返回array本身：

	```javascript
	var a = ['A', 'B', 'C'];
	a.reverse();//a和b都是['C','B','A']
	```
- `Array.slice(start,end)`
对array中的一段做浅复制。首先复制`array[start]`,一直复制到`array[end]`为止。`end`参数是可选的，默认是该数组的长度`array.length`。
	
	```javascript
	var a = ['A', 'B', 'C'];
	b = a.slice(0,1);//['A']
	c = a.slice(1);//['B','C']
	d = a.slice(4);//[]
	```
- `Array.sort(comparefn)`
`sort`方法对array中的内容进行排序。他不能正确的给一组数字排序：

	```javascript
	var a = [4,8,15,16,23,42];
	a.sort();//Array(6) [15, 16, 23, 4, 42, 8]
	```
	JavaScript的默认比较函数把要排序的元素都视为字符串。，比较数字的时候，会把他们转换为字符串，于是得到了一个错误结果。
	幸运的是可以使用自己的比较函数，你的比较函数接受两个参数，并且如果相等返回0，如果第一个参数在前，则返回一个负数，如果第二个参数应在前，则返回一个正数。
	```javascript
	var a = [4,8,15,16,23,42];
	a.sort(function(a,b){
	    return a-b
	});//Array(6) [4, 8, 15, 16, 23, 42]
	```
- `array.splice (start,deleteCount,item...)`
`splice`方法从array中移除一个或者多个元素，并使用新的item替换他们。参数`start`是从数组array中移除元素的开始位置。参数`deleteCount`是要移除的元素个数。如果有额外参数那些`item`会插入到被移除元素的位置上

	```javascript
	var arr = ['Microsoft', 'Apple', 'Yahoo', 'AOL', 'Excite', 'Oracle'];
	// 从索引2开始删除3个元素,然后再添加两个元素:
	arr.splice(2, 3, 'Google', 'Facebook'); // 返回删除的元素 ['Yahoo', 'AOL', 'Excite']
	arr; // ['Microsoft', 'Apple', 'Google', 'Facebook', 'Oracle']
	// 只删除,不添加:
	arr.splice(2, 2); // ['Google', 'Facebook']
	arr; // ['Microsoft', 'Apple', 'Oracle']
	// 只添加,不删除:
	arr.splice(2, 0, 'Google', 'Facebook'); // 返回[],因为没有删除任何元素
	arr; // ['Microsoft', 'Apple', 'Google', 'Facebook', 'Oracle']
	```
- `map()`(ES5)
举例说明，比如我们有一个函数f(x)=x^2^，要把这个函数作用在一个数组[1, 2, 3, 4, 5, 6, 7, 8, 9]上，就可以用map实现如下:
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200214165103406.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2pvaG5ueV9tdQ==,size_16,color_FFFFFF,t_70)

	```javascript
	function pow(x) {
	    return x * x;
	}
	var arr = [1, 2, 3, 4, 5, 6, 7, 8, 9];
	var results = arr.map(pow); // [1, 4, 9, 16, 25, 36, 49, 64, 81]
	console.log(results);
	```
- `filter()`
它用于把Array的某些元素过滤掉，然后返回剩下的元素。
和`map()`类似，Array的`filter()`也接收一个函数。和`map()`不同的是，`filter()`把传入的函数依次作用于每个元素，然后根据返回值是`true`还是`false`决定保留还是丢弃该元素。

	```javascript
	//删除偶数，保留奇数
	var arr = [1, 2, 4, 5, 6, 9, 10, 15];
	var r = arr.filter(function (x) {
	    return x % 2 !== 0;
	});
	r; // [1, 5, 9, 15]
	```
	`filter()`接收的回调函数，其实可以有多个参数。通常我们仅使用第一个参数，表示Array的某个元素。回调函数还可以接收另外两个参数，表示元素的位置和数组本身：
	

	```javascript
	//去处Array的重复元素
	var r,arr = ['apple', 'strawberry', 'banana', 
		'pear', 'apple', 'orange', 'orange', 'strawberry'];
	r = arr.filter(function (element, index, self) {
	    return self.indexOf(element) === index;
	});
	```
- `every()`与`some()`
`every()`方法像是数学中的量词 $\forall$：当且仅当对数组中的所有元素调用判定函数都返回`true`，他才返回`true`

	```javascript
	var arr = ['Apple', 'pear', 'orange'];
	console.log(arr.every(function (s) {
	    return s.length > 0;
	})); // true, 因为每个元素都满足s.length>0
	```
	`some()`方法则像数学中的量词 $\exists$：当数组中至少有一个元素调用判定函数返回`true`，他就返回`true`，否则返回`false`
	

	```javascript
	var arr = ['Apple', 'pear', 'orange'];
		console.log(arr.every(function (s) {
		    return s.length <5;
		})); // true, 因为存在'pear'长度小于5
	```
- `reduce()`和`reduceRight()`
 Array的`reduce()`把一个函数作用在这个Array的`[x1, x2, x3...]`上，这个函数必须接收两个参数，`reduce()`把结果继续和序列的下一个元素做累积计算，其效果就是：

	```
	[x1, x2, x3, x4].reduce(f) = f(f(f(x1, x2), x3), x4)
	```

	```javascript
	//用reduce求和
	var arr = [1, 3, 5, 7, 9];
	arr.reduce(function (x, y) {
	    return x + y;
	}); // 25
	```
	`reduceRight()`的原理相同，只是方向相反
- `find(function(currentValue, index, arr))`（ES6）、`findIndex(function(currentValue, index, arr))`（ES6）、`indexOf(item,start)`、`lastIndexOf(item,start)`和`includes(searchElement, fromIndex)`
`find()` 方法返回数组中满足提供的测试函数的第一个元素的值。`currentValue`必选参数，当前元素。`index`可选参数，当前元素索引。

	```javascript
	var ages = [3, 10, 18, 20];
	function checkAdult(age) {
	    return age >= 18;
	}
	var value = ages.find(checkAdult);
	//18
	```
	`findIndex()`方法返回数组中满足提供的测试函数的第一个元素的索引。否则返回`-1`
	

	```javascript
	var ages = [3, 10, 18, 20];
	function checkAdult(age) {
		    return age >= 18;
		}
	var value = ages.findIndex(checkAdult);
		//2
	```
	`indexOf()`方法返回在数组中可以找到给定元素的第一个索引，如果不存在，则返回`-1`，`item`是要找的元素，`start`是开始位置（可选，默认`0`）
	```javascript
	var fruits=["Banana","Orange","Apple","Mango","Banana","Orange","Apple"];
	var a = fruits.indexOf("Apple",4);//6
	```
	`lastIndexOf()` 方法可返回一个指定的元素在数组中最后出现的位置，从该字符串的后面向前查找。如果要检索的元素没有出现，则该方法返回 `-1`
	```javascript
	var fruits=["Banana","Orange","Apple","Mango","Banana","Orange","Apple"];
	var a = fruits.lastIndexOf("Apple",4);//2
	```
	`includes()` 方法用来判断一个数组是否包含一个指定的值，如果是返回 `true`，否则`false`。`searchElement` 必须参数，需要查找的元素值。`fromIndex` 可选参数，从该索引处开始查找
	```javascript
	[1, 2, 3].includes(2);     // true
	[1, 2, 3].includes(4);     // false
	[1, 2, 3].includes(3, 3);  // false
	[1, 2, 3].includes(3, -1); // true
	[1, 2, NaN].includes(NaN); // true
	```
- `Array.isArray(obj)`
	isArray() 方法用于判断一个对象是否为数组。如果对象是数组返回 true，否则返回 false。
	```javascript
	Array.isArray([]) ;// true
	Arrray.isArray({});//false
	```
## 类数组对象
JavaScript数组的有一些特性是其他对象没有的：

- 当有新的元素添加到数组时，自动更新length属性。
- 设置length为一个较小值将截断数组。
- 从Array.prototype 中级证一些有用的方法。
- 其类属性为‘Array’ 
