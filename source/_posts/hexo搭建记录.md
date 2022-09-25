---
title: Hexo搭建记录
date: 2016-08-09 23:23:29
categories: 技思
tags: [Hexo, github-pages, 个人博客]
keywords: github pages,hexo
---

## 前言

最近，在学习前端的过程中，遇到不少问题，每次遇到问题都要去网上查相应的资料，很麻烦，而且经常查了又忘，因此想找个地方把自己学习过程中遇到的问题都记录下来，也算是复习。

首先是搭建这个博客的过程，经过资料查询，觉得[Hexo](https://hexo.io/zh-cn/)这个静态博客搭建工具不错，而且还可以学习 git 和 github，把静态博客页面放在 github page 上，也是省下了一笔服务器费用(毕竟这个记录用的博客也不怎么用得到后台)。

<!-- more -->

## 事前说明

1. 我所使用的操作系统是 Windows，因此文章中使用到的工具都是 Windows 版的，请结合自身电脑的系统版本下载对应的 32 位和 64 位工具。
2. 本文书写过程中参考了[github 上搭建 hexo 博客](http://e12e.com/2016/02/17/github%E4%B8%8A%E6%90%AD%E5%BB%BAhexo%E5%8D%9A%E5%AE%A2/)和[如何搭建一个独立博客——简明 Github Pages 与 Hexo 教程](http://www.jianshu.com/p/05289a4bc8b2)两篇文章，在此向两位作者表示感谢。

## 准备工作

在用 Hexo 搭建博客之前，需要事先用你的电脑准备几样东西

### 安装 Git

首先你需要安装的是[Git](https://git-scm.com/downloads)，这是一个分布式版本控制系统，主要用来进行将博客页面上传到 github 的操作，其安装方式十分简单，只需要不停地点击 next 即可。

虽然在使用 Hexo 的过程中不需要怎么使用 Git，但是如果你对 Git 的使用方式有兴趣，我建议你可以去[廖雪峰的 Git 教程](http://www.liaoxuefeng.com/wiki/0013739516305929606dd18361248578c67b8067c8c017b000)看一下，这里非常详细地介绍了有关于 Git 的一系列知识。

### 安装 Node.js

[Node.js](https://nodejs.org/en/)是 Hexo 的运行环境，安装过程和 Git 一样，直接安装即可。

### github

在将你的博客上传到 github 前，你先要有一个 github 账号才行，进入[github 的官网](https://www.github.com)，注册一个你的 github 账号（怎么注册应该就不用说了吧），然后点击页面右上角的加号，选择**New repository**，建立一个名为 `[你的账号名].github.io` 的仓库

完成了 github 仓库的创建之后，我们需要将本地 Git 项目和你的 github 仓库建立联系，这里要用到的就是 SSH Key。

### 生成新的 SSH Key

打开桌面上安装好的 Git Bash（或者在右键菜单中选择 Git Bash Here），输入下面的内容（在 Git Bash 中$号是自动生成的，不需要输入）：

    $ ssh-keygen -t rsa -C "邮件地址@youremail.com"
    Generating public/private rsa key pair.
    Enter file in which to save the key (/Users/your_user_directory/.ssh/id_rsa):<直接回车就好>

然后系统会要你输入密码：

    Enter passphrase (empty for no passphrase):<输入密码>
    Enter same passphrase again:<再次输入密码>

输入完密码后 ssh key 就生成完毕了。

### 添加 SSH Key 到 GitHub

在本机设置 SSH Key 之后，需要添加到 GitHub 上，以完成 SSH 链接的设置。

1.  打开 C:\Users\Administrator\.ssh\id_rsa.pub 文件，这个文件就是刚刚生成的密钥文件，用编辑器打开文件并复制文件里的内容。

2.  登陆 github，点击右上角头像下拉菜单中的 Settings，找到 SSH and GPG keys，选择 New SSH Key，将复制的内容粘贴到 Key 一栏里，点击 Add SSH Key 即可完成添加。

3.  回到 Git Bash 中，输入以下命令，看是否设置成功：

        $ ssh -T git@github.com

4.  如果是下面的反馈：

        The authenticity of host 'github.com (207.97.227.239)' can't be established.
        RSA key fingerprint is 16:27:ac:a5:76:28:2d:36:63:1b:56:4d:eb:df:a6:48.
        Are you sure you want to continue connecting (yes/no)?

    输入 yes，然后会看到：

        Hi cnfeat! You've successfully authenticated, but GitHub does not provide shell access.

5.  此时已经可以通过 SSH 连接到 github 了，但是你还需要完善一些个人信息

    在 Git Bash 中输入下面两条命令，进行个人信息的设置

        $ git config --global user.name "cnfeat"					// 填写用户名
        $ git config --global user.email "cnfeat@gmail.com"			// 填写邮箱

到此为止，本地 Git 到远程 github 仓库的配置全部完成了，下面开始正式进入有关 Hexo 的内容了。

---

## 搭建 Hexo 静态博客

### 安装 Hexo

安装 Hexo 不需要去什么官方网站下载，只需要你打开 Git Bash，在里面输入下面的命令：

    $ npm install hexo-cli -g

等待 Hexo 安装完成即可。

### 生成本地博客

在要创建 Hexo 的目录下打开 Git Bash，输入：

    $ hexo init myblog

myblog 是存放博客文件的目录，可以随自己的喜好修改

继续输入：

    $ cd myblog

进入到博客文件夹中，进入到文件夹后输入：

    $ npm install 								// 安装hexo所需的依赖
    $ npm install hexo-deployer-git --save		// 安装将hexo博客向github上传的模块
    $ npm install hexo-server --save			// 安装hexo服务器模块，用于本地预览博客

到此就完成 Hexo 静态博客的基本搭建了。

### 浏览效果

输入以下命令：

    $ hexo g			// 等同于hexo generate，生成博客静态文件
    $ hexo s			// 等同于hexo server，启动一个本地服务器用来浏览博客效果

在浏览器中输入`http://localhost:4000`可以看到此时的博客页面

### 修改配置文件

打开博客目录下的\_config.yml 文件，这个文件就是 Hexo 用于生成静态网页的配置文件，其中的各种参数可以参考[Hexo 官网的文档](https://hexo.io/zh-cn/docs/configuration.html)来进行设置，我们这里只修改用于部署该博客到 github 的参数。

翻到文件的最下方，将 deploy 标签改成：

    deploy:
    	type: git
    	repo: https://github.com/yourname/yourname.github.io.git

注意：在 yml 文件中，冒号后面必须有一个空格，不然执行部署命令的时候会报错。

### 创建一篇新文章

1.  在 Git Bash 中输入：

        $ hexo new "article name"

2.  在博客目录下的 source 文件夹中的\_post 文件夹里找到你新建的 md 文件，使用 Markdown 语法书写你的文章
3.  最后使用 `hexo g` 命令生成相应的静态文件即可。

### 部署静态博客到 github

在 Git Bash 中输入：

    $ hexo d		// 等同于hexo deploy

等待它将文件上传到 github 即可。

### 自定义主题

如果你对 Hexo 自带的主题不满意的话，可以去 github 或者[Hexo 官网下的主题页](https://hexo.io/themes/)找你中意的主题，将它们下载到博客目录下的 themes 文件夹下，再修改\_config.yml 文件中的 theme 标签，即可改变主题（记得使用`hexo g`命令重新生成静态文件）。

---

## 其他参考资料

1. [Markdown——入门指南](http://www.jianshu.com/p/1e402922ee32/)
2. [hexo 常用命令笔记](https://segmentfault.com/a/1190000002632530)
