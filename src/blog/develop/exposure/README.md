
# 活动埋点
（基于tuia-h5工程）
## 什么是埋点

埋点是网站分析常用的一种数据采集方法，在产品、服务转化关键点植入统计代码，据其独立ID确保数据采集不重复；
## 埋点的作用
数据分析是我们获得需求的来源之一，通过对数据的比对，对数据趋势的分析，能让我们发现哪些环节存在问题，哪些环节有提高空间。同时，数据分析也是检验功能是否有效，是否受欢迎的重要佐证，以数据的形式呈现出来非常直观有力，而这些数据大部分都来自于数据埋点。
## 实现原理
数据埋点可以分为两类，页面统计和行为统计；
页面统计，监控页面的加载行为，可以帮我们获取到页面被访问的相关数据，页面访问的人数和次数，用户在页面停留的时长等等；

行为统计是指用户在界面上的操作行为，应用最广泛的是对按钮点击次数的采集，通过对UI界面响应事件的捕捉，我们能够得知某个按钮的点击数及对应的点击率；

后端根据一定的策略，生成曝光和点击两类埋点数据，曝光埋点数据用于页面统计，点击埋点数据用于行为统计，返回给前端，前端页面初始化渲染的时候，一种方案是将数据塞入对应的dom节点，当页面上某些特定模块展示在屏幕可视区域时，将前面塞入的埋点数据发送到后端，即为页面统计的埋点流程，发生被点击或者滑动等用户交互行为，将点击埋点数据发送到后端，即为行为统计的埋点流程；另一种方案将推送的埋点数据存在js对象中，当页面动态加载某个模块时发送对应曝光埋点数据，或者页面dom结构加载完发送某些模块的曝光埋点数据，当发生某些模块被点击或者滑动等用户交互行为时，将js对象中对应的点击埋点数据发送到后端；
## 活动工具埋点
活动工具里埋点接口有一个独立的模块statistics-3.js，定义了一个埋点对象，内容如下：
```js
var exposure = {
      logTimeout: null,
      $win: $(window),
      initLog: function() {
        var self = this;
        self.showLog();
        self.clickLog();
        self.srollLog();
      },
      // 手动发曝光埋点
      singleExp: function(data) {},
      // 自动发曝光埋点
      showLog: function(callback) {},
      // 手动发点击埋点
      singleClk: function(options) {},
      // 自动发点击埋点
      clickLog: function(callback) {},
      //屏幕滚动中发曝光埋点
      srollLog: function(callback) {},
      // 参数处理发送请求
      sendApi: function(data, complete, success, error) {}
    };
  ```
活动工具模板在后端渲染时，埋点数据被赋值给CFG对象的相应属性，随着html页面返回到前端；文档加载完毕之后，在延迟加载文件函数loadFiles中，进行埋点方法的调用，如下所示：
```js
Promise.all([this.getActivitylimitTimes({optionCb})])
          .then(() => {
            window.DB && window.DB.exposure && window
              .DB
              .exposure
              .initLog();
```
或者
```js
Promise.all([this.getActivityOptions({optionCb})])
          .then(() => {
            window.DB && window.DB.exposure && window
              .DB
              .exposure
              .initLog();
```
(1)showLog方法会遍历body下的节点，找到有db-exposure属性并且没有db-exposure-get属性的节点，db-exposure属性值是从后端返回的埋点数据，在文档加载过程中动态塞入节点中（活动工具一般没有这个环节），当节点暴露在屏幕可视区域时，发送曝光请求，将埋点数据发送到后端，同时将节点标记为已曝光；

(2)clickLog方法会遍历body下有db-click属性的节点，为节点绑定点击事件，db-click属性值即点击埋点数据，节点被点击时将点击埋点数据传入后端；

(3)srollLog方法监控屏幕的滚动事件，监控到屏幕滚动时调用showLog方法；

活动工具一般有以下曝光和点击埋点：奖品列表的点击埋点，活动规则的曝光和点击埋点，已获得奖品点击埋点，客服点击埋点，参与活动后出弹层或者插件的曝光埋点，关闭插件或者弹层的点击埋点，点击领券的点击埋点；
##### 1.奖品列表埋点
活动工具中奖品列表目前主要有四种形式，常规、圆形大转盘、部分挖金矿、部分吹气球，
奖品列表有一套独立的模块prizesRender.js，四种类型都只对列表中各个奖品的点击行为进行埋点，对曝光不进行埋点；

常规奖品列表的活动工具皮肤里，在页面初始化回调方法optionCb中调用模块的初始化方法，初始化奖品列表对象，在prizesRender中将ajaxOptions接口中获取到的埋点数据，分别填入需要进行点击埋点的节点中，作为节点data-clickLog属性的值，并对节点定义点击事件，当点击事件被触发时，调用曝光模块的方法，将data-clickLog属性值作为埋点数据传入后端；

圆形大转盘、部分挖金矿和部分吹气球，在optionCb中只对各个节点进行编号，当这些节点被点击时，通过编号从CFG中获取对应的埋点数据，调用曝光模块的方法将埋点数据传入后端；

##### 2.活动规则埋点
活动规则有一个独立模块ruleModal，在common.js中加载完之后，立即执行进行活动规则样式的渲染和点击事件的绑定，点击规则按钮发送规则点击埋点，展示规则详情弹窗，然后发送规则详情的曝光数据；关闭规则时，发送关闭规则的点击埋点数据给后端；点击展示更多规则说明或者向上收起规则说明，会将更多或者更少规则点击埋点数据发给后端，这里的埋点数据是随着html页面从后端返回的CFG信息里相应的数据
* embedData.st_info_rule_click、
* embedData.st_info_rule_exposure、
* embedData.st_info_rule_close_click、
* embedData.st_info_rule_more_click，
* embedData.st_info_rule_less_click；

埋点数据的发送，都是通过调用曝光对象的手动发送点击和曝光埋点的方法；

##### 3.弹层埋点
用户参与活动之后，正常情况下有两种结果：中奖和未中奖；中奖情况下出中奖弹层，未中奖出谢谢参与弹层；

根据中奖奖品不同定义了6种不同的弹层模块：广告券、支付宝、实物、Q币、充值卡、虚拟奖品，目前大多数是广告弹层；

广告券弹层又分为两种情况，1.大多数活动工具走公共的以弹层形式出券的逻辑，2.特殊活动工具自定义的特殊出券形式；公共的出弹层出券逻辑模块目录：/module/showCouponprize/public-4，分别对券的曝光、券图片点击、领券按钮点击、关闭弹层点击、券标题点击、再来一次点击事件进行埋点，埋点数据从activity/result接口中获取到的，分别是
* data.lottery.st_info_dpm_exposure,
* data.lottery.st_info_dpm_img_click，
* data.lottery.st_info_dpm_btn_get,
* data.lottery.st_info_dpm_btn_close,
* data.lottery.st_info_dpm_title_click,
* data.lottery.st_info_dpm_btn_again，

每一个埋点都有对应的降级埋点数据，分别是
* data.lottery.st_info_dpm_exposure_downgrade,
* data.lottery.st_info_dpm_img_click_downgrade,
* data.lottery.st_info_dpm_btn_get_downgrade,
* data.lottery.st_info_dpm_btn_close_downgrade,
* data.lottery.st_info_dpm_title_click_downgrade,
* data.lottery.st_info_dpm_btn_again_downgrade,

降级埋点实际是活动工具配套弹层，每个活动工具必须有一个配套弹层，页面初始化时会预加载这个弹层，当网络不好或者其他情况，会出这个配套的保底弹层，同时发送这些降级埋点数据，埋点发送接口是上文中提到的活动工具埋点统一接口window.DB.exposure的方法；

采用各自定义的出券和埋点方式的，只有卡包、打老板和卡牌，埋点数据还是上面提到的这些，只是在活动参与不同的环节进行曝光和埋点数据发送；

当未中奖时，出谢谢参与弹层，逻辑模块目录：/module/showThanks，谢谢弹层出现时，会首先进行弹层的曝光data.lottery.stRecommendInfo，如果弹层上有其他推荐区块，会进行相应区块的曝光，数据分别是data.lottery.block1.exposure和data.lottery.block2.exposure；对弹层上“我的奖品”按钮，区块内容，弹层关闭按钮进行点击埋点，数据分别是data.lottery.block3.click、data.lottery.block1、data.lottery.block2，这些数据也都是从activity/result接口中获取到的，同时通过活动统一的埋点接口进行发送；

最后活动参与次数用光之后，用户再次参与时会出推荐弹层，推荐弹层走的是另一个接口activity/getRecommend，这个模块目录：/module/showRecommend，对弹层本身有一个曝光埋点，然后是对弹层的关闭按钮和区块进行曝光，分别是
* data.stRecommendInfo、
* data.btnClose.stInfoExposure、
* data.block1.stInfoExposure、
* data.block2.stInfoExposure、
* data.block3.stInfoExposure、
* data.block4.stInfoExposure，

对弹层的关闭按钮进行了点击埋点，数据为data.btnClose.stInfoClick，这里的数据都是从推荐弹层接口中获取到的；




##  落地页埋点方案  


### 一、基本名词介绍

（1）曝光数据 页面PV/UV，PV即页面浏览量，用户每1次对网站中的每个网页访问均被记录1次。用户对同一页面的多次访问，访问量累计。UV指根据PV去掉重复访问页面的用户数据。

（2）转化数据 用户进入页面后，根据广告需求，将某个特定的行为计算为转化，例如点击，长按，提交表单等。用户触发事件时，向数据服务器发送数据。

（3）常用参数含义 a_oId :唯一标识订单id a_cid :唯一标识用户id

### 二、技术实现

1. 推啊会在每个投放链接后面拼装上唯一标识的信息，例如：a_oId(唯一订单号)，a_cid(唯一用户id)等等。
2. 推啊服务器收到广告主的请求，会记录日志。推啊通过日志分析则知道是哪个订单，哪个广告，哪个用户发生了转化。

**落地页部分对接 - JS对接**

1.1 引入JS文件

在落地页页面的head中加入脚本:
```JavaScript
<script type="text/javascript" src="//yun.tuisnake.com/h5-mami/log.js" id="send_log"></script>
```

1.2 点击事件转化

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

1.3 长按屏幕转化

备注：有些需要长按复制内容。 在需要统计屏幕长按转化的DOM元素上添加data-setting-press属性。例如：

```JavaScript
<div class="form-group bg" data-setting-press="value">
  <label class="control-label">复制</label>
</div>
```

在长按元素上添加data-setting-press元素，用户按800ms会计算一次转化。

1.4 点击复制到系统剪贴板

背景：针对下载类落地页，会把唯一标识复制到剪贴版，以便下载完应用后，通过剪贴版拿到唯一标识。

在需要点击复制的元素上添加data-setting-copy属性。
若跳转到落地页链接为：//www.tuia.cn?a_oId=taw-123&a_cid=taw-456 则data-setting-copy=”${a_oId}” 点击复制的剪贴版的值为taw-123； 例如：

``` JavaScript
<button data-setting-copy="${a_oId}"></div>
```
注意：为了严格区分剪贴板是否包含推啊的内容，推啊在a_oId前会加上taw-的标识，所以希望在取值时判断剪贴板内容是否包含taw-这个标识，如果有则表示来自于tuia，如果没有则忽略

1.5 注意事项

广告主在按要求接入了JS后，广告主落地页在发生转化时，页面发生跳转，则转化请求会被中断，需要按以下方式进行跳转： 在转化发生时调用countLog.init(function,option)方法，方法含有两个参数，参数可以为空：

+ function是回调函数，需要将跳转行为通过回调函数执行，如function(){转化行为}。
+ option是标记位，当出现多个转化埋点时使用，是一个json键值对，如{locationName:valueName}, 键值和数值都可以自定义，用来区别不同的转化。
















