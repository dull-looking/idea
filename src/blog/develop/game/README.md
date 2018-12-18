# 游戏开发
> 这里的游戏开发并不是传统意义上的大型游戏开发(繁杂的技术)。只是简单介绍如何利用`DOM`或者`Canvas`结合物理引擎使页面更具趣味性，从而提高用户参与度。

推啊很多活动页面通过趣味性的游戏玩法来吸引用户参与，前端工程师利用`CSS3`的特性就可以写出效果炫酷且性能不俗的页面了。

在特殊场景下，页面里也会用到`Canvas`或者`WebGL`的技术进行性能优化。

## 基础绘图
`Canvas`提供了基础`API`让开发者进行绘制操作。

```js
/*
* 然而并没有直接绘制圆角矩形的方法
* 这里是个简单的demo
*/
const ctx = document.querySelector('canvas').getContext('2d')

roundRect(0, 0, 100, 100, 10)
ctx.fillStyle = '#fc3'
ctx.fill()

function roundRect(x, y, w, h, r) {
    ctx.beginPath()
    ctx.moveTo(x, y + r)
    ctx.lineTo(x, y + h - r)
    ctx.quadraticCurveTo(x, y + h, x + r, y + h)
    ctx.lineTo(x + w - r, y + h)
    ctx.quadraticCurveTo(x + w, y + h, x + w, y + h - r)
    ctx.lineTo(x + w, y + r)
    ctx.quadraticCurveTo(x + w, y, x + w - r, y)
    ctx.lineTo(x + r, y)
    ctx.quadraticCurveTo(x, y, x, y + r)
    ctx.closePath()
}
```
![圆角矩形](/tuia-frontend-manual/game.1.jpg)

[jsfiddle](https://jsfiddle.net/JetLu/ftun1pjr/)


如果想画个带文字的按钮该怎么办呢？也很简单。

```js
const ctx = document.querySelector('canvas').getContext('2d')

roundRect(0, 0, 100, 100, 10) // 定义同上
ctx.fillStyle = '#fc3'
ctx.fill()
ctx.fillStyle = '#fff'
ctx.font = '20px san-serif'
ctx.textAlign = 'center'
ctx.textBaseline = 'middle'
ctx.fillText('Button', 50, 50)
```
![按钮](/tuia-frontend-manual/game.2.jpg)

[jsfiddle](https://jsfiddle.net/JetLu/v5acm70L/)

有没有觉得挺好玩，也还挺简单的。是的，目前为止的这些操作都没有含金量。

于是，你想让按钮点击放缩？

这就不简单了，首先`Canvas`里绘制的一切，并没有层级关系，也没有父子级关系。如果你想实现类似`DOM`的`nodeA.appendChild(nodeB)`，又或者`zIndex = 3`。那么你需要自己手动构造这一切，想要实现的完美，对开发者是极大的考验。

有时候借助一下外力，也是可取的，这正是下一节要向大家介绍的内容。

当然，作为一名有理想，脱离了低级趣味的程序员——你，就是想尝试。那么，我，只能抛砖引玉了。

```js
const
    canvas = document.querySelector('canvas'),
    ctx = canvas.getContext('2d')

class Point {
    x = 0
    y = 0

    constructor(x, y) {
        this.set(x, y)
    }

    set(x, y) {
        y === undefined ? y = x : null
        this.x = x
        this.y = y
    }
}

class Node {
    children = []
    position = new Point()
    scale = new Point(1)

    get x() {
        return this.position.x
    }

    get y() {
        return this.position.y
    }

    addChild(...nodes) {
        nodes.forEach(node => node.parent = this)
        this.children.push(...nodes)
    }

    render(ctx) {

    }
}

class Graphics extends Node {
    shape = {}
    constructor() {
        super()
    }

    beginFill(color) {
        this.shape.fillColor = color
    }

    drawRoundRect(x, y, w, h, r) {
        Object.assign(this.shape, {x, y, w, h, r})
    }

    render(ctx) {
        ctx.save()
        ctx.scale(this.scale.x, this.scale.y)

        let {x, y, w, h, r, fillColor} = this.shape
        ctx.fillStyle = fillColor
        x += this.x
        y += this.y
        ctx.beginPath()
        ctx.moveTo(x, y + r)
        ctx.lineTo(x, y + h - r)
        ctx.quadraticCurveTo(x, y + h, x + r, y + h)
        ctx.lineTo(x + w - r, y + h)
        ctx.quadraticCurveTo(x + w, y + h, x + w, y + h - r)
        ctx.lineTo(x + w, y + r)
        ctx.quadraticCurveTo(x + w, y, x + w - r, y)
        ctx.lineTo(x + r, y)
        ctx.quadraticCurveTo(x, y, x, y + r)
        ctx.closePath()
        ctx.fill()

        this.children.forEach(child => child.render(ctx))

        ctx.restore()
    }
}

class Text extends Node {
    textAlign = 'center'
    textBaseline = 'middle'

    constructor(str, style={}) {
        super()
        this.str = str
        this.style = Object.assign({color: '#000', size: 20, family: 'san-serif'}, style)
    }

    render(ctx) {
        ctx.font = `${this.style.size}px ${this.style.family}`
        ctx.fillStyle = this.style.color
        ctx.textAlign = this.textAlign
        ctx.textBaseline = this.textBaseline
        ctx.fillText(this.str, this.x + this.parent.x, this.y + this.parent.y)
    }
}

function render(node) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    node.render(ctx)
}

/*
* 以上借鉴了 Pixi.js 的实现
* 简单展示用，更多细节可以参考 Pixi.js 源码
* ↓ 主代码 ↓
*/

const btn = new Graphics()
const text = new Text('Button', {color: '#f90'})

btn.beginFill('#fc3')
btn.position.set(100, 30)
btn.drawRoundRect(0, 0, 100, 100, 10)
btn.addChild(text)

text.position.set(50)

canvas.addEventListener('pointerdown', ev => {
    btn.scale.set(.5)
})

canvas.addEventListener('pointerup', () => {
    btn.scale.set(1)
})

!function loop() {
    render(btn)
    requestAnimationFrame(loop)
}()
```
![按钮](/tuia-frontend-manual/game.4.gif)

[jsfiddle](https://jsfiddle.net/JetLu/n5xqvczf/)

## 渲染引擎
> 通过上面一节的介绍，大家应该发现，如果用`Canvas`原生`API`来进行项目开发，工作量是极其恐怖的。

有什么办法可以像操作`DOM`一样便捷的操作`Canvas`吗？

有的，这里列举一些国内外开源的库(`Canvas`或者`WebGL`):
 - [pixi.js](https://github.com/pixijs/pixi.js)
 - [spritejs](https://github.com/spritejs/spritejs)
 - [phaser](https://github.com/photonstorm/phaser)
 - [fabric.js](https://github.com/fabricjs/fabric.js)
 - [konva](https://github.com/konvajs/konva)
 - [three.js](https://github.com/mrdoob/three.js)
 - [Babylon.js](https://github.com/BabylonJS/Babylon.js)(游戏引擎)

列了挺多，个人推荐`pixi.js`。为什么呢？因为我对`pixi.js`比较了解，另外`pixi.js`支持`WebGL`和`Canvas2D`两种渲染方式，**极高的性能**写游戏也游刃有余。

至于是不是真的方便开发，写了才知道。还是举上一节在`Canvas`里放个点击放缩按钮的例子。

```js
const app = new PIXI.Application({
    width: 800,
    height: 600,
    transparent: true
})

document.body.appendChild(app.view)

// 绘制圆角矩形
const btn = new PIXI.Graphics()
btn.beginFill(0xffcc33)
btn.drawRoundedRect(0, 0, 100, 100, 10)
btn.endFill()
btn.pivot.set(50)
btn.position.set(100)

// 文本
const text = new PIXI.Text('Button', {
    fill: '#fff',
    fontSize: 20,
    fontFamily: 'san-serif'
})
text.anchor.set(.5)
text.position.set(50)
btn.addChild(text)

// 开启事件监听
btn.interactive = true
btn.on('pointerdown', () => {
	btn.scale.set(.5)
}).on('pointerup', () => {
	btn.scale.set(1)
}).on('pointerupoutside', () => {
	btn.scale.set(1)
})

app.stage.addChild(btn)
```
![按钮](/tuia-frontend-manual/game.3.gif)

[jsfiddle](https://jsfiddle.net/JetLu/y0tLg5ac/)

这是功能全面的封装而且是通过`WebGL`渲染的，这意味的比`Canvas`封装的库拥有更高的性能，以及可以实现更多炫酷的效果。

所以，继续举个例子。这个例子可能稍显复杂但有趣。

```js
const app = new PIXI.Application(800, 600)
document.body.appendChild(app.view)

const bg = PIXI.Sprite.fromImage('https://pixijs.io/examples/required/assets/depth_blur_BG.jpg')
bg.width = app.screen.width
bg.height = app.screen.height
app.stage.addChild(bg)

const littleDudes = PIXI.Sprite.fromImage('https://pixijs.io/examples/required/assets/depth_blur_dudes.jpg')
littleDudes.x = (app.screen.width / 2) - 315
littleDudes.y = 200
app.stage.addChild(littleDudes)

const littleRobot = PIXI.Sprite.fromImage('https://pixijs.io/examples/required/assets/depth_blur_moby.jpg')
littleRobot.x = (app.screen.width / 2) - 200
littleRobot.y = 100
app.stage.addChild(littleRobot)

const
    blurFilter1 = new PIXI.filters.BlurFilter(),
    blurFilter2 = new PIXI.filters.BlurFilter()

littleDudes.filters = [blurFilter1]
littleRobot.filters = [blurFilter2]

let count = 0

app.ticker.add(function() {
    count += .005
    blurFilter1.blur = 20 * Math.cos(count)
    blurFilter2.blur = 20 * Math.sin(count)
})
```
![demo](/tuia-frontend-manual/game.5.gif)

[jsfiddle](https://jsfiddle.net/JetLu/sk4b9x35/)

`Pixi.js`还有一堆强大的功能，这里就不一一介绍了，可以玩一下官网的示例。

## 物理引擎
> 如果已经熟练操作`Canvas`了或者说写各种炫酷效果已经手到擒来了，想写个游戏试试身手，那么物理引擎可以助你一臂之力。当年红极一时的《愤怒的小鸟》，就用了物理引擎界知名的[`Box2D`](https://github.com/erincatto/Box2D)。

当然，物理引擎不是一款游戏所必须的。但是，学会使用物理引擎是游戏开发者所必须的。

开始之前，先聊一下什么是物理引擎。物理引擎，可以把它理解为负责物理运算的函数，开发者输入值调用函数，拿到计算结果渲染到界面。

听起来有点懵？画个图。

![物理引擎](/tuia-frontend-manual/物理引擎.png)

Talk is cheap. Show me the code?

选择一款物理引擎库`Planck.js`，这是一款`Box2D`系且由纯`JavaScript`编写的引擎，`API`对前端开发者更友好。

下面这个例子简单地说明如何在`DOM`里结合物理引擎做一些效果。省略了`CSS`代码，详情见`jsfiddle`。
```js
const
    world = planck.World(planck.Vec2(0, 5)),
    ptm = 32,
    step = 1 / ptm,
    nodes = []

!function loop() {
    for (let body = world.getBodyList(); body; body = body.getNext()) {
        if (!body.node) continue
        const
            node = body.node,
            point = body.getPosition()

        node.x = point.x * ptm
        node.y = point.y * ptm
        node.rotation = body.getAngle() * 180 / Math.PI
    }
    world.step(step)
    render()
    requestAnimationFrame(loop)
}()

planck.Body.prototype.addBox = function(option) {
  const
    shape = planck.Box(
      option.width * .5 * step,
      option.height * .5 * step,
      option.center ? planck.Vec2(option.center.x * step, option.center.y * step) : null,
      option.angle
    ),

    def = {
      density: getValue(option.density, 1),
      restitution: getValue(option.restitution, .2)
    }

  this.createFixture(shape, def)
  return this
}


document.body.addEventListener('pointerdown', ev => {
	const
  	el = document.createElement('i'),
  	node = {x: ev.pageX, y: ev.pageY, rotation: 0, el: el}

  document.body.appendChild(el)
  nodes.push(node)
	addBody(node).addBox({width: 40, height: 40})
})

const ground = document.createElement('i')
ground.classList.add('ground')
nodes.push({
	x: 450,
  y: 500,
  rotation: 0,
  el: ground
})
document.body.appendChild(ground)

addBody(nodes[0], {type: planck.Body.STATIC}).addBox({width: 800, height: 10})

function render() {
	nodes.forEach(item => {
  	item.el.style.top = `${item.y}px`
    item.el.style.left = `${item.x}px`
    item.el.style.transform = `translate(-50%, -50%) rotate(${item.rotation}deg)`
  })
}

function getValue(v, e) {
	return v === undefined ? e : v
}

function addBody(node, option={}) {
	const body = world.createBody({
  	type: getValue(option.type, planck.Body.DYNAMIC),
    position: planck.Vec2(node.x * step, node.y * step)
  })
  body.node = node
  return body
}
```

![物理引擎](/tuia-frontend-manual/game.6.gif)

[jsfiddle](https://jsfiddle.net/JetLu/v325wyao/)

## 算法
> 有了物理引擎的加持再加上漂亮的美术资源以及高效的渲染引擎，写一个小游戏应该不成问题。

所以，让我们踏上新的征程——算法。算法，听起来很高大上，其实无处不在。加密也好，排序也罢，都是算法。

游戏里算法常见有：自动寻路、碰撞检测(包含在物理引擎内)...

如果开发者使用的是诸如`Unity`这样的游戏引擎，已经包含大量需要以上算法实现的功能，开发者只要简单调用就可以实现想要的效果。

### A* 寻路
塔防类或者RPG类应该会用到一些寻路算法，不一定是`A*`也有可能是导航网格之类的算法。
这里我们先看一个例子。

![A*](/tuia-frontend-manual/game.7.gif)

现在我们来简单介绍一下`A*`的实现步骤。

首先，`A*`是基于格子的，就如上图所示的。所以在使用该寻路算法之前需要先将地图划分方格区块，然后用一个二维数组表示。

![A*](/tuia-frontend-manual/game.8.jpg)

如上图所示：

起点：绿色
终点：蓝色
障碍物：灰色

现在要找到一条不穿过障碍物从起点走到终点的最短路径。

起点坐标：`{x: 0, y: 0, walkable: true}`

终点坐标：`{x: 6, y: 6, walkable: true}`

类似的一系列障碍物坐标：`{x: 4, y: 4, walkable: false}, {x: 4, y: 5, walkable: false}...`

**`walkable`**: 标记区域是否可通行

1. 获取起点周围邻节点

![A*](/tuia-frontend-manual/game.9.jpg)

```js
a: {x: 1, y: 0, walkable: true, g: 1, h: 11}
b: {x: 1, y: 1, walkable: true, g: 1.4, h: 10}
c: {x: 0, y: 1, walkable: true, g: 1, h: 11}
```


**`g`**: 从起点走到当前点的**累计消耗**(直线方向的移动每次消耗：1，对角线移动每次消耗：1.4(Math.SQRT2))，这些消耗值可以根据需要选定

**`h`**: 当前点到终点的曼哈顿距离(`Math.abs(x1 - x2) + Math.abs(y1 - y2)`)

从起点到`a`点，右移一步，所以`a.g = 1`，`a`点到终点的曼哈顿距离：`a.h = 6 - 1 + 6 - 0`。

从起点到`b`点，沿对角线移动一步，所以`b.g = 1.4`，`b`点到终点的曼哈顿距离：`b.h = 6 - 1 + 6 - 1`。

从起点到`c`点，下移一步，所以`c.g = 1`，`c`点到终点的曼哈顿距离：`c.h = 6 - 0 + 6 - 1`。

2. 在邻节点里挑出`g + h`值最小的

> `g + h`最小意味着，已走的路和即将要走的路之和最少，是最优点。

所以，我们可以挑出`b`点，然后继续同样的方式，获取`b`点的邻节点。

这里有个注意点，`a`和`c`是`b`的邻节点但是在上一步已经被筛选过了，所以这里我们可以排除掉它们。

![A*](/tuia-frontend-manual/game.10.jpg)

所以我们一次得到`d,e,f,g,h`

### 碰撞检测


## 网络通信

## 小结
