# 积木基础版

## 是什么？

提供给运营一个可视化的运营平台，由开发上传各种独立的业务模块，运营用拖拽的形式组合起各种业务模块形成一个h5页面

## 积木在哪里？

- [生产环境](http://jimu.tuia.cn)
- [测试环境](http://jimu.tuiatest.cn)
- [开发环境](http://jimu.tuiadev.cn)

## 怎么用？

### 新建活动

<img src="http://yun.tuisnake.com/jimu-web/guide/step1.png">

### 选择模板

<img src="http://yun.tuisnake.com/jimu-web/guide/step2.png">

### 输入活动标题

<img src="http://yun.tuisnake.com/jimu-web/guide/step3.png">

### 拖拽组件

<img src="http://yun.tuisnake.com/jimu-web/guide/step4.png">

### 配置组件

<img src="http://yun.tuisnake.com/jimu-web/guide/step5.png">

### 保存

<img src="http://yun.tuisnake.com/jimu-web/guide/step6.png">

### 发布

<img src="http://yun.tuisnake.com/jimu-web/guide/step7.png">

### 复制链接

<img src="http://yun.tuisnake.com/jimu-web/guide/step8.png">

## 相关模块

### 模板

模板是包裹组件的容器，示例代码如下

```html
<html>

<head>
  <meta http-equiv="content-type" content="text/html; charset=UTF-8">
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="format-detection" content="telephone=no" />
  <meta name="format-detection" content="email=no" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <script type="text/javascript">
    (function (win) {
      var h;
      var dpr = win.navigator.appVersion.match(/iphone/gi) ? win.devicePixelRatio : 1;
      var scale = 1;
      var docEl = document.documentElement;
      var metaEl = document.createElement("meta");

      function IsPC() {
        var userAgentInfo = navigator.userAgent;
        var Agents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"];
        var flag = true;
        for (var v = 0; v < Agents.length; v++) {
          if (userAgentInfo.indexOf(Agents[v]) > 0) {
            flag = false;
            break
          }
        }
        return flag
      }

      function setUnitA() {
        win.rem = Math.min(docEl.getBoundingClientRect().width, 750) / 3.75 / 2;
        docEl.style.fontSize = win.rem + "px"
      }
      win.dpr = dpr;
      win.addEventListener("resize", function () {
        clearTimeout(h);
        h = setTimeout(setUnitA, 300)
      }, false);
      win.addEventListener("pageshow", function (e) {
        if (e.persisted) {
          clearTimeout(h);
          h = setTimeout(setUnitA, 300)
        }
      }, false);
      metaEl.setAttribute("name", "viewport");
      metaEl.setAttribute("content", "initial-scale=" + scale + ", maximum-scale=" + scale + ", minimum-scale=" +
        scale + ", user-scalable=no");
      if (docEl.firstElementChild) {
        docEl.firstElementChild.appendChild(metaEl)
      } else {
        var wrap = document.createElement("div");
        wrap.appendChild(metaEl);
        document.write(wrap.innerHTML)
      }
      setUnitA()
    })(window);
  </script>
  <title>{{injecttitle}}</title>
  <style type="text/css">
    body {
      width: 7.5rem;
      margin: 0 auto;
    }
  </style>
  {{injectcss}}
</head>

<body>
  <div id="app">
    {{injecthtml}}
  </div>
  {{injectjs}}
</body>

</html>
```

注意事项: 

- 模板中必须包括injecttitle,injecthtml,injectcss,injectjs这四个标识来注入标题,html,css,和js

### 组件

组件由4部分组成

#### html

```html
<div class="banner"></div>
```

#### css

```css
body{background-color:#fff;}
.banner{
  background-position:center;
  background-size:cover;
  background-repeat:no-repeat;
  height:10rem;
}
```

#### js

```javascript
var banner = document.querySelector('.banner');
banner.style.backgroundImage = 'url(' + opts.bgimg + ')';
```

#### config

展示给运营的可配置项

```javascript
[	
  {
    "title":"链接地址",
    "type":"string",
    "key":"url"
  },
  {
    "title":"banner高度",
    "type":"number",
    "key":"height"
  },{
    "title":"背景图片",
    "type":"image",
    "key":"bgimg"
  },{
    "title":"是否固定",
    "type":"boolean",
    "key":"isStick"
  }
]
```

