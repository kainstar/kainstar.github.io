---
title: JavaScript的正则学习笔记
date: 2016-08-17 00:02:36
categories: 技思
tags: [javascript, 正则表达式]
keywords: javascript,正则表达式
---

## 前言

正则表达式（Regular Expression）是一种常见的用于处理字符串的操作公式。根据事先定义好的一些字符的组合的规则来检索，过滤，替换字符串。它的优点有：

1. 可以用简单的方式做到字符串的复杂控制
2. 灵活性，功能性强

但是正则表达式也有一个致命缺点，就是对于刚刚接触正则表达式的人来说，它实在是太难懂了，这也导致了很多人在一开始学正则表达式时因为无法理解而放弃。

我在慕课网上学习时看到一个[关于 JavaScript 的正则表达式的课程](http://www.imooc.com/learn/706)，本着巩固自身认识，也方便日后查看的心态，将其内容总结成该博客笔记。

<!-- more -->

## 说明

1. 本文使用的语言是 JavaScript，会使用到一些 JavaScript 中的正则表达式使用方法，对于其他语言的正则表达式用法请查阅官方文档或其他资料。

2. 本文中用字符串的 replace 方法来展示正则表达式的使用效果，该方法的作用是根据正则表达式来对字符串内匹配的内容进行替换

## 正则表达式笔记

### JavaScript 的正则表达式初始化方法

1.  使用字面量实例化（书写方式：把正则内容写到两个斜线中间）

        var reg = /\bis\b/g;

2.  使用 RegExp 对象实例化

        	var reg = new RegExp('\\bis\\b','g');

    注意：使用 RegExp 对象实例化时，因为参数是字符串，所以要多加一个反斜线\来转义反斜线

### 正则表达式的修饰符

在字符串中是最后一个斜杠后所加的字符就是正则表达式的修饰符（在正则构造函数中是第二个参数），可以多个修饰符叠加使用。

1.  **g: global** 表示全文搜索，不添加时搜索到第一个匹配就停止搜索

        var reg = /\bis\b/g;
        var raw = 'He is a boy! He like playing game! Who is he?';
        raw.replace(reg,'IS');
        //替换结果：He IS a boy! He like playing game! Who IS he?

2.  **i: ignore case** 表示忽略大小写，默认情况下大小写敏感

        var reg = /a/ig;
        var raw = 'AaaA';
        raw.replace(reg,'b');
        //替换结果：bbbb

3.  **m:multiple lines** 多行搜索

        var reg = /a/gm;
        // 反斜线\可以表示多行字符串
        var raw = 	'aa\
        			dcba\
        			abcd';
        raw.replace(reg,'A');
        //替换结果：AAdcbAAbcd

### 基本类型字符

在正则表达式中，有两种基本类型字符：原义文本字符和元字符。

原义文本字符指的是原本意义的字符，写了什么就是什么，例如：`var reg = /a/ `表示创建一个匹配字符 a 的正则表达式。

元字符指的是在正则中含有特殊含义（用来代替一个或多个字符）的非字母字符(\*+?$^.|(){}[]和一系列\转义字符，在之后会详细解释) 例如：`var reg = /\d/`表示创建一个匹配一个数字的正则表达式。

### 元字符详解

#### 字符类

用元字符[]来构建一个简单的类，把在[]中的字符归为一类，表达式可以匹配这一类的字符。例如：[abc]则是将 a、b、c 归为一类。表达式可以匹配 a 或 b 或 c

    var reg = /[abc]/g;
    var raw = 'a1b2c3d4';
    raw.replace(reg,'X');
    //替换结果：X1X2X3d4

#### 字符类取反

用元字符^创建反向类，表示不属于这一类的内容。例如：[^abc]则是表示不是字符 a 或 b 或 c 的内容

    var reg = /[^abc]/g;
    var raw = 'a1b2c3d4';
    raw.replace(reg,'X');
    //替换结果：aXbXcXXX

但是如果要匹配数字 0 到 9，是不是要把 9 个数字都写一遍呢？不是，为了简化书写，可以在字符类中使用 - 符号表示范围，如果想在字符类中匹配 - 符号，就要把 - 符号加到字符类开头或者结尾处（在字符类内部可以连续写好几个范围类）

    var reg = /[-0-9a-zA-Z]/g;			//0-9 等同于 0123456789
    var raw = '2016-08-16 NanJing';
    raw.replace(reg,'X');
    //替换结果：XXXXXXXXXX XXXXXXX

#### 预定义字符类

用来匹配常见的字符类的一类元字符，可以分为边界匹配字符和非边界匹配字符

**非边界匹配字符：**

. 表示除了回车和换行以外的所有字符（[^\r\n]）

    var reg = /./g;
    var raw = 'a1b2c3d4';
    raw.replace(reg,'X');
    //替换结果：XXXXXXXX

\d 表示数字字符（[0-9]）

    var reg = /\d/g;
    var raw = 'a1b2c3d4';
    raw.replace(reg,'X');
    //替换结果：aXbXcXdX

\D 表示非数字字符（[^0-9]）

    var reg = /\D/g;
    var raw = 'a1b2c3d4';
    raw.replace(reg,'X');
    //替换结果：X1X2X3X4

\s 表示空白符（[\t\n\x0B\f\r]）

    var reg = /\s/g;
    var raw = 'a1 b2 c3 d4';
    var result = raw.replace(reg,'X');
    //替换结果：a1Xb2Xc3Xd4

\S 表示非空白符（[^\t\n\x0b\f\r]）

    var reg = /\S/g;
    var raw = 'a1 b2 c3 d4';
    raw.replace(reg,'X');
    //替换结果：XX XX XX XX

\w 单词字符(字母、数字、下划线)（[a-zA-Z_0-9]）

    var reg = /\w/g;
    var raw = 'a1 b2 c3 d4';
    raw.replace(reg,'X');
    //替换结果：XX XX XX XX

\W 非单词字符（[^a-za-z_0-9]）
var reg = /\W/g;
var raw = 'a1 b2 c3 d4';
raw.replace(reg,'X');
//替换结果：a1Xb2Xc3Xd4

**边界匹配字符：**

^ 表示开始

    var reg = /^./g;
    var raw = 'a1 b2 c3 d4';
    raw.replace(reg,'X');
    //替换结果：X1 b2 c3 d4

$ 表示结束

    var reg = /.$/g;
    var raw = 'a1 b2 c3 d4';
    raw.replace(reg,'X');
    //替换结果：a1 b2 c3 dX

\b 表示单词边界

    var reg = /\ba1\b/g;
    var raw = 'a1a1 a1';
    raw.replace(reg,'X');
    //替换结果：a1a1 X

\B 表示非单词边界

    var reg = /\Ba1\b/g;
    var raw = 'a1a1 a1';
    raw.replace(reg,'X');
    //替换结果：a1X a1

### 量词

正则表达式中的量词可以用来表示匹配的次数

? 表示零次或一次(有或没有)

    var reg = /ab?c/g;
    var raw = 'ac abc abbc';
    raw.replace(reg,'X');
    //替换结果：X X abbc

\+ 表示一次或多次(至少出现一次)

    var reg = /ab+c/g;
    var raw = 'ac abc abbc';
    raw.replace(reg,'X');
    //替换结果：ac X X

\* 表示出现零次或一次或多次(任意次数)

    var reg = /ab+c/g;
    var raw = 'ac abc abbc';
    raw.replace(reg,'X');
    //替换结果：X X X

{n} 表示出现 n 次

    var reg = /ab{1}c/g;
    var raw = 'ac abc abbc';
    raw.replace(reg,'X');
    //替换结果：ac X abbc

{n,m} 表示出现 n 次到 m 次

    var reg = /ab{1,2}c/g;
    var raw = 'ac abc abbc abbbc';
    raw.replace(reg,'X');
    //替换结果：ac X X abbbc

{n,} 表示至少出现 n 次

    var reg = /ab{1}c/g;
    var raw = 'ac abc abbc abbbc';
    raw.replace(reg,'X');
    //替换结果：ac X X X

### 贪婪模式和非贪婪模式

**贪婪模式：**尽可能多的进行匹配，匹配成功后继续尝试直到无法匹配（正则表达式在默认情况下就是贪婪模式）

    var reg = /\d{1,3}/;
    var raw = '12345';
    raw.replace(reg,'X');
    //替换结果：X45

**非贪婪模式：**尽可能少的进行匹配，一旦匹配成功就不再继续尝试（用法：在量词后面加上?）

    var reg = /\d{1,3}?/;
    var raw = '12345';
    raw.replace(reg,'X');
    //替换结果：X2345

### 分组

用()可以将正则表达式分组成不同的子串（量词可以作用到一个分组）

    var reg = /([a-z]\d){3}/g;
    var raw = 'a1b2c3d4';
    raw.replace(reg,'X');
    //替换结果：Xd4

**或的表示：**用|可以表示或，使用或时最好用分组括号将几个项包括在一起，方便查看理解

    var reg = /a(11|22)/g;
    var raw = 'a11 a22 a33';
    raw.replace(reg,'X');
    //替换结果：X X a33

**分组的反向引用：**用$符号表示捕获到分组的内容，可以用$加上对应序号的形式引用

    var reg = /(\d{4})-(\d{2})-(\d{2})/g;
    var raw = '2016-08-18';
    raw.replace(reg,'$2/$3/$1');
    //替换结果：08/18/2016

**忽略分组：**如果不希望捕获到某些分组，只需要在分组前加上?:即可

    var reg = /(\d{4})-(\d{2})-(?:\d{2})/g;
    var raw = '2016-08-18';
    raw.replace(reg,'$2/$1');
    //替换结果：08/2016

### 前瞻

正则表达式是从文本头部向尾部进行解析，文本尾部方向就是‘前’。前瞻就是在正则表达式匹配到规则的时候，向前检查是否符合断言。（JavaScript 不支持后顾，因此在本文中不对后顾进行解释）

符合断言的称为**“肯定/正向”**匹配，不符合的称为**“否定/负向”**匹配。

用 exp 表示要匹配的正则表达式，assert 表示断言部分(也是一个正则)来说明前瞻所用的公式。

**正向前瞻：** exp(?=assert)

    var reg = /\w(?=\d)/g;
    var raw = 'a1b2c3d4';
    raw.replace(reg,'X');
    //替换结果：X1X2X3X4

**负向前瞻：** exp(?!assert)

    var reg = /\w(?!\d)/g;
    var raw = 'a1b2c3d4';
    raw.replace(reg,'X');
    //替换结果：aXbXcXdX

注：断言部分不参与匹配，仅作为一个验证部分存在。

常用的正则表达式所需的知识点已经写在了上面，接下来会介绍一下 JavaScript 中正则表达式有关的属性和方法

---

### RegExp 对象

RegExp 对象的属性：

**global:** 是否全文搜索，默认为 false

**ignore case:** 是否大小写敏感，默认为 false

**multiline:** 多行搜素，默认为 false

**lastIndex:** 当前表达式匹配内容的最后一个字符的下一个位置

**source:** 正则表达式的文本字符串

RegExp 对象的方法：

**test(str)** 测试字符串 str 中是否存在能匹配正则表达式的部分，有则返回 true，没有则返回 false。该方法每次执行后，lastIndex 都会发生相应的改变

**exec(str)** 使用正则表达式模式对字符串执行搜索，并将更新全局 RegExp 对象的属性以反映匹配结果。如果没有匹配的文本就返回 null，有就返回一个结果数组。

    这个结果数组有两个属性：

    	index 声明匹配文本的第一个字符的位置

    	input 存放被检索的字符串 str

    除此之外，使用非全局的正则对象的exec方法时，返回的结果数组的第一个元素是匹配到的字符串，第二个元素是匹配到的第一个分组，第三个元素是匹配到的第二个分组（以此类推）

### 字符串 String 对象

字符串 String 的方法：

**search(str||reg)** 方法用于检索字符串中指定的子字符串，或检索与正则表达式相匹配的子字符串，方法返回第一个匹配结果的 index，搜索不到就返回-1。search 方法不执行全局匹配，会忽略修饰符 g，并且总是从字符串的开始位置进行检索。

**match(reg)** 方法检索字符串，找到一个或多个和正则表达式相匹配的文本，修饰符 g 有影响。match 非全局调用的返回和 RegExp 对象的 exec 方法的返回一样；而全局调用返回的是字符串中所有的匹配子串，没有 index 和 input 属性

**split()** 方法用于分割字符串成数组，其分割符可以用正则来表示

**replace()** 方法用于替换字符串中的一部分成另外一部分，replace 方法有三种参数传递方式：

1.  **replace(str,replaceStr)**

    示例：

        'a1b2c3d4'.replace('a', 'X');
        //替换结果：X1b2c3d4

2.  **replace(reg,replaceStr)**

    示例：

        'a1b2c3d4'.replace(/\d/g, 'X');
        //替换结果：aXbXcXdX

3.  **replace(reg,function)** 其中 function 在每次匹配替换的时候都被调用，它有四种参数:
    1. 匹配字符串 **match**
    2. 正则表达式分组内容，有多少个分组就有多少个该参数 **group1,group2,...**
    3. 匹配项在字符串中的位置 **index**
    4. 原字符串 **origin**

示例:

    'a1b2c3d4'.replace(/\d/g, function(match,index,origin) {
    	console.log(index);
    	return parseInt(match)+1;
    })
    //替换结果：a2b3c4d5

    'a1b2c3d4'.replace(/(\d)(\w)(\d)/g, function(match,group1,group2,group3,index,origin) {
    	console.log(index);
    	return group1+group3;
    })
    //替换结果：a12c34

---

到此为止，介绍 JavaScript 的正则表达式的笔记全部完成，对阅读到这里的读者表示感谢，也希望这篇笔记能够帮上你的忙。
