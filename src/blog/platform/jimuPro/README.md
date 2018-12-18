# 积木专业版

## 是什么？

拖拽式h5生成器

## 怎么用？

管理端拖拽组件并调整位置和尺寸，组装一张h5页面，同时程序生成可用于移动端渲染的数据结构，最后在移动端完全还原所配置的页面。

### 概览

![](//yun.tuisnake.com/jimu/whitePaper/guide2.png)

### 表单组件编辑

![](//yun.tuisnake.com/jimu/whitePaper/guide3.png)

### 弹层组件 + 红线指示器

![](//yun.tuisnake.com/jimu/whitePaper/guide5.png)

### 预览界面

![](//yun.tuisnake.com/jimu/whitePaper/guide4.png)

### 基础组件

- 按钮
- 图片
- 表单
- 弹层
- 文字
- 轮播图
- 拨打电话
- 地址
- 微信
- 下载悬浮

### 业务组件

- 大转盘

## 功能特性

- 灵活的拖放与拖转
- 旋转和调整尺寸
- 组件上下文菜单
- 移动端仿真预览
- 边缘吸附效果
- 舞台高度可调
- 红线指示器
- 新手引导
- 支持图层
- 横纵坐标
- 撤销重做
- 支持dpr
- 即时性

## 舞台控件HOC（部分代码）

```javascript
import React, { Component } from 'react'
import styles from './index.less'
import Resizer from './resizer'
import Indicator from './indicator'
import Hoverment from './hover'
import { inject, observer } from 'mobx-react'
import { action } from 'mobx'
import { unset, pick } from 'lodash-es'
import { stopPropagation, getNumber, deepClone } from 'wp/utils/helper'
import { Dropdown, Menu } from 'antd'
import { draggingInScene, sceneUniqueId } from 'wp/config'
import store from 'wp/store'

export default function widgetWrapper({
  resizer,
  mover = {
    top: true,
    left: true
  },
  block,
  onWidgetMount = () => {},
  onWidgetWillUnmount = () => {}
} = {}) {
  return function WidgetDecorator(Inner) {
    @inject('WPSceneStore')
    @observer
    class Widget extends Component {
      mover = mover
      state = {
        mouseStartPos: {
          x: NaN,
          y: NaN
        },
        targetStartPos: {
          x: NaN,
          y: NaN
        },
        targetPos: {
          left: NaN,
          top: NaN
        },
        // 缓存目标样式作为初始样式，用于拖拽和调整大小
        _target: {
          width: NaN,
          height: NaN,
          transform: '',
          opacity: NaN,
          zIndex: NaN
        },
        // 这里借用React做Dom渲染
        isDraggingInScene: false,
        // 红线指示器数据结构
        indicator: {},
        // hover效果
        hover: false
      }
      handleClick = () => {
        // 显示当前部件编辑器
        action(this.props.WPSceneStore.chooseTarget)({
          targetId: this.props.targetId
        })
      }
      handleMouseEnter = () => {
        this.setState({
          hover: true
        })
      }
      handleMouseOut = () => {
        this.setState({
          hover: false
        })
      }
      handleMouseDown = e => {
        this.handleClick()
        this.handleMouseOut()
        if (this.props.WPSceneStore.editingTarget.id !== this.props.targetId) return
        stopPropagation(e)
        // 初始化拖拽信息
        const widgetDom = document.querySelector(`[wid="${this.state.uuid}"`)
        this.setState({
          mouseStartPos: {
            x: e.clientX,
            y: e.clientY
          },
          targetStartPos: {
            x: getNumber(widgetDom.style.left),
            y: getNumber(widgetDom.style.top)
          }
        })
        // 使能mousemove与mouseup
        window.__widgetMouseMove__ = this.__handleMouseMove__
        window.__widgetMouseUp__ = this.__handleMouseUp__
      }
      __handleMouseMove__ = (x, y) => {
        // 处理在舞台中央拖拽的逻辑
      }
      __handleMouseUp__ = () => {
        const dpr = 1
        const widgetDom = document.querySelector(`[wid="${this.state.uuid}"`)
        const left = dpr * getNumber(widgetDom.style.left) + 'px'
        const top = dpr * getNumber(widgetDom.style.top) + 'px'
        let updated = {}
        if (mover.top) updated['style.top'] = top
        if (mover.left) updated['style.left'] = left
        // 更新store
        action(this.props.WPSceneStore.changeItemProps)(updated)
        // 删除mousemove与mouseup，释放内存
        window.__widgetMouseMove__ = null
        window.__widgetMouseUp__ = null
        // 修改组件拖动状态为false
        this.setState({
          isDraggingInScene: false
        })
      }
      handleResize = ({ width, height, left, top, deg }) => {
        // 使用纯js去操作dom，优化性能
        const widgetDom = document.querySelector(`[wid="${this.state.uuid}"`)

        widgetDom.style.left = left + 'px'
        widgetDom.style.top = top + 'px'
        widgetDom.style.width = width + 'px'
        widgetDom.style.height = height + 'px'
        widgetDom.style.transform = `rotate(${deg}deg)`
      }
      hanldeReszieComplete = ({ width, height, left, top, deg }) => {
        // 更新store数据，用于触发其他组件重新render
        const dpr = 1
        action(this.props.WPSceneStore.changeItemProps)({
          'style.width': width * dpr + 'px',
          'style.height': height * dpr + 'px',
          'style.left': left * dpr + 'px',
          'style.top': top * dpr + 'px',
          'style.transform': `rotate(${deg}deg)`
        })
      }
      componentWillUnmount = () => {
        // onWidgetWillUnmount生命周期
        Promise.resolve({ targetId: this.props.targetId }).then(onWidgetWillUnmount)
      }
      componentDidMount = () => {
        const { targetId } = this.props
        this.setState({ uuid: targetId })
        // onWidgetMount生命周期
        Promise.resolve({ targetId }).then(onWidgetMount)
      }
      // 图层上移下移
      changeLayer = type => {
        const { zIndex } = this.props[this.props.widgetType].style
        const { changeItemProps } = this.props.WPSceneStore
        if (type === 'up') {
          changeItemProps({
            'style.zIndex': zIndex + 1
          })
        } else if (type === 'down') {
          changeItemProps({
            'style.zIndex': zIndex - 1
          })
        }
      }
      // 复制组件
      copyAndPaste = () => {
        action(store.WPSceneStore.copyAndPasteItem)(this.props.targetId)
      }
      // 删除组件
      delete = () => {
        action(store.WPSceneStore.removeCurrItem)()
      }
      render() {
        // 当前widget唯一id
        const { targetId } = this.props
        // 当前widget类型
        const widgetType = this.props.widgetType
        // 判断当前widget是否选中
        const isThisWidget = this.props.WPSceneStore.editingTarget.id === targetId
        // 判断当前widget是否正在拖拽中
        const isDragging = this.state.isDraggingInScene
        // 场景中组件中zIndex最大值
        // 场景中组件中zIndex最小值
        const { maxZIndex, minZIndex } = this.props.WPSceneStore.getZIndex()
        const canGoUp = maxZIndex === minZIndex ? true : maxZIndex !== this.props[widgetType].style.zIndex
        const canGoBottom = maxZIndex === minZIndex ? true : minZIndex !== this.props[widgetType].style.zIndex
        // 当前widget所有样式
        const storeStyle = deepClone(this.props[widgetType].style)
        // 过滤widget通用样式
        const style = Object.assign(
          {
            position: 'absolute'
          },
          pick(storeStyle, ['left', 'top', 'width', 'height', 'transform', 'zIndex', 'display', 'bottom'])
        )
        // 所有样式转换为原生js对象，同时表示已读取proxy的值
        const attrs = deepClone(this.props[widgetType])

        // 给定width,height,position使得Inner好布局
        attrs.style.width = '100%'
        attrs.style.height = '100%'
        attrs.style.position = 'relative'
        // 卸载掉实际widget组件不能也不应修改的属性
        unset(attrs.style, 'left')
        unset(attrs.style, 'top')
        unset(attrs.style, 'transform')
        unset(attrs.style, 'zIndex')
        // 根据fixed字段
        this.mover.top = !attrs.fixed
        this.mover.left = !attrs.fixed
        return (
          <div
            wid={this.state.uuid}
            className={styles['widget-wrapper']}
            style={style}
            onMouseDown={this.handleMouseDown}
            onMouseUp={this.handleMouseUp}
            onMouseEnter={() => !isThisWidget && this.handleMouseEnter()}
          >
            {/* Hover */}
            {!isThisWidget && this.state.hover && <Hoverment onMouseOut={this.handleMouseOut} />}
            {/* Resizer */}
            {isThisWidget && (
              <Resizer
                onReszie={this.handleResize}
                onReszieComplete={this.hanldeReszieComplete}
                targetStyle={style}
                options={resizer}
              />
            )}
            {/* Indicator */}
            {isThisWidget &&
              isDragging && (
              <Indicator
                style={{ transform: `rotate(${-getNumber(storeStyle.transform)}deg)` }}
                {...this.state.indicator}
              />
            )}
            {/* 不放置上一层div是因为避antd坑 */}
            <Dropdown
              disabled={!isThisWidget}
              overlay={
                <Menu style={{ fontSize: 12, width: 240 }}>
                  <Menu.Item key="1" onClick={canGoUp ? this.changeLayer.bind(this, 'up') : () => {}}>
                    <div style={Object.assign({}, menuItemStyle, canGoUp ? {} : { color: '#999', cursor: 'not-allowed' })} >
                      <span>上移一层</span>
                    </div>
                  </Menu.Item>
                  <Menu.Item key="2" onClick={canGoBottom ? this.changeLayer.bind(this, 'down') : () => {}}>
                    <div style={Object.assign({}, menuItemStyle, canGoBottom ? {} : { color: '#999', cursor: 'not-allowed' })} >
                      <span>下移一层</span>
                    </div>
                  </Menu.Item>
                  <Menu.Item key="3" onClick={this.copyAndPaste}>
                    <div style={menuItemStyle}>
                      <span>复制</span>
                      {/* <span>Ctrl + C</span> */}
                    </div>
                  </Menu.Item>
                  <Menu.Item key="4" onClick={this.delete}>
                    <div style={menuItemStyle}>
                      <span>删除</span>
                      {/* <span>Delete/Backspace</span> */}
                    </div>
                  </Menu.Item>
                </Menu>
              }
              trigger={['contextMenu']}
            >
              <div
                style={attrs.style}>
                <Inner
                  widgetAttrs={attrs}
                  targetId={this.props.targetId}
                  changeMover={(key, value) => {
                    this.mover[key] = value
                  }}
                />
              </div>
            </Dropdown>
          </div>
        )
      }
    }

    return Widget;
  }
}
```