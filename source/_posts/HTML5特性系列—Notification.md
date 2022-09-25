---
title: HTML5特性——Notification
date: 2016-12-20 22:38:48
categories: 技思
tags: [html5, javascript]
keywords: HTML5,Notification
---

## 前言

恩……开了一个新坑——**HTML5 特性介绍**，用来介绍一些 HTML5 中可能用得到的新特性。

之所以开这个坑，是因为今天在刷知乎时，看到了一个网页聊天室，这个聊天室能够在我浏览其他网页时也提醒我接收到了新信息，因此对这个功能产生了兴趣。经过查询，知道了这个功能叫做 Notification，是 HTML5 实现的一个新特性，既然已经知道了这个特性的名称，自然不能不对它简单地研究一番了。

之后如果看到有什么有趣的 HTML5 特性，我也会对它“研究”一番，然后写一篇简单的介绍文章加入到这个系列中的，那么现在让我们先来看一看本次的主角——Notification 吧。

<!-- more -->

<style>
.notification-btn {
	display: block;
	border: none;
	padding: 5px 15px;
	line-height: 30px;
	color: #fff;
	margin: 10px;
	background-color: #7778df;
}

.notification-btn:hover {
	box-shadow: 2px 2px 3px #aaa;
}

.notification-btn:active {
	box-shadow: -1px -1px 3px #999 inset;
	color: #333;
}
</style>

## Notification 简介

在传统的网页体验中，当用户不在浏览网页时，无法由浏览器主动告知用户有新信息，必须等到用户重新开始浏览网页才知道有新消息，这对一些时效性要求比较强的网页应用来说是个很大的问题。

Notification 是 HTML5 实现的一个消息通知机制，用来为用户设置和显示桌面通知，即会在桌面的右下角弹出一个长方形带消息的窗口，无论用户是否在浏览你的网页。（效果如下图）

![Notification效果](HTML5%E7%89%B9%E6%80%A7%E2%80%94Notification/notification.png)

但是因为各种浏览器对 Notification 特性的支持不一，所以会出现 Notification、webkitNotification 和 mozNotification 的三种实现，而且在不同类型和版本的浏览器下提供的参数和 API 不一致，这对开发很不友好

因此在这里推荐使用 [HTML5-Desktop-Notifications](https://github.com/ttsvetko/HTML5-Desktop-Notifications) 这个 polyfill，它对 Notification 进行了实现，使开发者不必考虑浏览器兼容性，可以方便地使用 Notification 特性

API 参考网站: [Notification - Web API](https://developer.mozilla.org/zh-CN/docs/Web/API/notification)

**注意！必须在服务器中运行才会有桌面通知效果！**

## Notification 的简单实例

下面我们来看具体的 Notification 实例

### 检测特性可用性

在正式演示 Notification 之前，我们需要先验证 Notification 是否被支持：

```javascript 验证能否使用Notification
var validate_notification-btn = document.getElementById("validate-notification-btn");
validate_notification-btn.onclick = function (e) {
	if (Notification != null) {
		alert("notification 可用!");
	} else {
		alert("notification 不可用!");
	}
}
```

使用上面这段代码，可以验证 Notification 垫片是否已经发挥了作用

<button type="button" class="notification-btn" id="validate-btn">检验特性可用性</button>

### 发送一个简单的 Notification

使用

```js 如何使用Notification
function notify() {
  var notification = new Notification("嗨(⊙▽⊙)", {
    body: "这里是一个提醒的正文哦 ⁄(⁄ ⁄•⁄ω⁄•⁄ ⁄)⁄",
    icon: "/images/head.jpg",
  });
}
var test1_notification_btn = document.getElementById("test1-notification-btn");
test_notification_btn1.onclick = function (e) {
  if (Notification.permission === "granted") {
    notify();
  } else {
    Notification.requestPermission(function (permission) {
      if (permission === "granted") {
        notify();
      }
    });
  }
};
```

<button type="button" class="notification-btn" id="test1-btn">点击查看 Notification</button>

## Notification 的内容介绍

### 静态属性

Notification 的静态属性：**permission** —— 表明通知授权状态的字符串，它的值有三个：

1. **denied** 表示用户拒绝了通知的显示
2. **granted** 表示用户允许了通知的显示
3. **default** 表示默认状态，因为不知道用户的选择，所以浏览器的行为与 denied 时相同
4. **notsupported** 在使用了 HTML5-Desktop-Notifications 垫片之后，会有第四个值，表示浏览器不支持(未实现）Notification 特性

### 静态方法

Notification 的静态方法：**requestPermission([callback])** —— 向用户请求允许使用 Notification，但是这个方法只能通过用户行为调用（例如点击），其他方式无法调用。

使用这个方法时可以传入一个回调函数，这个回调函数有一个参数，参数的值为请求之后的通知授权的状态

```js requestPermission方法
Notification.requestPermission(function (status) {
  console.log(status);
});
```

你也可以用 then 的异步方法完成操作：

```js requestPermission方法
Notification.requestPermission().then(function (status) {
  console.log(status);
});
```

### 构造函数(初始化方法)

Notification 的初始化方法为：

```js requestPermission方法
var notification = new Notification(title, options);
```

**title**是一个字符串，表示这个通知的标题

**options**是一个对象，是一个可选参数，根据 options 包含的属性对 Notification 进行设定

### 实例属性

构造方法会返回一个 notification 实例，可以直接访问这个实例下的各种实例属性

- **title**：通知内所显示的文本标题,用构造方法的第一个参数初始化
- **body**：通知内所显示的文本内容
- **icon**：通知左侧显示的图片，一个字符串，表示图片的 URL 地址
- **dir**：通知文本的显示方向，有三个参数："auto","ltr","rtl"（但是好像没有什么区别）
- **lang**：通知使用的语言（不常用）
- **tag**：通知的 ID，是一个字符串，用于区分不同的 Notification。如果有一条新通知和一条旧通知具有一个相同的标记，并且还没有被显示，那么这条新通知将会替换旧通知。如果旧通知已经显示出来了，那么旧通知将会被关闭，新通知将会被显示出来。

### 实例方法

notification 实例有一个实例方法 —— **close()**，调用这个方法可以关闭对应的 notification

### 事件处理

notification 实例有四个可以设置的触发事件：**show**（提醒显示时）,**click**（提醒被点击时）,**error**（提醒出错时）,**close**（提醒关闭时），通过设置 **on+事件名** 的属性来设置触发事件

```js requestPermission方法
var notification = new Notification("嗨(⊙▽⊙)", {
  body: "这里是一个提醒的正文哦 ⁄(⁄ ⁄•⁄ω⁄•⁄ ⁄)⁄",
  icon: "/images/head.jpg",
});
notification.onshow = function () {
  console.log("notification 已被打开");
};
notification.onclick = function () {
  this.close();
  console.log("notification 已被点击");
};
notification.onclose = function () {
  console.log("notification 已被关闭");
};
notification.onerror = function () {
  console.log("notification 出错");
};
```

<button type="button" class="notification-btn" id="test2-btn">测试事件处理</button>

## 结尾

作为本系列的第一篇文章，不知道写成这样能否算是达到及格水平，若是有前辈看到文章，希望能给予指点。

<script src="//cdn.bootcss.com/HTML5Notification/3.0.0/Notification.js"></script>
<script src="/code/notification-demo.js"></script>
