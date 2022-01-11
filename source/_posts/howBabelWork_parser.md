---
title: Babel原理浅析一
date: 2021-04-01 23:16:10
index_img: /img/blogCovers/babel.svg
tags: [JavaScript, Babel, 前端工程化]
categories: [源码解读]
---
### 概述
babel可以将ECMAScript2015+的语法，编译成ES5的语法，如：
```javascript
const square = n => n * n;
```
转换为
```javascript
"use strict";

var square = function square(n) {
  return n * n;
};
```
可以在[babel repl](https://babeljs.io/repl#?browsers=defaults%2C%20not%20ie%2011%2C%20not%20ie_mob%2011&build=&builtIns=false&corejs=3.6&spec=false&loose=false&code_lz=MYewdgzgLgBBCOBXAhgJwKYwLwzNgfLjAFS4DcAUEA&debug=false&forceAllTransforms=false&shippedProposals=false&circleciRepo=&evaluate=true&fileSize=true&timeTravel=true&sourceType=module&lineWrap=true&presets=es2015%2Ces2016%2Ces2017&prettier=true&targets=&version=7.16.7&externalPlugins=&assumptions=%7B%7D)进行尝试。

**babel是如何做到的呢**

最自然的想法是这样，js代码实际上就是一长串字符串，babel是将一个字符串替换为另一种字符串，那我们写一个字符串替换的程序对这个字符串进行替换似乎就可以做到。

但如果你下手去写，就会发现无从下手。首先这个替换规则必然非常复杂，正则替换的方式，会让整个正则表达式异常复杂。其次ES6中有一些复杂的语法糖，比如`class`，如何去实现呢，单纯替换是不好去做的。

我们可能要借助一些数据结构(AST)去实现这件事。

babel用了三个运行阶段去做：**解析(parse)**、**转换(transform)**、**生成(generate)**

我们可以在babel源码中调试看一下，先将babel仓库clone到本地，在babel根目录`build`一下。
```bash
yarn install
npm run build
```
新建文件test.js
```javascript
const { parse } = require("./packages/babel-parser");
const traverse = require("./packages/babel-traverse").default;
const generate = require("./packages/babel-generator").default;

const code = "const square = n => n * n";

// parse the code -> ast
const ast = parse(code);

// transform the ast
traverse(ast, {
  enter(path) {
    if (path.node.type !== "ArrowFunctionExpression") return;

    path.arrowFunctionToExpression({
      allowInsertArrow: false,
      noNewArrows: true,
      specCompliant: false,
    });
  },
});

// generate code <- ast
const output = generate(ast, code);
console.log(output.code);
// const square = function (n) {
//     return n * n;
//   };
```
运行一下这段代码，可以看到在控制台打印出了转换后的代码，`parse`、`traverse`、`generate`分别对应转换过程的三个阶段，下面我尝试讲解下这个三个具体过程。
```javascript
code -> AST -> transformed AST -> transformed code
```

### 解析

解析阶段分为两步，词法分析(lexical analysis)、语法分析(syntax analysis)，最终将一个js文件解析成为一棵抽象语法树(AST)。

第一个术语出现了，什么是AST，如果你看过《VS CODE权威指南》，可能对这个词会有点印象，AST会包含分析某段代码所包含的所有必要信息（关键词，变量名，变量值等），并剔除无用信息（标点符号，注释等），眼见为实，先来用babel的解析器生成一棵AST，这部分代码都在[babel/packages/babel-parser](https://github.com/babel/babel/tree/main/packages/babel-parser)中。


我们在test.js中将ast打印出来
```javascript 
console.log(ast)
```
可以看到babel解析器输出了AST。它非常的长，我们只有一行函数声明，它对应的AST竟然有近200行。我们去掉一些代码位置信息，分析一下这个精简版AST。
```json
{
    "type": "File",
    "program": {
        "type": "Program",
        "sourceType": "script",
        "body": [
            {
                "type": "VariableDeclaration",
                "declarations": [
                    {
                        "type": "VariableDeclarator",
                        "id": {
                            "type": "Identifier",
                            "name": "square"
                        },
                        "init": {
                            "type": "ArrowFunctionExpression",
                            "id": null,
                            "generator": false,
                            "async": false,
                            "params": [
                                {
                                    "type": "Identifier",
                                    "name": "n"
                                }
                            ],
                            "body": {
                                "type": "BinaryExpression",
                                "left": {
                                    "type": "Identifier",
                                    "name": "n"
                                },
                                "operator": "*",
                                "right": {
                                    "type": "Identifier",
                                    "name": "n"
                                }
                            }
                        }
                    }
                ],
                "kind": "const"
            }
        ]
    }
}
```
每一个代码块都有一个type字段，标识这个代码块的类型，如`Program`程序、`VariableDeclaration`变量声明、`ArrowFunctionExpression`箭头函数、`BinaryExpression`二项式等，每个代码块的结构不是相同的，比如`BinaryExpression`的内容是`left`、`right`、`operator`，代表`n * n`，`ArrowFunctionExpression`的内容有`params`、`body`，代表`(...params) => body`。

看到这，我们已经明白AST是个什么数据结构了
+ n叉树。
+ 每个节点包含至少两种信息，`type`节点类型、描述该类型所需要的信息（在后面的AST->code阶段，这些信息足够我们去重新生成代码）。

笔者最近的工作是开发一个低代码平台，看到这个结构是非常亲切呀，跟我们平台底层配置项的数据结构可太像了，不了解低代码平台的的可以看下[这里](https://juejin.cn/post/6925306474524737543)，另外，我有突然想到[浏览器解析过程](https://developer.mozilla.org/en-US/docs/Web/Performance/How_browsers_work#building_the_dom_tree)会将html文件、css文件解析为DOM树与CSSOM树，这两棵树也可能是AST。

任何语言都可以被解析成AST，AST是各种语言解析编译运行过程中，都会有的中间产物，那么它是怎么生成的呢？
*注：下面的过程为理论推演过程，跟babel的具体实现不完全相同*

两步：**词法解析**、**语法解析**


![lexicalAnalysis](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b17b20db033642368a0a4d69a2ddd737~tplv-k3u1fbpfcp-watermark.image?)

词法解析（lexical analysis），顾名思义，是对单词本义的解析，首先扫描器（scanner）会对代码进行扫描操作，把代码分割成一个个有意义的词（lexemes），如：单词，标点等。`const square = n => n * n;`会被分割成`[const, squara, =, n, =, >, n, *, n]`。这个过程跟这段代码是用什么语言写的没有关系。随后标识器（tokenizer）会对lexemes进行释义，比如：`const`会被标识为关键字、`=, >`两个符号会标识为箭头，这个过程就与使用的语言有关了，`const`在js中会被标识为关键字，但在c语言中就不会，因为c语言中没有这个关键字。最后输出(tokens)为
```javascript
[
    {
        "type": "Keyword",
        "value": "const"
    },
    {
        "type": "Identifier",
        "value": "square"
    },
    {
        "type": "Punctuator",
        "value": "="
    },
    {
        "type": "Identifier",
        "value": "n"
    },
    {
        "type": "Punctuator",
        "value": "=>"
    },
    {
        "type": "Identifier",
        "value": "n"
    },
    {
        "type": "Punctuator",
        "value": "*"
    },
    {
        "type": "Identifier",
        "value": "n"
    },
    {
        "type": "Punctuator",
        "value": ";"
    }
]
```
当我们有了tokens，就可以进行语法解析（syntax analysis）了，解析器（parser）会把tokens转换为一棵解析树（parse tree），也可以称之为具体语法树(CST, concrete syntax tree)
![syntaxTree](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/04039762baf24be6adbc2fc0c80da617~tplv-k3u1fbpfcp-watermark.image?)
如果仔细看这棵CST，可以看到很多无用信息，比如，有很多节点只有一个子节点，那这种节点完全可以压缩去掉，因为它没有给我们提供额外的有用信息。
![cstAfterCompress](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8bbe883ca20c47bfbe50c741f734d6a3~tplv-k3u1fbpfcp-watermark.image?)
压缩后继续来看这棵树，可以发现一些标点符号与操作符可以用n叉树本身的结构就可以代表，所以再来简化一下。
![ast](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/69b9d88e7e824353980fb4455607812e~tplv-k3u1fbpfcp-watermark.image?)
得到了最终我们想要的结构，一棵非常抽象（相较于CST）、简化的AST。

可以在[这个网站](https://esprima.org/demo/parse.html?code=const%20square%20%3D%20n%20%3D%3E%20n%20*%20n%3B%0A)，输入随便一段代码，看看对应的tokens与AST。

得到AST后，我们就可以对AST进行操作，将其转换成我们想要的代码所对应的结构，这部分就是转换。。。

### References
[Leveling Up One’s Parsing Game With ASTs](https://medium.com/basecs/leveling-up-ones-parsing-game-with-asts-d7a6fc2400ff)

[Babel under the hood](https://medium.com/@makk.bit/babel-under-the-hood-63e3fb961243)

[Babel插件开发入门指南](https://www.cnblogs.com/chyingp/p/how-to-write-a-babel-plugin.html)

[Step-by-step guide for writing a custom babel transformation](https://lihautan.com/step-by-step-guide-for-writing-a-babel-transformation/)

[Babel 用户手册](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/zh-Hans/user-handbook.md)