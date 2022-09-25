---
title: 关于express路由管理的几种自动化方法
date: 2018-02-17 11:12:35
categories: 技思
tags: [nodejs]
keywords: express,路由管理
---

## 前言

我们平时在使用 express 写代码的过程中，会根据类别，将路由分为多个不同的文件，然后在项目的入口文件（例如 app.js）中将其依次挂载，例如：

```js
const index = require("./routes/index");
const user = require("./routes/user");
// ...其他路由文件

app.use("/", index);
app.use("/user", user);
// ...挂载其他路由
```

但是当路由文件过多时，这样写会多出很多重复性的代码，而且当我添加一个新的路由模块时，除了编写路由文件本身，还需要到 app.js 入口文件中将新路由文件挂载上去，不够灵活，因此，我们需要想一些办法来管理我们的路由，使其能够自动化，免除频繁修改入口文件的操作。

<!-- more -->

## 管理思路

我们的项目目录主要是这样的：

```
├─routes
  ├─index.js
  ├─user.js
  ├─sub
    ├─index.js
    ├─a.js
├─app.js
```

首先，我们来看一下，express 的路由管理主要由三部分组成，路由方法（method）、路由路径（path）和路由处理器（handle），一般情况下，路由方法和路由处理器是由路由文件自己来管理，在一个路由文件中，我们经常使用这样的写法：

```js
// routes/user.js
const express = require("express");
const router = express.Router();

// 路由的方法，处理器和部分路径
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

module.exports = router;
```

然后在入口文件中添加上共通的路由前缀：

```js
app.use("/user", require("./routes/user"));
```

根据这种思路，我们主要处理的就是路由路径这个部分。在这个部分我们有两种处理方式，一种是根据路径和文件名自动生成路由的共通路径前缀，路由文件只编写剩余不共通部分的路径；还有一种则是路径完全由路由文件自己来管理，在挂载时直接挂载到根路径`'/'`上。

## 管理实例

### 自动生成前缀

我们通过扫描项目目录，可以将文件在项目中的路径转化为 express 的路由路径模式，自动生成路由前缀，例如路由文件`routes/sub/a.js`就会为转化成路由前缀`/sub/a`，路由文件`a.js`中只要编写`/sub/a`后面的路径部分即可。

**项目目录为：**

```
├─routes
  ├─index.js
  ├─user.js
  ├─sub
    ├─index.js
    ├─a.js
├─app.js
├─helper.js
```

**主要的实现代码为：**

```js
// helper.js
const fs = require("fs");
const path = require("path");

/**
 * 将文件名修正为前缀
 *
 * @param {String} filename
 * @returns {String}
 */
function transform(filename) {
  return (
    filename
      .slice(0, filename.lastIndexOf("."))
      // 分隔符转换
      .replace(/\\/g, "/")
      // index去除
      .replace("/index", "/")
      // 路径头部/修正
      .replace(/^[/]*/, "/")
      // 路径尾部/去除
      .replace(/[/]*$/, "")
  );
}

/**
 * 文件路径转模块名（去.js后缀）
 *
 * @param {any} rootDir 模块入口
 * @param {any} excludeFile 要排除的入口文件
 * @returns
 */
exports.scanDirModules = function scanDirModules(rootDir, excludeFile) {
  if (!excludeFile) {
    // 默认入口文件为目录下的 index.js
    excludeFile = path.join(rootDir, "index.js");
  }
  // 模块集合
  const modules = {};
  // 获取目录下的第一级子文件为路由文件队列
  let filenames = fs.readdirSync(rootDir);
  while (filenames.length) {
    // 路由文件相对路径
    const relativeFilePath = filenames.shift();
    // 路由文件绝对路径
    const absFilePath = path.join(rootDir, relativeFilePath);
    // 排除入口文件
    if (absFilePath === excludeFile) {
      continue;
    }
    if (fs.statSync(absFilePath).isDirectory()) {
      // 是文件夹的情况下，读取子目录文件，添加到路由文件队列中
      const subFiles = fs
        .readdirSync(absFilePath)
        .map((v) => path.join(absFilePath.replace(rootDir, ""), v));
      filenames = filenames.concat(subFiles);
    } else {
      // 是文件的情况下，将文件路径转化为路由前缀，添加路由前缀和路由模块到模块集合中
      const prefix = transform(relativeFilePath);
      modules[prefix] = require(absFilePath);
    }
  }
  return modules;
};
```

然后，在路由目录的入口 index 文件下，加入这么一段代码（scanDirModules 方法需要从之前编写的 helper.js 文件中引入）：

```js
const scanResult = scanDirModules(__dirname, __filename);
for (const prefix in scanResult) {
  if (scanResult.hasOwnProperty(prefix)) {
    router.use(prefix, scanResult[prefix]);
  }
}
```

在 app.js 入口文件中只需要将所有路由相关代码改成一句：

```js
app.use("/", require("./routes"));
```

这样就完成了路由前缀的自动生成和路由自动挂载了。

效果展示：

我们将`routes/sub/a.js`的内容定为：

```js
// routes/sub/a.js
const express = require("express");
const router = express.Router();

router.get("/", function (req, res) {
  res.send("sub/a/");
});

module.exports = router;
```

**挂载效果：**

![路由挂载1](%E5%85%B3%E4%BA%8Eexpress%E8%B7%AF%E7%94%B1%E7%AE%A1%E7%90%86%E7%9A%84%E5%87%A0%E7%A7%8D%E8%87%AA%E5%8A%A8%E5%8C%96%E6%96%B9%E6%B3%95/路由挂载1.jpg)

**访问结果：**

![访问结果1](%E5%85%B3%E4%BA%8Eexpress%E8%B7%AF%E7%94%B1%E7%AE%A1%E7%90%86%E7%9A%84%E5%87%A0%E7%A7%8D%E8%87%AA%E5%8A%A8%E5%8C%96%E6%96%B9%E6%B3%95/访问结果1.jpg)

这种自动生成前缀的方法，在路由目录层级不深时，可以起到很好的作用，但是当目录层级较多时，就会暴露出缺点：阅读代码时路由路径不明确，不能直观地看到完整路径，而且生成前缀的灵活性不高。

后者可以使用自定义导出对象和挂载方式的方法来解决，但是前者我暂时没有什么好的解决方法，因此我们来看一下之前提到的另一种自动化方法。

### 直接挂载到根路径

这种方法的扫描思路和前一种方法相似，不同之处在于，在编写路由文件的时候，我们需要写完整路由的路径，例如：

```js
// routes/sub/a.js
const express = require("express");
const router = express.Router();

router.get("/sub/a", function (req, res) {
  res.send("sub/a/");
});

module.exports = router;
```

扫描部分的代码修改为：

```js
exports.scanDirModulesWithoutPrefix = function scanDirModulesWithoutPrefix(
  rootDir,
  excludeFile
) {
  if (!excludeFile) {
    // 默认入口文件为目录下的 index.js
    excludeFile = path.join(rootDir, "index.js");
  }
  const modules = [];
  let filenames = fs.readdirSync(rootDir);
  while (filenames.length) {
    // 路由文件相对路径
    const relativeFilePath = filenames.shift();
    // 路由文件绝对路径
    const absFilePath = path.join(rootDir, relativeFilePath);
    // 排除入口文件
    if (absFilePath === excludeFile) {
      continue;
    }
    if (fs.statSync(absFilePath).isDirectory()) {
      // 是文件夹的情况下，读取子目录文件，添加到路由文件队列中
      const subFiles = fs
        .readdirSync(absFilePath)
        .map((v) => path.join(absFilePath.replace(rootDir, ""), v));
      filenames = filenames.concat(subFiles);
    } else {
      // 是文件的情况下，将模块添加到模块数组中
      modules.push(require(absFilePath));
    }
  }
  return modules;
};
```

路由入口文件修改为：

```js
// 获取 routes 目录下所有路由模块，并挂载到一个路由上
const routeModules = scanDirModulesWithoutPrefix(__dirname, __filename);
routeModules.forEach((routeModule) => {
  router.use(routeModule);
});
```

**挂载效果：**

![路由挂载2](%E5%85%B3%E4%BA%8Eexpress%E8%B7%AF%E7%94%B1%E7%AE%A1%E7%90%86%E7%9A%84%E5%87%A0%E7%A7%8D%E8%87%AA%E5%8A%A8%E5%8C%96%E6%96%B9%E6%B3%95/路由挂载2.jpg)

这种方法可以明确的看到路由的完整路径，在阅读代码时不会出现因为层级过深而导致出现阅读困难的情况，但是明显的缺点就是需要编写大量的路径相关代码，路径重用性又太低。

那么有没有一种方法，既能保证共通路径的重用性，又能保证代码的可阅读性呢？

有，我们可以用 JavaScript 的装饰器（Decorator）来进行路由的管理。

## 装饰器实现路由管理

装饰器的思路来自于 Java 的 MVC 框架`Spring MVC`，在 Spring MVC 中，路由的编写方式是这样的：

```java
// 类上的 RequestMapping 注解用来设置共通的路径前缀
@Controller
@RequestMapping("/")
public class SampleController {

  // 方法上的 RequestMapping 注解用来设置剩余路径和路由方法
  @RequestMapping("/", method=RequestMethod.GET)
  public String index() {
    return "Hello World!";
  }

  // GetMapping 注解相当于已经指定了GET访问方法的 RequestMapping
  @GetMapping("/1")
  public String index1() {
    return "Hello World!1";
  }
}
```

在 ES6 之后，在 js 中编写类已经变得非常容易，我们也可以仿照 Spring MVC 的路由方式来管理 express 中的路由。

### 思路整理

关于 JavaScript 的装饰器，可以参考这两篇文章：

[探寻 ECMAScript 中的装饰器 Decorator](https://github.com/rccoder/blog/issues/23)

[JS 装饰器（Decorator）场景实战](https://juejin.im/post/59f1c484f265da431c6f8940)

在进行实现之前，我们先简单整理一下实现的思路。我的思路是，为了阅读方便，每一个路由文件包括一个类（Controller），每个类上有两种装饰器。

第一种装饰器是在类上添加的，用来将这个类下面的所有方法绑定到一个共通的路由前缀上；

而第二种装饰器则是添加到类中的方法上的，用来将方法绑定到一个指定的 HTTP 请求方法和路由路径上。

这两种装饰器也都接收剩余的参数，作为需要绑定的中间件。

除了编写装饰器本身之外，我们还需要一个注册函数，用来指定需要绑定的 express 对象和需要扫描的路由目录。

### 准备工作

为了使用装饰器这个特性，我们需要使用一些 babel 插件：

```bash
$ yarn add babel-register babel-preset-env babel-plugin-transform-decorators-legacy
```

编写`.babelrc`文件：

```json
{
  "presets": ["env"],
  "plugins": ["transform-decorators-legacy"]
}
```

在 app.js 中注册`babel-register`：

```js
require("babel-register");
```

### 注册函数编写

注册函数的功能较为简单，因此我们先来编写注册函数：

```js
let app = null;

/**
 * 扫描并引入目录下的模块
 *
 * @private
 * @param {string} routesDir 路由目录
 */
function scanDirModules(routesDir) {
  if (!fs.existsSync(routesDir)) {
    return;
  }
  let filenames = fs.readdirSync(routesDir);
  while (filenames.length) {
    // 路由文件相对路径
    const relativeFilePath = filenames.shift();
    // 路由文件绝对路径
    const absFilePath = path.join(routesDir, relativeFilePath);
    if (fs.statSync(absFilePath).isDirectory()) {
      // 是文件夹的情况下，读取子目录文件，添加到路由文件队列中
      const subFiles = fs
        .readdirSync(absFilePath)
        .map((v) => path.join(absFilePath.replace(routesDir, ""), v));
      filenames = filenames.concat(subFiles);
    } else {
      // require路由文件
      require(absFilePath);
    }
  }
}

/**
 * 注册express服务器
 *
 * @param {Object} options 注册选项
 * @param {express.Application} options.app express服务器对象
 * @param {string|Array<string>} options.routesDir 要扫描的路由目录
 */
function register(options) {
  app = options.app;
  // 支持扫描多个路由目录
  const routesDirs =
    typeof options.routesDir === "string"
      ? [options.routesDir]
      : options.routesDir;
  routesDirs.forEach((dir) => {
    scanDirModules(dir);
  });
}
```

通过获取 express 的 app 对象，将其注册到文件的顶级变量 app，可以让其余的装饰器函数访问到 app 对象从而完成路由注册。

`routesDir`可以是字符串也可以是字符串的数组，代表了需要扫描的路由目录，将其转化为字符串数组后依次进行扫描。

`scanDirModules`方法与之前的扫描方法类似，只是这里只需要将路由文件 require 进来就行，不需要返回。

### 装饰器编写

装饰器部分分为两部分，装饰类的路由装饰器`Router`和其余装饰方法的请求处理装饰器（`Get`, `Post`, `Put`, `Delete`, `All`, `Custom`）。

在方法装饰器的编写上，由于装饰器的行为相似，因此我们可以编写一个抽象函数，用来生成不同 HTTP 请求方法的不同装饰器。

抽象函数的具体代码为：

```js
/**
 * 生成对应HTTP请求方法的装饰器
 *
 * @param {string} httpMethod 请求方法
 * @param {string|RegExp} pattern 请求路径
 * @param {Array<Function>} middlewares 中间件数组
 * @returns {MethodDecorator}
 */
function generateMethodDecorator(httpMethod, pattern, middlewares) {
  return function (target, methodName, descriptor) {
    if (!target._routeMethods) {
      target._routeMethods = {};
    }
    // 为自定义方法生成对应的方法存储对象
    if (!target._routeMethods[httpMethod]) {
      target._routeMethods[httpMethod] = {};
    }
    target._routeMethods[httpMethod][pattern] = [
      ...middlewares,
      target[methodName],
    ];
    return descriptor;
  };
}
```

这里的`target`表示类的原型对象，`methodName`则是需要装饰的类方法的名称，我们将类方法和它的前置中间件组成一个数组，存储到类原型对象上的`_routeMethods`属性中，以便类装饰器调用。

要生成一个 HTTP 请求方法的装饰器，只需要调用这个生成函数即可。

例如生成一个 GET 方法的装饰器，则只需要：

```js
/**
 * GET 方法装饰器
 *
 * @param {string|RegExp} pattern 路由路径
 * @param {Array<Function>} middlewares 中间件数组
 * @returns {MethodDecorator}
 */
function Get(pattern, ...middlewares) {
  return generateMethodDecorator("get", pattern, middlewares);
}
```

路由装饰器（类装饰器）的代码为：

```js
/**
 * Router 类装饰器，使用在 class 上，生成一个带有共通前缀和中间件的路由
 *
 * @param {string|RegExp} prefix 路由前缀
 * @param {express.RouterOptions} routerOption 路由选项
 * @param {Array<Function>} middlewares 中间件数组
 * @returns {ClassDecorator}
 */
function Router(prefix, routerOption, ...middlewares) {
  // 判断是否有路由选项，没有则当做中间件来使用
  if (typeof routerOption === "function") {
    middlewares.unshift(routerOption);
    routerOption = undefined;
  }

  /**
   * 为类生成一个 router,
   * 该装饰器会在所有方法装饰器执行完后才执行
   *
   * @param {Function} target 路由类对象
   */
  return function (target) {
    const router = express.Router(routerOption);
    const _routeMethods = target.prototype._routeMethods;
    // 遍历挂载路由
    for (const method in _routeMethods) {
      if (_routeMethods.hasOwnProperty(method)) {
        const methods = _routeMethods[method];
        for (const path in methods) {
          if (methods.hasOwnProperty(path)) {
            router[method](path, ...methods[path]);
          }
        }
      }
    }
    delete target.prototype._routeMethods;
    app.use(prefix, ...middlewares, router);
  };
}
```

这里的 target 是类对象，当装饰器对类进行处理时，我们生成一个新的 express 路由对象，将放置在类对象原型上的\_routeMethods 属性进行遍历，获取到对应的路由方法、路由路径和路由处理函数，并挂载到这个路由对象上。

需要注意，**类装饰器的处理会放在方法装饰器之后进行**，因此我们不能直接在方法装饰器上进行挂载，需要将其存储起来，在类装饰器上完成挂载工作。

### 编写路由文件

我们的路由文件也需要进行大幅度的改动，将其转化为下面类似的形式：

```js
// routes/sub/a.js
// Router 和 Get 装饰器从你的装饰器文件中引入
@Router("/sub/a")
class SubAController {
  @Get("/")
  index(req, res, next) {
    res.send("sub/a/");
  }
}

module.exports = SubAController;
```

### 挂载效果

![装饰器路由挂载](%E5%85%B3%E4%BA%8Eexpress%E8%B7%AF%E7%94%B1%E7%AE%A1%E7%90%86%E7%9A%84%E5%87%A0%E7%A7%8D%E8%87%AA%E5%8A%A8%E5%8C%96%E6%96%B9%E6%B3%95/路由挂载3.jpg)

用装饰器编写路由的相关代码我已经单独建立了一个[github 仓库](https://github.com/kainstar/express-derouter)，并发布成了一个 npm 包——[express-derouter](https://www.npmjs.com/package/express-derouter)，欢迎各位 star。

## 总结

以上就是我最近所思考的有关于 express 路由管理自动化的几种方法，其中装饰器挂载的方式由于 js 自身原因，在还原 Spring MVC 的其他功能上有所限制，如果你对更加强大的功能有要求的话，可以看看 TypeScript 基于 express 的一个 MVC 框架——[nest](https://nestjs.com/)，相信它应该更能满足你的需求。
