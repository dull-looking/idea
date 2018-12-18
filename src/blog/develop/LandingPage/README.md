#  落地页埋点方案  


### 一、基本名词介绍

（1）曝光数据 页面PV/UV，PV即页面浏览量，用户每1次对网站中的每个网页访问均被记录1次。用户对同一页面的多次访问，访问量累计。UV指根据PV去掉重复访问页面的用户数据。

（2）转化数据 用户进入页面后，根据广告需求，将某个特定的行为计算为转化，例如点击，长按，提交表单等。用户触发事件时，向数据服务器发送数据。

（3）常用参数含义 a_oId :唯一标识订单id a_cid :唯一标识用户id

### 三、技术实现
**（一）对接原理**

JS的作用：

![](https://user-gold-cdn.xitu.io/2018/10/7/1664e31a5c621ee3?w=591&h=541&f=png&s=15370)
实现流程如下：

![](https://user-gold-cdn.xitu.io/2018/10/7/1664e320979d30c0?w=583&h=615&f=png&s=28377)

1. 推啊会在每个投放链接后面拼装上唯一标识的信息，例如：a_oId(唯一订单号)，a_cid(唯一用户id)等等。
2. 推啊服务器收到广告主的请求，会记录日志。推啊通过日志分析则知道是哪个订单，哪个广告，哪个用户发生了转化。

**（二）对接流程图**

![](https://user-gold-cdn.xitu.io/2018/10/7/1664e334c1e907f5?w=765&h=209&f=png&s=13022)
**（三）落地页部分对接 - JS对接（必选）**

3.1 引入JS文件（必选）

在落地页页面的head中加入脚本:
```JavaScript
<script type="text/javascript" src="//yun.tuisnake.com/h5-mami/log.js" id="send_log"></script>
```

3.2 点击事件转化（必选）

在需要统计点击转化的DOM元素上添加 data-setting-click属性。例如：

```JavaScript
<a href="https://www.baidu.com" data-setting-click="baidu">
<div class="form-group bgbtn">
  <!-- 这里不能嵌套data-setting-click -->
  免费领取奖品
</div>
</a>
```

注意：切勿嵌套添加data-setting-XXX属性，此外若DOM元素动态渲染，会导致该方法无效。

3.3 长按屏幕转化（非必选）

备注：有些需要长按复制内容。 在需要统计屏幕长按转化的DOM元素上添加data-setting-press属性。例如：

```JavaScript
<div class="form-group bg" data-setting-press="value">
  <label class="control-label">复制</label>
</div>
```

在长按元素上添加data-setting-press元素，用户按800ms会计算一次转化。

3.4 点击复制到系统剪贴板（非必选）

背景：针对下载类落地页，会把唯一标识复制到剪贴版，以便下载完应用后，通过剪贴版拿到唯一标识。

在需要点击复制的元素上添加data-setting-copy属性。
若跳转到落地页链接为：//www.tuia.cn?a_oId=taw-123&a_cid=taw-456 则data-setting-copy=”${a_oId}” 点击复制的剪贴版的值为taw-123； 例如：

``` JavaScript
<button data-setting-copy="${a_oId}"></div>
```
注意：为了严格区分剪贴板是否包含推啊的内容，推啊在a_oId前会加上taw-的标识，所以希望在取值时判断剪贴板内容是否包含taw-这个标识，如果有则表示来自于tuia，如果没有则忽略

3.5 注意事项

广告主在按要求接入了JS后，广告主落地页在发生转化时，页面发生跳转，则转化请求会被中断，需要按以下方式进行跳转： 在转化发生时调用countLog.init(function,option)方法，方法含有两个参数，参数可以为空：

+ function是回调函数，需要将跳转行为通过回调函数执行，如function(){转化行为}。
+ option是标记位，当出现多个转化埋点时使用，是一个json键值对，如{locationName:valueName}, 键值和数值都可以自定义，用来区别不同的转化。