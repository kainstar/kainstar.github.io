---
title: 在使用puppeteer前你需要做的事
date: 2017-12-25 19:56:21
categories: 技思
tags: [nodejs]
keywords: puppeteer
---

最近看了[大前端神器安利之 Puppeteer](https://jeffjade.com/2017/12/17/134-kinds-of-toss-using-puppeteer/)这篇文章之后，想要自己试试，本文记录了我在安装 puppeteer 过程中遇到的问题和解决方案。

<!-- more -->

### 使用 npm 和 yarn

我一开始直接使用官方文档中说的:

```bash
yarn add puppeteer
# or "npm i puppeteer"
```

的方式来进行安装，但是却在一开始的安装阶段就遇到了麻烦，当我使用 npm 或 yarn 安装库时，由于 puppeteer 是使用的 chromium 内核，puppeteer 会去国外的网站上下载最新版本的 chromium，在 windows 下大约有 110MB 的大小，而且因为网络原因会下载得非常慢甚至无法下载，因此我尝试使用其他方法来安装 chromium。

### 使用 cnpm

在搜索了 puppeteer 的 issues 之后，发现了这个 issues——[Failed to download Chromium r515411](https://github.com/GoogleChrome/puppeteer/issues/1597)，下面有人给出了更换 chromium 源或使用 cnpm 安装的方式，但是经过试验发现 cnpm 安装依旧很慢，而且使用这种方式安装的话，每次新建一个项目，都要重新下载 100 多 MB 的 chromium，于是我继续尝试其他方法。

### 使用本地 chromium

既然是每次都需要下载 chromium，那么我们只要将 puppeteer 的 chromium 执行文件指定为本地文件就可以免除每次都重新下载的麻烦了。

**操作步骤：**

1.在[chromium 的网站](https://www.chromium.org/getting-involved/download-chromium)上下载最新版本的 chromium,将其安装到本地

2.在设置了环境变量`PUPPETEER_SKIP_CHROMIUM_DOWNLOAD`（作用是让 puppeteer 在安装过程中跳过 chromium 的安装步骤）之后，重新安装 puppeteer：

```bash
set PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1
npm i puppeteer
```

3.然后编写你的 node 代码：

```js
const puppeteer = require("puppeteer");

puppeteer.launch({
  executablePath: "在这里填写你本地的chromium文件地址",
});
```

这样，puppeteer 就会去调用本地的 chromium 程序了。
