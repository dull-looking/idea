# 动画开发
   
  做为单页面的展现形式，页面中的动画可谓是不可缺少的一部分。动画一可以用来吸引用户跟页面的交互；二可以增加页面丰富性


   
  做为单页面的展现形式，页面中的动画可谓是不可缺少的一部分。动画一可以用来吸引用户跟页面的交互；二可以增加页面丰富性


   
  # 推啊常见的动画效果

    
![alt](https://yun.dui88.com/h5-mami/wn/效果图.jpg)

```
由于推啊写的动画效果形式太多，这里就只列举了一些数据效果最好的动画效果形式
```
## CSS方法

### 1.1 CSS3中的transition来写动画 
  
  CSS3的动画属性transition写过渡型动画可谓是信手拈来。正是因为它写起来非常的简单快捷且在移动端兼容性比较好，所以在推啊动画中也是经常用到。具体用法介绍可以参考[W3school官网transition属性介绍](http://www.w3school.com.cn/cssref/pr_transition.asp)。
  
  在这里举个在推啊动画中应用的小例子：
  
* CSS代码
``` css
  .progress {
      ...
      transition: height 0.4s linear;
  }
```

* 效果如下图
    ![alt](https://user-gold-cdn.xitu.io/2018/10/9/16658af7d6c245a9?w=32&h=136&f=gif&s=9266)
  
  ### 1.2 CSS3中的animation来写动画   
  
  css3中的另一个动画属性animation,animation是用来写帧动画，此属性在推啊动画中也是到处可见，几乎每一个页面上的动画都会用到它，用起来也是简单快捷且兼容性好。具体用法介绍可以参考[W3school官网animation属性介绍](http://www.w3school.com.cn/cssref/pr_animation.asp)。
  
  在这里举两个在推啊动画中应用的小例子：
  
  *  第一个例子css代码
```css
     .cat-cell {
       ...
       animation: wnPwx 0.3s 0s linear forwards;
      }
      @keyframes wnPwx {
        0% {
            transform: translate3d(0px, 0, 0);
        }
        10% {
            transform: translate3d(50px, -10px, 0);
        }
        20% {
            transform: translate3d(100px, -30px, 0);
        }
        30% {
            transform: translate3d(150px, 10px, 0);
        }
        40% {
            transform: translate3d(200px, 20px, 0) ;
        }
        50% {
            transform: translate3d(230px, 40px, 0) ;
        }
        60% {
            transform: translate3d(245px, 70px, 0);
        }
        70% {
            transform: translate3d(265px, 110px, 0);
        }
        80% {
            transform: translate3d(285px, 140px, 0);
        }
        90% {
            transform: translate3d(300px, 170px, 0) ;
        }
        100% {
            transform: translate3d(314px, 190px, 0);
        }
     }
```
    
* 效果如下图
    ![alt](https://user-gold-cdn.xitu.io/2018/10/16/1667b0a49ae25445?w=300&h=534&f=gif&s=695540)
    
  
*  第二个例子css代码
    
    ```css
     .niudan{
        ...
        animation: showball steps(22) 2.4s 1 0s;
     }
     @keyframes showball {
        0% {
            background-position-y: 0；
        }
        100% {
            background-position-y: 100%;
        }
     }
    ```
    
*  效果如下图
    ![alt](https://user-gold-cdn.xitu.io/2018/10/16/1667b811e8d57a69?w=300&h=525&f=gif&s=1228473)

## javascript方法

  ### 2.1 jQuery中的animate来写动画
  
  animate() 方法执行 CSS 属性集的自定义动画。虽然这个方法用起来不如css属性写动画方便快捷，但是在推啊动画中偶尔也是会用到。具体用法介绍可以参考[W3school官网animate() 方法](http://www.w3school.com.cn/jquery/effect_animate.asp)。
  
  在这里举一个在推啊动画中应用的小例子（弹层消失动画）：
  
  
* javascript代码
  
```javascript
fadeOut(options) {
    let _dom = $('.coupon-modal-showPrize');
      if ($('.J_modalShowPrize').length) {
        _dom = $('.J_modalShowPrize');
      }
      _dom.css({
        "background-color": 'rgba(0, 0, 0, 0)'
      }).animate({
        'translateY': _moveY + 'px'
      }, 800, 'ease-out', function () {
        $('.J_modalShowPrize').remove();
      });
      $('.coupon-modal-animate, .J_coupon-modal-animate').animate({
        'translateX': _moveX + 'px',
        'scale': 0
      }, 800, 'cubic-bezier(0.23, 0.21, 0.71, 1)');
      $('.coupon-modal-showPrize-dialog, .J_coupon-modal-showPrize-dialog').animate({
        'scale': 0
      }, 800, 'linear');
}

```
*  效果如下图
![alt](https://user-gold-cdn.xitu.io/2018/10/16/1667b051011f44eb?w=300&h=482&f=png&s=36430)


  ### 2.2 大佬提供的组件来写动画 
  
  由于animation中的steps()函数来写元素发生形变的动画有缺点，缺点是图片帧数过多会造成整体动画图片过大，图片帧数过少会造成动画看起来不太流畅，所以我们活动组的张敏大佬产出了一个写帧动画的组件，这里举例介绍一下用法：
  ```javascript
        var $dom = document.getElementById('start');
		var images = [
			'http://yun.tuisnake.com/h5-mami/pluginAct/treasureBox/box.png',
			'http://yun.tuisnake.com/h5-mami/pluginAct/treasureBox/act.png'
		];
		var map = ["0 0", "0 -917", "0 -1834", "0 -2751", "0 -3668", "0 -4585",
		"0 -5502","0 -6419","0 -7336","0 -8253"];
		repeat();
		function repeat() {
			var repeatAnimation = animation().loadImage(images).
			changePosition($dom, map, images[0]).repeat(1);
			repeatAnimation.start(80);
		
			var running = true;
			$dom.addEventListener('click', function () {
				if (running) {
					running = false;
					repeatAnimation.pause();
				} else {
					running = true;
					repeatAnimation.restart();
				}
			});
		}
  ```
  
  ### 2.3 其他类型   
   
  其他类型的写法还有一些是利用javasript和css、html类名配合，在合适的时间改变特定的DOM的class类名来形成动画，这种写法由于代码太零碎，就不举例了。


## canvas方法

  ### canvas在推啊的应用范围
  用canvas来写动画比CSS3和jQuery方法来写比较复杂。由于前端工程师熟练掌握canvas代码的不太多，加上写起来比较复杂，所以很多简单的推啊动画效果不会采用canvas方法来写。
  ### canvas在推啊的实例   
  
  虽然canvas写动画有条件限制，但是此方法在写推啊动画效果方法中也是需要的，下面就介绍一个应用到的实例：
  
* 刮刮卡动画

```javascript
$('#card')
    .attr('width', 652 * window.remScale)
    .attr('height', 200 * window.remScale);
  let c = document.getElementById('card');
  let context = c.getContext('2d');
  let mouseDown = false;
  var scraping = {
    cardImg: new Image(),
    init: function() {
      var self = this;
      this.events();
      this.scratch();
    },
    events: function() {
      var self = this;
      $('.start-btn')
        .off('click')
        .on('click', function() {
          scraping.doStart();
        });
    },
    scratch: function() {
      var img = new Image();
      img.src = '//yun.tuisnake.com/h5-mami/adpages/dayReward/bottom.png';
      context.globalCompositeOperation = 'source-over';
      context.beginPath();
      img.onload = function() {
        context.drawImage(
          img,
          0,
          0,
          652 * window.remScale,
          200 * window.remScale,
        );
      };
      context.closePath();
      context.globalCompositeOperation = 'destination-over';
      // 手机兼容
      c.addEventListener('touchstart', scraping.startHandler, false);
      c.addEventListener('touchmove', scraping.moveHandler, false);
      c.addEventListener('touchend', scraping.endHandler, false);

      //PC兼容
      c.addEventListener('mousedown', scraping.mouseStartHandler);
      c.addEventListener('mouseup', scraping.endHandler);
      c.addEventListener('mousemove', scraping.mouseMoveHandler);
    },
    startHandler: function() {
      $('.start-tip2').hide();
      $('.result-show').show();
      mouseDown = true;
    },
    mouseStartHandler: function() {
      $('.start-tip2').hide();
      $('.result-show').show();
      mouseDown = true;
    },
    endHandler: function(e) {
      mouseDown = false;
      e.preventDefault();
      // 出插件
      $('#plugin').show();
      scraping.reInit();
    },
    moveHandler: function(e) {
      e.preventDefault();
      //获取鼠标位置
      var x =
        e.targetTouches[0].clientX -
        document.getElementById('card').getBoundingClientRect().left;
      var y =
        e.targetTouches[0].clientY -
        document.getElementById('card').getBoundingClientRect().top;

      context.globalCompositeOperation = 'destination-out';
      context.beginPath();
      context.arc(x, y, 40 * window.remScale, 0, 2 * Math.PI, true);
      context.fill();
      context.closePath();
    },
    mouseMoveHandler: function(e) {
      if (mouseDown) {
        e.preventDefault();
        context.beginPath();
        context.fillStyle = '#f00';
        context.arc(e.offsetX, e.offsetY, 40, 0, Math.PI * 2);
        context.fill();
        context.closePath();
      }
    },
    initCard: function() {
      var self = this;
      this.cardImg.crossOrigin = 'anonymous';
      this.cardImg.src =
        'http://yun.dui88.com/h5-mami/adpages/dayReward/bottom.png';
      if (this.cardImg.complete) {
        this.card.drawImage();
      } else {
        self.cardImg.onload = function() {
          self.card.drawImage();
        };
        self.cardImg.onerror = function() {
          if (_src.indexOf('webp') === -1 && typeof ''.ossimg === 'function') {
            _src = _src.ossimg();
            self.initCard(_src);
          } else {
            _src =
              '//yun.tuisnake.com' +
              _src.substring(_src.indexOf('/', 2), _src.length);
            self.initCard(_src);
          }
        };
      }
    },
  };

```
具体效果可以访问此链接亲自体验，[点击查看](https://activity.tuia.cn/activity/index?id=8864&login=preview&appKey=jlg88lyxz7siqtmr)

## Svga方法 

SVGA 是一种同时兼容 iOS / Android / Web 多个平台的动画格式，可以很好的解决轻量单页面实现复杂动画的问题。

下面简单介绍一下使用方法：

**step1**
```
**Prebuild JS**
   Add <script src="https://cdn.jsdelivr.net/npm/svgaplayerweb@2.1.0/build/svga.min.js"></script> to your.html

or 

**NPM**
  1.npm install svgaplayerweb --save
  2.Add require('svgaplayerweb') to xxx.js
```
**step2**
```
你可以自行创建 Player 和 Parser 并加载动画

添加 Div 容器
<div id="demoCanvas" style="styles..."></div>
加载动画
var player = new SVGA.Player('#demoCanvas');
var parser = new SVGA.Parser('#demoCanvas'); // 如果你需要支持 IE6+，那么必须把同样的选择器传给 Parser。
parser.load('rose_2.0.0.svga', function(videoItem) {
    player.setVideoItem(videoItem);
    player.startAnimation();
})
```


## GIF图片

GIF格式的一张图片就可以显示一个动画效果，我们也都知道虽然一张图片就可以搞定一些动画效果，非常简单快捷粗暴，但是它的缺点太大，一是图片占内存特别大，网速慢的话就会加载的很慢；二是GIF图片被浏览器容易不会播放动画，只会显示第一帧。所以GIF图片来做动画效果在推啊动画开发中不常见，用到的地方就是显示广告券图片。