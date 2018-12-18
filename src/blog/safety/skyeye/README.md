# skyeye前端错误监控

### 背景：
1.前端页面线上裸奔，出问题几个小时后才收到业务方反馈
2.某个型号、某个浏览器、某个媒体、某个网络 -> 页面问题无法重现

## 监控系统整体架构
### 早期构思
![监控系统架构图](https://p.ssl.qhimg.com/dr/1920_1010_100/t014de612597161716b.webp)
### 最终成型
![监控系统架构图](https://p.ssl.qhimg.com/t0161f6447182a839c2.webp)

## 错误常见

前端错误分类
1. javascript异常
2. js文件、css文件、img图片等（资源）的加载错误
3. ajax请求错误
4. ui错误

## sdk   

```js
(function(e){e._error_storage_=[];e.ERROR_CONFIG={client:"tuia",pageId:"smashg_2",imgUrl:"http://retcode.tuipink.com/report?"};function r(){e._error_storage_&&e._error_storage_.push([].slice.call(arguments))}e.addEventListener&&e.addEventListener("error",r,true);var t=3,n=function e(){var r=document.createElement("script");r.async=!0,r.src="//yun.tuia.cn/tuia/skyeye/skyeye.js",r.crossOrigin="anonymous",r.onerror=function(){t--,t>0&&setTimeout(e,1500)},document.head&&document.head.appendChild(r)};setTimeout(n,1500)})(window);
```

```js
// V2 支持收集用户行为
(function(r){r._error_storage_=[];r.ERROR_CONFIG={client:"tuia",pageId:"turnCircle_4",imgUrl:"http://retcode.tuipink.com/report?"};r.eventTaskList=[];try{original_addEventListener=EventTarget.prototype.addEventListener;function n(e,t){if(e.name==="f"){return}if(eventTaskList.length>4){r.eventTaskList.shift()}r.eventTaskList.push({time:+new Date,Url:window.location.href,target:t.type==="error"?"window":t.srcElement?t.srcElement.outerHTML:t.target.outerHTML,type:t.type,event:t.stack||(t.error?t.error.stack:void 0)})}function e(e,t,r){return original_addEventListener.call(this,e,o(this,t,e),r)}function o(e,t){return function(e){t(e);n(t,e)}}EventTarget.prototype.addEventListener=e}catch(e){console.log("sdk--",e)}function t(){r._error_storage_&&r._error_storage_.push([].slice.call(arguments))}r.addEventListener&&r.addEventListener("error",t,true);var i=3,s=function e(){var t=document.createElement("script");t.async=!0,t.src="//yun.duiba.com.cn/tuia/skyeye/skyeyev2.js",t.crossOrigin="anonymous",t.onerror=function(){i--,i>0&&setTimeout(e,1500)},document.head&&document.head.appendChild(t)};setTimeout(s,1500)})(window);
```
- 将以上代码复制到浏览器```</head>```上方

- client 改成自己的项目组名，pageId改成你需要监控页面的id

- 对需要监控的js,加入crossOrigin="anonymous",（例如```<script src="//yun.tuia.cn/abc.js" crossOrigin="anonymous"><script>``` 加入同时yun.tuia.cn必须支持跨域）

- 被监控js需要开通跨域

- webpack 插件 http://gitlab2.dui88.com/frontend/html-webpack-plugin-attributes-script
  自动加入crossOrigin="anonymous"

### 说明
```js
export interface config {
    client: string, // 项目上报id <required>
    pageId: string, // 项目具体某个活动id <required>
    version: string, // 监控版本 <required>
    imgUrl: string, // 请求url <required>
    level: Number, // 等级(不填默认为0, error级别, 暂时只支持0级别)
    repeat: Number, // 重复上报次数
    ignore: Array<RegExp | Function>, // 过滤条件(使用见example)
    isResource: Boolean, // 是否上报静态资源，true 上报，false不上报
}
```
**required 必填，不填不上报**
**以上都配置在上述e.ERROR_CONFIG对象中**

### 功能
```js
1.支持静态资源出错上报
2.支持js执行异常上报
3.支持多次上报上限（缓存配置）
4.支持正则/函数过滤
5.支持ios/android ua 型号机型解析
6.支持生成唯一errorKey
7.支持静态资源出错,详细定位
8.支持收集用户行为
```

### 示例

**ignore**

```js
(function(e){e._error_storage_=[];e.ERROR_CONFIG={client:"tuia",pageId:"smashg_2",imgUrl:"http://retcode.tuipink.com/report?"};function r(){e._error_storage_&&e._error_storage_.push([].slice.call(arguments))}e.addEventListener&&e.addEventListener("error",r,true);var t=3,n=function e(){var r=document.createElement("script");r.async=!0,r.src="//yun.tuia.cn/tuia/skyeye/skyeye.js",r.crossOrigin="anonymous",r.onerror=function(){t--,t>0&&setTimeout(e,1500)},document.head&&document.head.appendChild(r)};setTimeout(n,1500)})(window);
```
过滤错误msg 包含aaa的错误。例如报错 Uncaught ReferenceError: aaa is not defined 将不上报。

### 提示

- script error

如果未对所监控的js增加crossOrigin="anonymous"这个标识，将会收集到script error。加入crossOrigin="anonymous"所在域名必须开启跨域，否则会发生错误。

## 可视化

### 地址

在线地址: http://skyeye.dui88.com
### 功能

```js
1.支持多时段对比
2.完善的错误处理流程
3.支持sourceMap
4.支持报警
```

### 效果图
![](//yun.duiba.com.cn/tuia/skyeye/img/chart.jpg)
<br />
<br />
![](//yun.duiba.com.cn/tuia/skyeye/img/detail-1.jpg)
<br />
<br />
![](//yun.duiba.com.cn/tuia/skyeye/img/detail-2.jpg)

## 后期展望
前端监控想要监控真正发挥价值，还需要从各个方面进行不断的优化和打磨。

1.提供更细的报警规则，给出更加智能化的提醒和预测。

2.增加接口报错信息收集。

3.提供更多的分析纬度如：媒体纬度占比纬度。

4.错误列表增加过滤功能，更方便定位到错误。
