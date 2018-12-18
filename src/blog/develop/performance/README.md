# 移动端性能优化
总所周知，推啊活动线页面，是推啊业务的最终出口，无论是活动工具还是直投页，用户对于页面的初步体验不在于交互是否灵动，动画是否酷炫，而是首屏加载是否迅速
只有页面能顺利加载完成，动画效果和交互形式才能给用户良好的体验。

基于这个目标，活动工具和直投页的优化目标都是基于首屏加载的。

本章主要从javaScript/页面渲染 网络优化/图片压缩/四个方面描述移动端性能需要注重的地方
## JavaScript

### 为什么 script 标签要放在尾部

js 的下载和执行会中断了 Dom 树的更新，所以 script 标签放在首屏范围内的 HTML 代码段里会截断首屏的内容。

script 标签放在 body 底部，做与不做 async 或者 defer 处理，都不会影响首屏时间，但影响 DomContentLoad 和 load 的时间，进而影响依赖他们的代码的执行的开始时间。

    1.如果 script 标签的位置不在首屏范围内，不影响首屏时间

    2.所有的 script 标签应该放在 body 底部是很有道理的

    3.但从性能最优的角度考虑，即使在 body 底部的 script 标签也会拖慢首屏出来的速度，因为浏览器在最一开始就会请求它对应的 js 文件，而这，占用了有限的 TCP 链接数、带宽甚至运行它所需要的 CPU。这也是为什么 script 标签会有 async 或 defer 属性的原因之一。

### async 和 defer

script 标签有两个属性 async 和 defer，为什么会有这两个属性来辅助脚本加载，因为浏览器在遇到 script 标签的时候，文档的解析会停止，不再构建 document，有时打开一个网页上会出现空白一段时间，浏览器显示是刷新请求状态(也就是一直转圈)，这就会给用户很不好的体验，defer 和 async 的合理使用就可以避免这个情况，而且通常 script 的位置建议写在页面底部(移动端应用的比较多，这两个都是 html5 中的新属性)。

所以相对于默认的 script 引用，这里配合 defer 和 async 就有两种新的用法，它们之间什么区别？

`1.默认引用 script:<script type="text/javascript" src="x.min.js"></script>`

当浏览器遇到 script 标签时，文档的解析将停止，并立即下载并执行脚本，脚本执行完毕后将继续解析文档。

`2.async模式 <script type="text/javascript" src="x.min.js" async="async"></script>`

当浏览器遇到 script 标签时，文档的解析不会停止，其他线程将下载脚本，脚本下载完成后开始执行脚本，脚本执行的过程中文档将停止解析，直到脚本执行完毕。

`3.defer模式 <script type="text/javascript" src="x.min.js" defer="defer"></script>`

当浏览器遇到 script 标签时，文档的解析不会停止，其他线程将下载脚本，待到文档解析完成，脚本才会执行。

所以 async 和 defer 的最主要的区别就是 async 是异步下载并立即执行，然后文档继续解析，defer 是异步加载后解析文档，然后再执行脚本，这样说起来是不是理解了一点了  

![async/defer](https://image-static.segmentfault.com/28/4a/284aec5bb7f16b3ef4e7482110c5ddbb_articlex "图示")  



### 事件冒泡/事件代理与减少 DOM 操作

#### 事件机制

事件触发有三个阶段

window 往事件触发处传播，遇到注册的捕获事件会触发

传播到事件触发处时触发注册的事件

从事件触发处往 window 传播，遇到注册的冒泡事件会触发

事件触发一般来说会按照上面的顺序进行，但是也有特例，如果给一个目标节点同时注册冒泡和捕获事件，事件触发会按照注册的顺序执行。

```
    // 以下会先打印冒泡然后是捕获
    node.addEventListener('click',(event) =>{
        console.log('冒泡')
    },false);
    node.addEventListener('click',(event) =>{
        console.log('捕获 ')
    },true)
```

#### 注册事件

通常我们使用 addEventListener 注册事件，该函数的第三个参数可以是布尔值，也可以是对象。对于布尔值 useCapture 参数来说，该参数默认值为 false 。useCapture 决定了注册的事件是捕获事件还是冒泡事件。对于对象参数来说，可以使用以下几个属性

capture，布尔值，和 useCapture 作用一样
once，布尔值，值为 true 表示该回调只会调用一次，调用后会移除监听
passive，布尔值，表示永远不会调用 preventDefault
一般来说，我们只希望事件只触发在目标上，这时候可以使用 stopPropagation 来阻止事件的进一步传播。通常我们认为 stopPropagation 是用来阻止事件冒泡的，其实该函数也可以阻止捕获事件。stopImmediatePropagation 同样也能实现阻止事件，但是还能阻止该事件目标执行别的注册事件。

```
node.addEventListener('click',(event) =>{
    event.stopImmediatePropagation()
    console.log('冒泡')
},false);
// 点击 node 只会执行上面的函数，该函数不会执行
node.addEventListener('click',(event) => {
    console.log('捕获 ')
},true)
```

#### 事件代理

如果一个节点中的子节点是动态生成的，那么子节点需要注册事件的话应该注册在父节点上

```
<ul id="ul">
    <li>1</li>
    <li>2</li>
    <li>3</li>
    <li>4</li>
    <li>5</li>
</ul>
<script>
    let ul = document.querySelector('##ul')
    ul.addEventListener('click', (event) => {
        console.log(event.target);
    })
</script>
```

事件代理的方式相对于直接给目标注册事件来说，有以下优点

节省内存
不需要给子节点注销事件

### 防抖与节流

#### 防抖

你是否在日常开发中遇到一个问题，在滚动事件中需要做个复杂计算或者实现一个按钮的防二次点击操作。

这些需求都可以通过函数防抖动来实现。尤其是第一个需求，如果在频繁的事件回调中做复杂计算，很有可能导致页面卡顿，不如将多次计算合并为一次计算，只在一个精确点做操作。

PS：防抖和节流的作用都是防止函数多次调用。区别在于，假设一个用户一直触发这个函数，且每次触发函数的间隔小于 wait，防抖的情况下只会调用一次，而节流的 情况会每隔一定时间（参数 wait）调用函数。

我们先来看一个袖珍版的防抖理解一下防抖的实现：

```
// func是用户传入需要防抖的函数
// wait是等待时间
const debounce = (func, wait = 50) => {
  // 缓存一个定时器id
  let timer = 0
  // 这里返回的函数是每次用户实际调用的防抖函数
  // 如果已经设定过定时器了就清空上一次的定时器
  // 开始一个新的定时器，延迟执行用户传入的方法
  return function(...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      func.apply(this, args)
    }, wait)
  }
}
// 不难看出如果用户调用该函数的间隔小于wait的情况下，上一次的时间还未到就被清除了，并不会执行函数
```

这是一个简单版的防抖，但是有缺陷，这个防抖只能在最后调用。一般的防抖会有 immediate 选项，表示是否立即调用。这两者的区别，举个栗子来说：

例如在搜索引擎搜索问题的时候，我们当然是希望用户输入完最后一个字才调用查询接口，这个时候适用延迟执行的防抖函数，它总是在一连串（间隔小于 wait 的）函数触发之后调用。
例如用户给 interviewMap 点 star 的时候，我们希望用户点第一下的时候就去调用接口，并且成功之后改变 star 按钮的样子，用户就可以立马得到反馈是否 star 成功了，这个情况适用立即执行的防抖函数，它总是在第一次调用，并且下一次调用必须与前一次调用的时间间隔大于 wait 才会触发。
下面我们来实现一个带有立即执行选项的防抖函数

```
// 这个是用来获取当前时间戳的
function now() {
  return +new Date()
}
/**
 * 防抖函数，返回函数连续调用时，空闲时间必须大于或等于 wait，func 才会执行
 *
 * @param  {function} func        回调函数
 * @param  {number}   wait        表示时间窗口的间隔
 * @param  {boolean}  immediate   设置为ture时，是否立即调用函数
 * @return {function}             返回客户调用函数
 */
function debounce (func, wait = 50, immediate = true) {
  let timer, context, args

  // 延迟执行函数
  const later = () => setTimeout(() => {
    // 延迟函数执行完毕，清空缓存的定时器序号
    timer = null
    // 延迟执行的情况下，函数会在延迟函数中执行
    // 使用到之前缓存的参数和上下文
    if (!immediate) {
      func.apply(context, args)
      context = args = null
    }
  }, wait)

  // 这里返回的函数是每次实际调用的函数
  return function(...params) {
    // 如果没有创建延迟执行函数（later），就创建一个
    if (!timer) {
      timer = later()
      // 如果是立即执行，调用函数
      // 否则缓存参数和调用上下文
      if (immediate) {
        func.apply(this, params)
      } else {
        context = this
        args = params
      }
    // 如果已有延迟执行函数（later），调用的时候清除原来的并重新设定一个
    // 这样做延迟函数会重新计时
    } else {
      clearTimeout(timer)
      timer = later()
    }
  }
}
```

整体函数实现的不难，总结一下。

对于按钮防点击来说的实现：如果函数是立即执行的，就立即调用，如果函数是延迟执行的，就缓存上下文和参数，放到延迟函数中去执行。一旦我开始一个定时器，只要我定时器还在，你每次点击我都重新计时。一旦你点累了，定时器时间到，定时器重置为 null，就可以再次点击了。
对于延时执行函数来说的实现：清除定时器 ID，如果是延迟调用就调用函数

#### 节流

防抖动和节流本质是不一样的。防抖动是将多次执行变为最后一次执行，节流是将多次执行变成每隔一段时间执行。

```
/**
 * underscore 节流函数，返回函数连续调用时，func 执行频率限定为 次 / wait
 *
 * @param  {function}   func      回调函数
 * @param  {number}     wait      表示时间窗口的间隔
 * @param  {object}     options   如果想忽略开始函数的的调用，传入{leading: false}。
 *                                如果想忽略结尾函数的调用，传入{trailing: false}
 *                                两者不能共存，否则函数不能执行
 * @return {function}             返回客户调用函数
 */
_.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    // 之前的时间戳
    var previous = 0;
    // 如果 options 没传则设为空对象
    if (!options) options = {};
    // 定时器回调函数
    var later = function() {
      // 如果设置了 leading，就将 previous 设为 0
      // 用于下面函数的第一个 if 判断
      previous = options.leading === false ? 0 : _.now();
      // 置空一是为了防止内存泄漏，二是为了下面的定时器判断
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      // 获得当前时间戳
      var now = _.now();
      // 首次进入前者肯定为 true
	  // 如果需要第一次不执行函数
	  // 就将上次时间戳设为当前的
      // 这样在接下来计算 remaining 的值时会大于0
      if (!previous && options.leading === false) previous = now;
      // 计算剩余时间
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      // 如果当前调用已经大于上次调用时间 + wait
      // 或者用户手动调了时间
 	  // 如果设置了 trailing，只会进入这个条件
	  // 如果没有设置 leading，那么第一次会进入这个条件
	  // 还有一点，你可能会觉得开启了定时器那么应该不会进入这个 if 条件了
	  // 其实还是会进入的，因为定时器的延时
	  // 并不是准确的时间，很可能你设置了2秒
	  // 但是他需要2.2秒才触发，这时候就会进入这个条件
      if (remaining <= 0 || remaining > wait) {
        // 如果存在定时器就清理掉否则会调用二次回调
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        // 判断是否设置了定时器和 trailing
	    // 没有的话就开启一个定时器
        // 并且不能不能同时设置 leading 和 trailing
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };
```

## 页面渲染

### 页面懒加载与预加载

#### 懒加载

1. 什么是懒加载？
   懒加载也就是延迟加载。
   当访问一个页面的时候，先把 img 元素或是其他元素的背景图片路径替换成一张大小为 1\*1px 图片的路径（这样就只需请求一次，俗称占位图），只有当图片出现在浏览器的可视区域内时，才设置图片正真的路径，让图片显示出来。这就是图片懒加载。

2. 为什么要使用懒加载？
   很多页面，内容很丰富，页面很长，图片较多。比如说各种商城页面。这些页面图片数量多，而且比较大，少说百来 K，多则上兆。要是页面载入就一次性加载完毕。估计大家都会等到黄花变成黄花菜了。

3. 懒加载的原理是什么？
   页面中的 img 元素，如果没有 src 属性，浏览器就不会发出请求去下载图片，只有通过 javascript 设置了图片路径，浏览器才会发送请求。
   懒加载的原理就是先在页面中把所有的图片统一使用一张占位图进行占位，把正真的路径存在元素的“data-url”（这个名字起个自己认识好记的就行）属性里，要用的时候就取出来，再设置；

4. 懒加载的实现步骤？ 1)首先，不要将图片地址放到 src 属性中，而是放到其它属性(data-original)中。 2)页面加载完成后，根据 scrollTop 判断图片是否在用户的视野内，如果在，则将 data-original 属性中的值取出存放到 src 属性中。 3)在滚动事件中重复判断图片是否进入视野，如果进入，则将 data-original 属性中的值取出存放到 src 属性中。

5. 懒加载的优点是什么？
   页面加载速度快、可以减轻服务器的压力、节约了流量,用户体验好

#### 预加载

1. 什么是预加载？
   提前加载图片，当用户需要查看时可直接从本地缓存中渲染

2. 为什么要使用预加载？
   图片预先加载到浏览器中，访问者便可顺利地在你的网站上冲浪，并享受到极快的加载速度。这对图片画廊及图片占据很大比例的网站来说十分有利，它保证了图片快速、无缝地发布，也可帮助用户在浏览你网站内容时获得更好的用户体验。

3. 实现预加载的方法有哪些？
   方法一：用 CSS 和 JavaScript 实现预加载
   方法二：仅使用 JavaScript 实现预加载
   方法三：使用 Ajax 实现预加载

详见：http://web.jobbole.com/86785/

#### 懒加载和预加载的对比

1)概念：
懒加载也叫延迟加载：JS 图片延迟加载,延迟加载图片或符合某些条件时才加载某些图片。
预加载：提前加载图片，当用户需要查看时可直接从本地缓存中渲染。

2)区别：
两种技术的本质：两者的行为是相反的，一个是提前加载，一个是迟缓甚至不加载。懒加载对服务器前端有一定的缓解压力作用，预加载则会增加服务器前端压力。

3)懒加载的意义及实现方式有：
意义：
懒加载的主要目的是作为服务器前端的优化，减少请求数或延迟请求数。
实现方式： 1.第一种是纯粹的延迟加载，使用 setTimeOut 或 setInterval 进行加载延迟. 2.第二种是条件加载，符合某些条件，或触发了某些事件才开始异步下载。 3.第三种是可视区加载，即仅加载用户可以看到的区域，这个主要由监控滚动条来实现，一般会在距用户看到某图片前一定距离遍开始加载，这样能保证用户拉下时正好能看到图片。

4)预加载的意义及实现方式有：
意义:
预加载可以说是牺牲服务器前端性能，换取更好的用户体验，这样可以使用户的操作得到最快的反映。
实现方式：
实现预载的方法非常多，比如：用 CSS 和 JavaScript 实现预加载；仅使用 JavaScript 实现预加载；使用 Ajax 实现预加载。
常用的是 new Image();设置其 src 来实现预载，再使用 onload 方法回调预载完成事件。只要浏览器把图片下载到本地，同样的 src 就会使用缓存，这是最基本也是最实用的预载方法。当 Image 下载完图片头后，会得到宽和高，因此可以在预载前得到图片的大小(方法是用记时器轮循宽高变化)。

---

作者：xiaolizhenzhen
链接：https://www.jianshu.com/p/4876a4fe7731
來源：简书
简书著作权归作者所有，任何形式的转载都请联系作者获得授权并注明出处。

### 重排与重绘

#### html 页面的渲染流程

1. 浏览器把获取到的 HTML 代码解析成 1 个 DOM 树，HTML 中的每个 tag 都是 DOM 树中的 1 个节点，根节点就是我们常用的 document 对象。DOM 树里包含了所有 HTML 标签，包括 display:none 隐藏，还有用 JS 动态添加的元素等。

2. 浏览器把所有样式(用户定义的 CSS 和用户代理)解析成样式结构体，在解析的过程中会去掉浏览器不能识别的样式，比如 IE 会去掉-moz 开头的样式，而 FF 会去掉\_开头的样式。

3. DOM Tree 和样式结构体组合后构建 render tree, render tree 类似于 DOM tree，但区别很大，render tree 能识别样式，render tree 中每个 NODE 都有自己的 style，而且  rendertree 不包含隐藏的节点  (比如 display:none 的节点，还有 head 节点)，因为这些节点不会用于呈现，而且不会影响呈现的，所以就不会包含到 render tree 中。注意 visibility:hidden 隐藏的元素还是会包含到 render tree 中的，因为 visibility:hidden 会影响布局(layout)，会占有空间。根据 CSS2 的标准，render tree 中的每个节点都称为 Box (Box dimensions)，理解页面元素为一个具有填充、边距、边框和位置的盒子。

4. 一旦 render tree 构建完毕后，浏览器就可以根据 render tree 来绘制页面了。

#### 重排与重绘

1. 当 render tree 中的一部分(或全部)因为元素的规模尺寸，布局，隐藏等改变而需要重新构建。这就称为回流(reflow)。每个页面至少需要一次回流，就是在页面第一次加载的时候。在回流的时候，浏览器会使渲染树中受到影响的部分失效，并重新构造这部分渲染树，完成回流后，浏览器会重新绘制受影响的部分到屏幕中，该过程成为重绘。

2. 当 render tree 中的一些元素需要更新属性，而这些属性只是影响元素的外观，风格，而不会影响布局的，比如 background-color。则就叫称为重绘。

> 注意：回流必将引起重绘，而重绘不一定会引起回流。

回流何时发生：

当页面布局和几何属性改变时就需要回流。下述情况会发生浏览器回流：

1. 添加或者删除可见的 DOM 元素；

2. 元素位置改变；

3. 元素尺寸改变——边距、填充、边框、宽度和高度

4. 内容改变——比如文本改变或者图片大小改变而引起的计算值宽度和高度改变；

5. 页面渲染初始化；

6. 浏览器窗口尺寸改变——resize 事件发生时；

#### 优化（减少回流、重绘）

浏览器本身的优化策略：浏览器会维护 1 个队列，把所有会引起回流、重绘的操作放入这个队列，等队列中的操作到了一定的数量或者到了一定的时间间隔，浏览器就会 flush 队列，进行一个批处理。这样就会让多次的回流、重绘变成一次回流重绘。但有时候我们写的一些代码可能会强制浏览器提前 flush 队列，这样浏览器的优化可能就起不到作用了。当你请求向浏览器请求一些 style 信息的时候，就会让浏览器 flush 队列。

减少对 rendertree 的操作（合并多次多 DOM 和样式的修改），并减少对一些 style 信息的请求，尽量利用好浏览器的优化策略
方法：

1. 将多次改变样式属性的操作合并成一次操作。
2. 将需要多次重排的元素，position 属性设为 absolute 或 fixed，这样此元素就脱离了文档流，它的变化不会影响到其他元素。例如有动画效果的元素就最好设置为绝对定位。
3. 在内存中多次操作节点，完成后再添加到文档中去。例如要异步获取表格数据，渲染到页面。可以先取得数据后在内存中构建整个表格的 html 片段，再一次性添加到文档中去，而不是循环添加每一行。
4. 由于 display 属性为 none 的元素不在渲染树中，对隐藏的元素操作不会引发其他元素的重排。如果要对一个元素进行复杂的操作时，可以先隐藏它，操作完成后再显示。这样只在隐藏和显示时触发 2 次重排。
5. 在需要经常取那些引起浏览器重排的属性值时，要缓存到变量。

---

本文来自 小亚美美 的 CSDN 博客 ，全文地址请点击：https://blog.csdn.net/yummy_go/article/details/50696328?utm_source=copy

### requestAnimationFrame

#### requestAnimationFrame 是什么？

在浏览器动画程序中，我们通常使用一个定时器来循环每隔几毫秒移动目标物体一次，来让它动起来。如今有一个好消息，浏览器开发商们决定：“嗨，为什么我们不在浏览器里提供这样一个 API 呢，这样一来我们可以为用户优化他们的动画。”所以，这个 requestAnimationFrame()函数就是针对动画效果的 API，你可以把它用在 DOM 上的风格变化或画布动画或 WebGL 中。

#### 使用 requestAnimationFrame 有什么好处？

浏览器可以优化并行的动画动作，更合理的重新排列动作序列，并把能够合并的动作放在一个渲染周期内完成，从而呈现出更流畅的动画效果。比如，通过 requestAnimationFrame()，JS 动画能够和 CSS 动画/变换或 SVG SMIL 动画同步发生。另外，如果在一个浏览器标签页里运行一个动画，当这个标签页不可见时，浏览器会暂停它，这会减少 CPU，内存的压力，节省电池电量。

requestAnimationFrame 的用法

```
// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();


// usage:
// instead of setInterval(render, 16) ....

(function animloop(){
  requestAnimFrame(animloop);
  render();
})();
// place the rAF *before* the render() to assure as close to
// 60fps with the setTimeout fallback.
```

---

本文来自网络 ，全文地址请点击：http://www.webhek.com/post/requestanimationframe.html

## 网络优化

### DNS 预解析

DNS Prefetch，即 DNS 预获取，是前端优化的一部分。一般来说，在前端优化中与 DNS 有关的有两点： 一个是减少 DNS 的请求次数，另一个就是进行 DNS 预获取 。

DNS 作为互联网的基础协议，其解析的速度似乎很容易被网站优化人员忽视。现在大多数新浏览器已经针对 DNS 解析进行了优化，典型的一次 DNS 解析需要耗费 20-120 毫秒，减少 DNS 解析时间和次数是个很好的优化方式。DNS Prefetching 是让具有此属性的域名不需要用户点击链接就在后台解析，而域名解析和内容载入是串行的网络操作，所以这个方式能 减少用户的等待时间，提升用户体验 。

默认情况下浏览器会对页面中和当前域名（正在浏览网页的域名）不在同一个域的域名进行预获取，并且缓存结果，这就是隐式的 DNS Prefetch。如果想对页面中没有出现的域进行预获取，那么就要使用显示的 DNS Prefetch 了。

目前大多数浏览器已经支持 DNS-prefetch, Chrome 和 Firefox 3.5+ 内置了 DNS Prefetching 技术并对 DNS 预解析做了相应优化设置。所以 即使不设置此属性，Chrome 和 Firefox 3.5+ 也能自动在后台进行预解析 。

DNS Prefetch 应该尽量的放在网页的前面，推荐放在 `<meta charset="UTF-8">` 后面。具体使用方法如下：

```
<meta http-equiv="x-dns-prefetch-control" content="on">
<link rel="dns-prefetch" href="//www.zhix.net">
<link rel="dns-prefetch" href="//api.share.zhix.net">
<link rel="dns-prefetch" href="//bdimg.share.zhix.net">
```

需要注意的是，虽然使用 DNS Prefetch 能够加快页面的解析速度，但是也不能滥用，因为有开发者指出 禁用 DNS 预读取能节省每月 100 亿的 DNS 查询 。

如果需要禁止隐式的 DNS Prefetch，可以使用以下的标签：

`<meta http-equiv="x-dns-prefetch-control" content="off">`

### 强制缓存与协商缓存

缓存对于前端性能优化来说是个很重要的点，良好的缓存策略可以降低资源的重复加载提高网页的整体加载速度。

通常浏览器缓存策略分为两种：强缓存和协商缓存。

#### 强缓存

实现强缓存可以通过两种响应头实现：Expires 和 Cache-Control 。强缓存表示在缓存期间不需要请求，state code 为 200

```
Expires: Wed, 22 Oct 2018 08:41:00 GMT
```

Expires 是 HTTP / 1.0 的产物，表示资源会在`Wed, 22 Oct 2018 08:41:00 GMT`后过期，需要再次请求。并且 Expires 受限于本地时间，如果修改了本地时间，可能会造成缓存失效。

```
Cache-control: max-age=30
```

Cache-Control 出现于 HTTP / 1.1，优先级高于 Expires 。该属性表示资源会在 30 秒后过期，需要再次请求。

#### 协商缓存

如果缓存过期了，我们就可以使用协商缓存来解决问题。协商缓存需要请求，如果缓存有效会返回 304。

协商缓存需要客户端和服务端共同实现，和强缓存一样，也有两种实现方式。

#### Last-Modified 和 If-Modified-Since

Last-Modified 表示本地文件最后修改日期，If-Modified-Since 会将 Last-Modified 的值发送给服务器，询问服务器在该日期后资源是否有更新，有更新的话就会将新的资源发送回来。

但是如果在本地打开缓存文件，就会造成 Last-Modified 被修改，所以在 HTTP / 1.1 出现了 ETag 。

#### ETag 和 If-None-Match

ETag 类似于文件指纹，If-None-Match 会将当前 ETag 发送给服务器，询问该资源 ETag 是否变动，有变动的话就将新的资源发送回来。并且 ETag 优先级比 Last-Modified 高。

#### 选择合适的缓存策略

对于大部分的场景都可以使用强缓存配合协商缓存解决，但是在一些特殊的地方可能需要选择特殊的缓存策略

对于某些不需要缓存的资源，可以使用 `Cache-control: no-store` ，表示该资源不需要缓存
对于频繁变动的资源，可以使用 `Cache-Control: no-cache`并配合 ETag 使用，表示该资源已被缓存，但是每次都会发送请求询问资源是否更新。
对于代码文件来说，通常使用 `Cache-Control: max-age=31536000`并配合策略缓存使用，然后对文件进行指纹处理，一旦文件名变动就会立刻下载新的文件。


### HTTP2.0 协议概述
HTTP 2.0 相比于 HTTP 1.X，可以说是大幅度提高了 web 的性能。

在 HTTP 1.X 中，为了性能考虑，我们会引入雪碧图、将小图内联、使用多个域名等等的方式。这一切都是因为浏览器限制了同一个域名下的请求数量，当页面中需要请求很多资源的时候，队头阻塞（Head of line blocking）会导致在达到最大请求数量时，剩余的资源需要等待其他资源请求完成后才能发起请求。

因为浏览器会有并发请求限制，在 HTTP / 1.1 时代，每个请求都需要建立和断开，消耗了好几个 RTT 时间，并且由于 TCP 慢启动的原因，加载体积大的文件会需要更多的时间。

在 HTTP / 2.0 中引入了多路复用，能够让多个请求使用同一个 TCP 链接，极大的加快了网页的加载速度。并且还支持 Header 压缩，进一步的减少了请求的数据大小。




#### 二进制传输
HTTP 2.0 中所有加强性能的核心点在于此。在之前的 HTTP 版本中，我们是通过文本的方式传输数据。在 HTTP 2.0 中引入了新的编码机制，所有传输的数据都会被分割，并采用二进制格式编码。



#### 多路复用
在 HTTP 2.0 中，有两个非常重要的概念，分别是帧（frame）和流（stream）。

帧代表着最小的数据单位，每个帧会标识出该帧属于哪个流，流也就是多个帧组成的数据流。

多路复用，就是在一个 TCP 连接中可以存在多条流。换句话说，也就是可以发送多个请求，对端可以通过帧中的标识知道属于哪个请求。通过这个技术，可以避免 HTTP 旧版本中的队头阻塞问题，极大的提高传输性能。

#### Header 压缩
在 HTTP 1.X 中，我们使用文本的形式传输 header，在 header 携带 cookie 的情况下，可能每次都需要重复传输几百到几千的字节。

在 HTTP 2.0 中，使用了 HPACK 压缩格式对传输的 header 进行编码，减少了 header 的大小。并在两端维护了索引表，用于记录出现过的 header ，后面在传输过程中就可以传输已经记录过的 header 的键名，对端收到数据后就可以通过键名找到对应的值。

#### 服务端 Push
在 HTTP 2.0 中，服务端可以在客户端某个请求后，主动推送其他资源。

可以想象以下情况，某些资源客户端是一定会请求的，这时就可以采取服务端 push 的技术，提前给客户端推送必要的资源，这样就可以相对减少一点延迟时间。当然在浏览器兼容的情况下你也可以使用 prefetch 
### 服务端 Gzip 压缩作用与原理
gzip是GNUzip的缩写，最早用于UNIX系统的文件压缩。HTTP协议上的gzip编码是一种用来改进web应用程序性能的技术，web服务器和客户端（浏览器）必须共同支持gzip。目前主流的浏览器，Chrome,firefox,IE等都支持该协议。常见的服务器如Apache，Nginx，IIS同样支持gzip。  

gzip压缩比率在3到10倍左右，可以大大节省服务器的网络带宽。而在实际应用中，并不是对所有文件进行压缩，通常只是压缩静态文件。

1. 浏览器请求url，并在request header中设置属性accept-encoding:gzip。表明浏览器支持gzip。

2. 服务器收到浏览器发送的请求之后，判断浏览器是否支持gzip，如果支持gzip，则向浏览器传送压缩过的内容，不支持则向浏览器发送未经压缩的内容。一般情况下，浏览器和服务器都支持gzip，response headers返回包含content-encoding:gzip。

3. 浏览器接收到服务器的响应之后判断内容是否被压缩，如果被压缩则解压缩显示页面内容。

推啊目前所有域名均覆盖gzip压缩,单日流量节省近60G,用户访问时间提升约为50ms
### 其他的优化手段

## 图片压缩

### 灵活使用雪碧图


CSS雪碧 即CSS Sprite，也有人叫它CSS精灵，是一种CSS图像合并技术，该方法是将小图标和背景图像合并到一张图片上

日常的皮肤开发中会经常使用到雪碧图也叫精灵图，常用的方式是生成一串序列帧合成雪碧图，通过改变`background-position`来切换图片  
 
优点：加载网页图片时，减少服务器的请求次数，提高页面的加载速度。  
 
缺点：耗费内存，影响浏览器的缩放功能，拼图维护比较麻烦，使CSS的编写变得困难


### 选择正确的图片格式 


#### JPG
优点：  

* 占内存小,网页加载速度快;
* 主要用于摄影作品或者写实作品（或是其他细节、色彩丰富的图片）或大的背景图；对多色彩表现较好；不适于文字较多的图片。根据经验我们在页面中使用的商品图片、采用人像或者实物素材制作的广告Banner等图像更适合采用JPG的图片格式保存。
缺点：  

* JPG格式图片是有损压缩的图片，有损压缩会使原始图片数据质量下降，即JPG会在压缩图片时降低品质。
#### PNG

优点：   

* PNG格式图片是无损压缩的图片，能在保证最不失真的情况下尽可能压缩图像文件的大小。 
* 图片质量高；色彩表现好；支持透明效果；提供锋利的线条和边缘，所以做出的logo等小图标效果会更好；更好地展示文字、颜色相近的图片。
* PNG用来存储灰度图像时，灰度图像的深度可多到16位，存储彩色图像时，彩色图像的深度可多到48位，并且还可存储多到16位的α通道数据。 
* 所含颜色很少、具有大块颜色相近的区域或亮度差异十分明显的较简单的图片则需要采用PNG。但也会有一些特殊情况，例如有些图像尽管色彩层次丰富，但由于图片尺寸较小，上面包含的颜色数量有限时，也可以尝试用PNG进行存储。而有些矢量工具绘制的图像由于采用较多的滤镜特效也会形成丰富的色彩层次，这个时候就需要采用JPG进行存储了。主要用于小图标或颜色简单对比强烈的小的背景图。根据经验用于页面结构的基本视觉元素，如容器的背景、按钮、导航的背景等应该尽量用PNG格式进行存储，这样才能更好的保证设计品质。  

缺点：  
* 占内存大,会导致网页加载速度慢;
* 对于需要高保真的较复杂的图像，PNG虽然能无损压缩，但图片文件较大，不适合应用在Web页面上。   

#### WEBP
WebP是谷歌开发的一种新图片格式，WebP是同时支持有损和无损压缩的、使用直接色的、点阵图。 
优点：  

*  相同质量的图片，WebP具有更小的文件体积  

缺点：  

* 兼容性上存在问题，部分浏览器目前还不支持
* GIF图经过WEBP格式压缩会存在异常  

 
>小的图片可以使用 base64 格式，减少页面请求
