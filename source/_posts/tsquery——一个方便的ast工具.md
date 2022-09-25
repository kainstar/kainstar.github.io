---
title: tsquery——一个方便的ast查询工具
date: 2018-09-15 15:06:05
categories: 技思
tags: [TypeScript, ast]
keywords: TypeScript,tsquery,ast
cover:
---

## 前言

最近在给公司的 web 框架做一个 vscode 的辅助插件，其中有个对需要路由一些文件进行解析，实现配置文件和对应文件的关联信息显示和跳转的功能。既然是对文件进行解析，很自然就会想到使用 ast 的方式来做，加上需要对 TypeScript 也进行支持，我便选择了使用 TypeScript 自带的 ast 工具来进行解析。

在一开始我通过 ts 的`forEachChild`方法遍历和对比节点的`kind`属性来确定是否是我需要处理的节点，但是之后发现这个方式有几个缺点：

1. 当需要查找满足条件的子级的 ast 节点时，需要做多次比较
2. 对满足某一条件的多个不同类型的节点需要比较多次，编写满足条件麻烦
3. 对分布在同一文件中的多个同名标识符，不能统一提取和处理

为了解决这些，我找到并引入了[`tsquery`](https://github.com/phenomnomnominal/tsquery)这个库，它是 TypeScript 版的[`esquery`](https://github.com/estools/esquery)，能够让我们使用 css 选择器的方式来快速查询满足指定条件的 TypeScript ast 节点（也支持 JavaScript）。

<!-- more -->

## 比较 demo

在介绍 tsquery 的使用方式之前，我们先来看一个对比。

对下面这段简单的代码：

```ts code.ts
class Animal {
  constructor(public name: string) {}
  move(distanceInMeters: number = 0) {
    console.log(`${this.name} moved ${distanceInMeters}m.`);
  }
}
```

若我们要查找到 Animal 这个类的构造函数的所有参数并打印它们的名称，在使用 tsquery 之前，我们会编写这样一段代码：

```ts tsAnalyze.ts
import {
  ClassDeclaration,
  createSourceFile,
  Node,
  ScriptTarget,
  ConstructorDeclaration,
  SyntaxKind,
} from "TypeScript";
import { code } from "./code";

const sourceFile = createSourceFile(
  "fileName",
  code,
  ScriptTarget.Latest,
  true
);
sourceFile.forEachChild(findClass);

function findClass(node: Node): void {
  if (node.kind === SyntaxKind.ClassDeclaration) {
    const { name } = node as ClassDeclaration;
    if (name && name.text === "Animal") {
      node.forEachChild(findConstructor);
      return;
    }
  }
  node.forEachChild(findClass);
}

function findConstructor(node: Node): void {
  if (node.kind === SyntaxKind.Constructor) {
    printParameters(node as ConstructorDeclaration);
  }
}

function printParameters(node: ConstructorDeclaration) {
  node.parameters.forEach((parameter) => {
    console.log(parameter.name.getText());
  });
}
```

而在我们引入了 tsquery 之后，只需要下面这么几行简单的代码：

```ts tsqueryAnalyze.ts
import { tsquery } from "@phenomnomnominal/tsquery";
import * as ts from "TypeScript";
import { code } from "./code";

const parameters = tsquery.query<ts.ParameterDeclaration>(
  code,
  'ClassDeclaration[name.name="Animal"] > Constructor > Parameter'
);
parameters.forEach((param) => console.log(param.name.getText()));
```

怎么样，是不是对比强烈，让你迫不及待得想把 tsquery 用到自己的项目中？

## 使用方式

那么接下来，我就来介绍一下如何去使用 tsquery：

### API

tsquery 对象提供了下面几个方法：

- ast:

```ts
function ast(source: string, fileName?: string): SourceFile;
```

ast 方法的功能如同其名，就是接收源代码，返回一个解析后的 ast 语法树，实际上就是调用了 ts 的`createSourceFile`方法。

- parse:

```ts
function parse(selector: string, options?: TSQueryOptions): TSQuerySelectorNode;
```

parse 方法接收一个规则字符串，这个字符串会被解析成 tsquery 的选择器对象并返回，再被用于下面的 match 方法中。

- match:

```ts
function match<T extends Node = Node>(
  ast: Node | TSQueryNode<T>,
  selector: TSQuerySelectorNode,
  options?: TSQueryOptions
): Array<TSQueryNode<T>>;
```

match 方法接收一个 ast 对象和一个 parse 解析后得到的选择器对象，返回从 ast 中搜索得到的所有满足选择器条件的节点的数组。

结合上面三个函数，我们可以得到 tsquery 的基本使用方法：

```ts
const ast = tsquery.ast(code); // 获得ast语法树
const selector = tsquery.parse(selectorStr); // 获得选择器
const result = tsquery.match(ast, selector); // 查找节点
```

如果语法树和选择器可能被多次使用，则建议使用变量将它们分别保存下来，避免重复解析导致的资源浪费和时间开销（ast 的生成和遍历还是比较花时间的）。

如果语法树和选择器不会被重复使用，那么可以使用更简单的方法 `query`。

- query:

```ts
function query<T extends Node = Node>(
  ast: string | Node | TSQueryNode<T>,
  selector: string,
  options?: TSQueryOptions
): Array<TSQueryNode<T>>;
```

query 封装了 ast、parse 和 match 三个方法，可以更方便地完成一次查询，同时 tsquery 自身也是一个 query 方法。

```ts
const result = tsquery.query(code, selectorStr);
// const result = tsquery(code, selectorStr);
```

### 选择器规则

- 通用选择器

和 css 中的一样，`*`表示选择所有的节点。

- AST 节点类型选择器

你可以直接使用一个 ast 节点的类型来当作查询的选择器，例如：类声明: `ClassDeclaration`，变量声明：`VariableDeclaration`等，就跟你使用 css 选择器选择某种 HTML 元素一样。

- 属性选择器

tsquery 支持使用 css 中属性选择器的方式来搜索满足属性条件的节点，你可以仅仅只声明一个属性的名称（例如：`[text]`），也可以指定属性的值所满足的条件（例如：`[text="foo"]`），其中操作符可以是`=`、'!='、'>'、'<'、'<='、'>='，值也可以是字符串、数字、正则表达式中的任意一种。
tsquery 支持多级的属性选择，所以你也可以使用`.`来组合属性（例如：`[members.length<3]`）。

- 常见的后代、兄弟节点选择器等

后代节点选择器：`node otherNode`
子节点选择器：`node > otherNode`
同级节点选择器：`node ~ otherNode`
相邻节点选择器：`node + otherNode`
群组选择器：`node, otherNode`

- 各种特殊的选择器

not 选择器：`:not(ClassDeclaration)` 用来选择所有不是类声明的节点
has 选择器：`IfStatement:has([left.text="foo"])` 用来选择含有符合`[left.text="foo"]`属性选择器的子节点的 if 语句
第 n 个节点的选择器：包含 `:first-child`、`:last-child`、`:nth-child(n)`、`:nth-last-child(n)` 这几种选择器，其中需要注意的是，tsquery 并不支持`an+b`这种类型的序号匹配
类型选择器：区分于 AST 节点类型选择器，这个选择器是用来选择某种共通类型的（比如所有声明、所有表达式等），目前支持的有`:statement`, `:expression`, `:declaration`, `:function`, 和 `:pattern`

以上所有的选择器都可以混合使用

## 总结

tsquery 是一个非常方便和值得使用的 ast 辅助工具，它使用极为简单的 api 和学习成本较低的选择器规则，提供了对抽象和复杂的 AST 语法树较强的查询能力，可以在我们对 AST 进行处理时节省大量的编写成本。

如果你对 tsquery 的选择器规则抱有疑问，可以在 [TSQuery Playground](https://tsquery-playground.firebaseapp.com/) 上进行在线的测试。

**参考内容：**

- [Easier TypeScript tooling with TSQuery](https://medium.com/@phenomnominal/easier-TypeScript-tooling-with-tsquery-d74f04f2b29d)

在文章最后打个招聘广告：

有赞招聘前端工程师，实习、校招、社招都可，具体要求可以参考[https://job.youzan.com/](https://job.youzan.com/)，同时您也可以将简历投递到我的内推邮箱：zhangshikai@youzan.com
