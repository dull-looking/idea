# 移动端开发

推啊做为一个互动式效果广告平台，通过在各个媒体中的投放的活动是目前最主的变现方式。移动端页面在公司业务中是一块重要的场景。目前拥有两大类型，可针对不同的媒体进行定制。

## 活动工具
活动工具是一个由前端开发完成后交由运营配置即可投放的活动页面模板，在一些追实时热点、节日等方面拥有优势。


![活动工具](http://yun.tuia.cn/h5-mami/dist/4.png)
![活动激励](http://yun.tuia.cn/h5-mami/dist/3.png)

所有活动工具的方法继承与public.js，活动各自的游戏流程写在自己的文件中，在需要的点调用继承的方法即可。
在public.js中，我们经常会用到以下方法
``` javascript
    /*
     * 获得订单号
     */
    getActivityOrder
    /*
     * 活动工具抽奖接口
     */
    getActivityLottery
    /*
     * 抽奖次数文案显示
     */
    getActivityStatusText
    /*
     * 接口错误码统一处理
     */
    getActivityErrorCode
    /*
     * 根据错误码生成弹窗信息
     */
    createErrorObject
    /*
     * 公用显示结果函数 （谢谢参与，广告券弹层，支付宝弹层，实物弹层，虚拟奖品弹层，QB弹层）
     */
    showActivityResult
    /*
     * 判断活动剩余次数
     */
    checkTimes
```

所有活动的css都写在同一个ID选择器下，并使用以下层级进行开发

``` css
  #db-content {
    ...
  }
```
![活动层级](http://yun.tuia.cn/h5-mami/dist/8.jpg)

### 活动工具激励模块
活动工具激励模块是2018Q3，针对提升复参和拓展新的流量场景一种尝试，对于参与用户每次给予一些奖励。直到用户集齐后引导至相应广告主的落地页，提高流量的利用率。

激励模块的代码在public.js中，我们经常会用到以下方法
``` javascript
    /**
     * 奖项动画
     */
    showCoin
    /**
     * 销毁激励、体验升级模块canvas
     */
    destroyCanvas
    /**
     * 不用动画只增加金币
     */
    onlyCountUp
    /**
     * 激励模块小活动
     */
    incentiveActivity
```


### 活动工具出券弹层
出券弹层做为一个广告的载体去展示广告券，每一款活动都有伴生的出券弹层。对一些行业的广告会有相应的行业广告弹层。

![出券弹层](http://yun.tuia.cn/h5-mami/dist/1.png)
![行业弹层](http://yun.tuia.cn/h5-mami/dist/2.png)

为了弹层间不会冲突在弹层类名之后加入 `-${fixer}` 来区分弹层(fixer 为弹窗样式命名空间)。
出券弹层必须写以下类名在html进行开发。
```
  // industryId 弹层id 和管理后台一致
  // 弹层在方法名用弹层id来定义
  CouponModal.prototype[industryId]

  // 用于弹层动画
  .J_coupon-modal-showPrize-dialog
  .J_coupon-modal-animate

  // 弹层最外层
  .J_modalShowPrize

  // 用于弹层关闭
  .J_coupon-modal-close
```

### 自定义活动工具
自定义活动是一种快速开发，无需发版，功能灵活的一种活动工具形式。比起正常的活动工具它更加灵活无需依赖后端发版，可以随时新增及修改。将普通的活动工具方法按照业务类型进行拆分。使得自定义活动工具的体积更小。但由于依赖关系，当自定义活动公用方法更新时，需要更新至最新公用方法的自定义活动必须重新打包上线。

## 流量引导页
流量引导页是一个测试活动不同玩法的练兵场，也用于给大客户定制活动。但是开发周期较长。

![美团定制活动](http://yun.tuia.cn/h5-mami/dist/5.png)
![美团定制活动](http://yun.tuia.cn/h5-mami/dist/6.png)

在直投页中使用以下方法，对直投页进行初始化。
```
window.adpages.init()
```

在特殊情况下使用以下方法，使流量引导页进行插件的调用。
```
window.EmbedPlugin({
  section, // 区块名称
  cb, // 等价于success=false的情况
  winCB, // 插件中奖
  closeCB, // 插件关闭
  success, // ajax请求成功【新增】
  error, // ajax请求失败【新增】
  complete // ajax请求完成【新增】
})
```

所有流量引导页的css都写在同一个ID选择器下，并使用以下层级进行开发

``` css
  #db-content，
  #meeting  {
    ...
  }
```
### 插件
插件是流量引导页的广告载体，作用于活动工具的出券弹层一致。但是样式比出券弹层丰富，灵活性也更强。

![插件](http://yun.tuia.cn/h5-mami/dist/7.png)

```
// nameSpace 命名空间一般为插件名
window.TA.pluginSkin[nameSpace] = {
  // 插件初始化
  init: function() {
  },
  watch: function() {
  },
  hander: function() {
  },
};
```

在init方法中正确传入pluginDoms
```
$plugin: $('#plugin'), // *插件dom
$closeBtn: $('#plugin .close'), // *关闭按钮
$actBtn: $('#plugin .start'), // 参与按钮,自动出券不传
$couponImg: $('#plugin .coupon-img'), // *券的图片
$couponText: $('#plugin .coupon-title'), // *券的名称
$couponBtn: $('#plugin .coupon-btn') // *看券按钮
window.TA.pluginAct.start(pluginDoms, pluginInfo);
```

在watch通过监听window.TA.pluginAct的win, lucky, lose来选择最后出的dom
```
window.TA.pluginAct.on('win', () => {
  ...
});
```

所有插件的css都写在同一个ID选择器下，并使用以下层级进行开发

``` css
  #plugin  {
    ...
  }
```

## 广告落地页
广告落地页是推啊转化的最终页。

在用户点击进行转化的时候使用以下方法统计用户的落地页点击行为
```
window.countLog.init(() => {
  ...
})
```