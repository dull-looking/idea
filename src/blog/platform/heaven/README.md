# 苍穹

## 是什么？

集团的一个[CDN系统平台](http://heaven.dui88.com)，还不知道 cdn 是啥的同学 [请移步](https://blog.csdn.net/lu_embedded/article/details/80519898)

## 模块功能介绍使用

### 上传测试

![](/tuia-frontend-manual/heaven/upload.png)

1. 左侧根目录，显示当前路径
2. 右侧提供上传功能（此模块上传至测试环境）
3. 上传文件时提供压缩功能

### 同步生产

![](/tuia-frontend-manual/heaven/sync.png)

1. 同步功能同步至生产环境
2. 提供批量操作，筛选，移除功能

### 历史记录

![](/tuia-frontend-manual/heaven/record.png)

1. 同步至线上的操作记录
2. 提供筛选功能
3. 线上不提供操作功能，仅有相关权限账号提供覆盖线上功能

### 强刷节点

![](/tuia-frontend-manual/heaven/brush.png)

1. 粗暴操作直接更新某个资源（仅相关权限拥有），适用于紧急情况
2. 强刷后一定要记得发布，可能会存在缓存问题
