---
title: Babel原理浅析二 (手写一个极简插件)
date: 2021-04-09 23:16:10
index_img: /img/blogCovers/babel.svg
tags: [JavaScript, Babel, 前端工程化]
categories: [源码解读]
---

我们在[上文](https://luoluoqinghuan.cn/2021/04/01/howBabelWork_parser/)中已经了解到babel的第一步，将代码解析成AST，接下来的两步就比较好理解了，转换与生成。我再看最开始的代码。

```javascript
const { parse } = require("./packages/babel-parser");
const traverse = require("./packages/babel-traverse").default;
const generate = require("./packages/babel-generator").default;

const code = "const square = n => n * n";

// parse the code -> ast
const ast = parse(code);

console.log(`originAST: ${JSON.stringify(ast)}`);
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

console.log(`newAST: ${JSON.stringify(ast)}`)
// generate code <- ast
const output = generate(ast, code);
console.log(output.code);
// const square = function (n) {
//     return n * n;
//   };
```

转换这里的代码其实是`babel-plugin-transform-arrow-functions`的源码，作用是将箭头函数转换成普通函数，我们分别将转换前后的AST打印出来，比较看一下这个插件对AST做了什么。
![astCompared](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/408772caac94408eb086119c22020f6c~tplv-k3u1fbpfcp-watermark.image?)

转后的AST结构发生了变化，这就是转换阶段babel的作用，将源代码的AST按照[标准规范](https://github.com/estree/estree)转换成目标代码的AST。看到这儿，我们其实已经可以手写一个简单的插件来玩玩了。

我们新建一个文件`replaceN2M.js`
```javascript
module.exports = function () {
  return {
    // visitor 遍历回调
    visitor: {
      // type === 'Identifier' step into
      Identifier(path) {
        // n -> m
        if (path.isIdentifier({ name: "n" })) {
          path.node.name = "m";
        }
      },
      // type === 'BinaryExpression' step into
      BinaryExpression(path) {
        // * -> -
        if (path.node.operator === "*") {
          path.node.operator = "-";
        }
      },
    },
  };
};
```
一个最简单的插件就完成了，它做了两件事，将所有变量`n`转换成`m`，将所有二元表达式的运算符`*`转换成`-`。
babel会深度优先遍历AST，期间会调用插件中的`visitor.method`，visitor里存放对AST的操作回调，`Identifier(){}`是指当前AST节点的`type === 'Identifier'`时，进入此函数，此时`path`为当前位置，`path.node`为此节点，那么我们就可以对node进行操作。

我们新建一个文件`test2.js`，看下我们的插件是否起作用
```javascript
const square = n => n * n
```

自定义的方法有两种方法进行调用，一种是直接使用babel编译命令，`npx babel --plugins ./replaceN2M.js test2.js`。第二种是，将我们的插件放进babel的配置文件里，在`babel.config.js`的plugin中添加`"./replaceN2M"`，现在整个plugin长这样。
```javascript
plugins: [
      ["@babel/proposal-object-rest-spread", { useBuiltIns: true }],

      convertESM ? "@babel/proposal-export-namespace-from" : null,
      convertESM ? pluginImportMetaUrl : null,

      pluginPackageJsonMacro,

      process.env.STRIP_BABEL_8_FLAG && [
        pluginToggleBabel8Breaking,
        { breaking: bool(process.env.BABEL_8_BREAKING) },
      ],
      needsPolyfillsForOldNode && pluginPolyfillsOldNode,
      "./replaceN2M",
    ].filter(Boolean)
```
然后直接运行 `npx babel test2.js`即可，我们可以看到控制台输出了我们想要的结果，或者，让babel直接编译成文件`npx babel test2.js --out-dir ./ `，再打开`test2.js`看到文件内容已经是编译后的内容。

写一个插件最大的难点在于对babelAPI的不熟悉以及对ECMA规范的不了解，如果要写一个复杂的插件，需要多看看类似插件的实现，强烈推荐[babel插件开发手册](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md#paths)，基本涵盖了开发插件所需要的所有知识。

到这里，我的好奇心基本都已经打消了，转换后的AST怎么重新生成代码，这里就不深入研究了，感兴趣可以直接去看源码。
### References

[Babel插件开发入门指南](https://www.cnblogs.com/chyingp/p/how-to-write-a-babel-plugin.html)

[Step-by-step guide for writing a custom babel transformation](https://lihautan.com/step-by-step-guide-for-writing-a-babel-transformation/)

[Babel 插件开发手册](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md)