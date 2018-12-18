# UI自动化测试

## 性能评分
**目的**：移动端页面对高性能有着很强的诉求。性能测试是为了分析、定位、解决wen页面性能问题，通过某些不断优化来让页面的性能得到提升。之所以做性能评分是因为我们一直缺少页面性能的标准。
### 谷歌评分标准
为了使页面的性能标准足够的权威我们采用了谷歌的页面性能评分标准，并给出页面优化建议。
项目中我们采用了谷歌的开源node包[Lighthouse](https://github.com/GoogleChrome/lighthouse)。  

Lighthouse 是一个开源的自动化工具，用于改进网络应用的质量，采用谷歌的性能评分标准。提供一个要审查的网址，它将针对此页面运行一连串的测试，然后生成一个有关页面性能的报告。  

Lighthouse生成页面性能报告有两种方式
安装 Lighthouse 作为一个全局节点模块
1. Node CLI
- 安装 Lighthouse 作为一个全局节点模块
``` code
npm install -g lighthouse
```
- 针对一个页面运行 Lighthouse 审查

```
lighthouse https://airhorner.com/
```
- 传递 --help 标志以查看可用的输入和输出选项。

```
lighthouse --help
```

2. Using programmatically 

```
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

function launchChromeAndRunLighthouse(url, opts, config = null) {
  return chromeLauncher.launch({chromeFlags: opts.chromeFlags}).then(chrome => {
    opts.port = chrome.port;
    return lighthouse(url, opts, config).then(results => {
      // use results.lhr for the JS-consumeable output
      // https://github.com/GoogleChrome/lighthouse/blob/master/typings/lhr.d.ts
      // use results.report for the HTML/JSON/CSV output as a string
      // use results.artifacts for the trace/screenshots/other specific case you need (rarer)
      return chrome.kill().then(() => results.lhr)
    });
  });
}

const opts = {
  chromeFlags: ['--show-paint-rects']
};

// Usage:
launchChromeAndRunLighthouse('https://example.com', opts).then(results => {
  // Use results!
});
```

  

#### 输出报告：  

![性能报告](http://yun.dui88.com/qiho-h5/images/example_audit.png)

### 多网络环境模拟测试
lighthouse的默认测试网络环境是fast3g  
为了测试多种网络环境下页面的性能我们去模拟wifi 4g fast3g网络环境

```
const DEVTOOLS_RTT_ADJUSTMENT_FACTOR = 3.75;// 请求延时因数 RTT(Round-Trip Time): 往返时延。
const DEVTOOLS_THROUGHPUT_ADJUSTMENT_FACTOR = 0.9; // 吞吐量调节因数

const throttling = {
  DEVTOOLS_RTT_ADJUSTMENT_FACTOR,
  DEVTOOLS_THROUGHPUT_ADJUSTMENT_FACTOR,
  mobile3G: {
    rttMs: 150, // RTT(Round-Trip Time): 往返时延。 表示从发送端发送数据开始，到发送端收到来自接收端的确认
    throughputKbps: 1.6 * 1024, // 吞吐量
    requestLatencyMs: 150 * DEVTOOLS_RTT_ADJUSTMENT_FACTOR, // 请求延时
    downloadThroughputKbps: 1.6 * 1024 * DEVTOOLS_THROUGHPUT_ADJUSTMENT_FACTOR, // 下载速率
    uploadThroughputKbps: 750 * DEVTOOLS_THROUGHPUT_ADJUSTMENT_FACTOR, // 上传速率
    cpuSlowdownMultiplier: 4 // cpu内核
  },
  mobileLTE: {
    rttMs: 150,
    throughputKbps: 9 * 1024,
    requestLatencyMs: 70 * DEVTOOLS_RTT_ADJUSTMENT_FACTOR,
    downloadThroughputKbps: 12 * 1024 * DEVTOOLS_THROUGHPUT_ADJUSTMENT_FACTOR,
    uploadThroughputKbps: 12000 * DEVTOOLS_THROUGHPUT_ADJUSTMENT_FACTOR,
    cpuSlowdownMultiplier: 4
  },
  mobileWIFI: {
    rttMs: 20,
    throughputKbps: 9 * 1024,
    requestLatencyMs: 20 * DEVTOOLS_RTT_ADJUSTMENT_FACTOR,
    downloadThroughputKbps: 30 * 1024 * DEVTOOLS_THROUGHPUT_ADJUSTMENT_FACTOR,
    uploadThroughputKbps: 30000 * DEVTOOLS_THROUGHPUT_ADJUSTMENT_FACTOR,
    cpuSlowdownMultiplier: 4
  }
};
```
定义页面启动参数
```
 let net = '';
      if (network === 0) {
        net = 'mobileWIFI';
      } else if (network === 1) {
        net = 'mobileLTE';
      } else if (network === 2) {
        net = 'mobile3G';
      }
      const opts = {
        chromeFlags: [],
        onlyCategories: ['performance'],
        chromePath: '',
        output: 'html',
        throttling: throttling[net]
      };
      if (think.env === 'production') {
        opts.chromeFlags = ['--headless', '--disable-gpu', '--no-sandbox'];
      }
```

浏览器启动
```
launchChromeAndRunLighthouse(url, opts, config = null) {
    return chromeLauncher.launch({chromeFlags: opts.chromeFlags}).then(chrome => {
      opts.port = chrome.port;
      return lighthouse(url, opts, config).then(results => {
        return chrome.kill().then(() => results.report);
      }).catch(() => {
        chrome.kill();
      });
    });
  }
```
获取分数 并输出报告
```
async getLighthouseScore(url, opts, lhDetail, reportId) {
    console.log(lhDetail)
    const results = await this.launchChromeAndRunLighthouse(url, opts);
    const $ = cheerio.load(results);
    let lightJson = '';
    const scripts = $('script');
    scripts.each(function() {
      const $html = $(this).html();
      if ($html.indexOf('window.__LIGHTHOUSE_JSON__') !== -1) {
        let dataDetail = $html.split('window.__LIGHTHOUSE_JSON__ = ')[1];
        if (dataDetail) {
          dataDetail= dataDetail.replace(/;/g, '');
          lightJson = JSON.parse(dataDetail);
        }
      }
    });
    const totalScore = parseInt(lightJson.categories.performance.score * 100); // 分数
    const lmodel = think.mongoose('lighthouse_result');
    const lresult = new lmodel({
      pid: lhDetail._id,
      score: totalScore,
      html: results,
      reportId: reportId || 0
    });
    await lresult.save();
  }
```

## 埋点自动化测试
### 背景
我们都知道埋点记录有利于记录及检测用户行为，从而更方便做数据支撑，或用来监控、警告，优化调整广告的投放效果。故埋点测试为开发中不可或缺的一部分，而埋点测试往往占据开发测试大量时间。数据的丢失或数据错误统计都会影响到决策者的决策！

### 如何实现埋点自动化测试
要实现埋点自动化测试主要需要解决三个问题
1. 如何实现用户操作的自动化
2. 如何监听埋点数据
2. 如何对埋点数据进行解析

### 原理

1. 用户操作自动化  
这里，我们采用了谷歌开源的无头浏览器[puppeteer](https://github.com/GoogleChrome/puppeteer/blob/v1.9.0/docs/api.md#pagetypeselector-text-options)来实现页面的自动化操作。puppeteer是一个使用nodejs来操控chrome浏览器的npm包， 它提供了丰富的api来实现用户的点击、输入、滑动等操作。

puppeteer启动
```
// 打开浏览器
async getOrderDetail(orderDetail) {
    let defaultConfig = {
      headless: false, // 是否显示浏览器
      defaultViewport: null,
      // devtools: true
      // args: ['--no-sandbox', '--disable-setuid-sandbox']
    };
    // 服务器环境需要开启no-sandbox
    if (think.env === 'production') {
      const config = {headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox']};
      defaultConfig = Object.assign({}, defaultConfig, config);
    }
    // 启动浏览器
    const browser = await puppeteer.launch(defaultConfig);
    return this.getDetail(browser, orderDetail);
  }
  // 打开标签页
  async getDetail(browser, orderDetial) {
    return new Promise(async(resolve, reject) => {
      try {
        onst page = await browser.newPage();
        // 设置模拟器
        await page.setRequestInterception(true);
        await page.emulate(iPhone);
        // 监听请求
        await page.on('request', (interceptedRequest) => {
          const urls = interceptedRequest.url();
          this.interceptUrl.push({
            url: urls,
            timestamp: Date.now(),
            name: ''
          });
          if (interceptedRequest.url().endsWith('.png') || interceptedRequest.url().endsWith('.jpg')) { interceptedRequest.abort() } else { interceptedRequest.continue() }
        });
        // 去除弹框 如alert comfirm
        page.on('dialog', async dialog => {
          await dialog.dismiss();
        });
        // 跳转
        await page.goto(url, {
          timeout: 0
        });
        await this.timeout(2000);
        await this.orderSubmit(page, orderDetial);
        await this.timeout(2000);
        await page.close();
        // await browser.close();
        resolve(this.interceptUrl);
      } catch (err) {
        
        await browser.close();
        reject(err);
      }
    });
  }
```
模拟用户的行为  

```
async orderSubmit(page, orderDetial) {
    const testContentAll = orderDetial.testContentAll;
    for (let i = 0; i < testContentAll.length; i++) {
    // 点击
      if (testContentAll[i].testType === 'CLICK') {
        await this.timeout(1000);
       
        var clickTest = await page.$(testContentAll[i].content);
        clickTest && await clickTest.tap();
        
      } else if (testContentAll[i].testType === 'SELECT') {
      // select选择
        await this.timeout(1000);
      
        var selectClickTest = await page.$(testContentAll[i].content);
        if (selectClickTest) {
          await selectClickTest.click();
          await this.getSelectValue(page, testContentAll[i].content, testContentAll[i].testSelectName);
        }
       
      } else {
      // input 输入
        await this.timeout(1000);
        if (inputClickTest) {
          await inputClickTest.click();
          await page.type(testContentAll[i].content, testContentAll[i].testInput, { delay: 20 });
        }
      }
    }
    return page;
  }
```



2. 监控埋点  
通过监听页面的url请求

```
// page为新开标签页 通过监听页面的request请求
 await page.on('request', (interceptedRequest) => {
      const urls = interceptedRequest.url();
      this.interceptUrl.push({
        url: urls,
        timestamp: Date.now(),
        name: ''
      });
      // 图片请求忽略
      if (interceptedRequest.url().endsWith('.png') || interceptedRequest.url().endsWith('.jpg')) { interceptedRequest.abort() } else { interceptedRequest.continue() }
    });
```
3. 对拦截url进行解析

- 埋点结果存储

```
 // 埋点统计函数
  async monitorHandle(urls, orderId) {
   // 埋点url
    const url = urls.url;
    // 埋点表示的含义
    const name = urls.name;
    // 埋点结果数据库
    const OrderMonitor = think.mongoose('order_monitor');
    if (!url) return;
    const purl = URL.parse(url, true);
    const monitor = purl.query;
    const setData = [];
    // 过滤埋点表
    const useableName = ['embedlog', 'log/click', 'statistics/click', 'activity/showLog', 'log/inner', 'log/landLog'];
    if (useableName.filter((item) => {
      return url.indexOf(item) !== -1;
    }).length === 0) {
      return false;
    }
    let batch = monitor['batch_c'] || '';
    // 批量曝光
    if (batch) {
      batch = JSON.parse(batch);
      for (let i = 0; i < batch.length; i++) {
        setData.push({
          link: url,
          orderId: orderId,
          monitor: batch[i],
          type: '',
          typeDesc: '',
          status: true,
          monitorContent: '',
          name
        });
      }
    } else {
    // 点击曝光
      setData.push({
        link: url,
        orderId: orderId,
        monitor: monitor,
        type: '',
        typeDesc: '',
        status: true,
        monitorContent: '',
        name
      });
    }
    if (setData.length) {
      for (let i = 0; i < setData.length; i++) {
        // const monitor = setData[i];
        if (url.indexOf('embedlog') !== -1 || url.indexOf('activity/showLog') !== -1) {
          // 曝光埋点
          // monitor.url = url;
          if (setData[i]['monitor'].scroll) {
            setData[i].type = 1;
            setData[i].typeDesc = '心跳曝光';
          } else {
            setData[i].type = 2;
            setData[i].typeDesc = '普通曝光';
          }
        } else if (url.indexOf('log/click') !== -1 || url.indexOf('statistics/click') !== -1) {
          // 记录
          setData[i].type = 3;
          setData[i].typeDesc = '点击';
        } else if (url.indexOf('log/inner') !== -1 || url.indexOf('log/landLog') !== -1) {
          const typeDesc = this.getTypeDesc(setData[i].monitor.type);
          setData[i].type = 4; // 广告曝光
          setData[i].typeDesc = typeDesc.desc;
          setData[i].monitorContent = typeDesc.explain;
        }
        // mongoose 存储
        const r2 = new OrderMonitor(setData[i]);
        await r2.save();
      }
    }
  }
```
- 埋点信息解析

```
// 获取下单之后的埋点信息
  async orderMonitorListAction() {
    const id = this.get('id');
    if (think.isEmpty(id)) {
      return this.fail('请填写测试项id');
    }
    try {
      const result = await this.mongoose('order_monitor').find({orderId: id});
      const m = await this.mongoose('monitor').find();
      let monitors = [];
      if (m && m.length) {
        monitors = m.map((item) => {
          return item.toObject();
        });
      }
      if (!think.isEmpty(result)) {
        for (let i = 0; i < result.length; i++) {
          const rmonitor = result[i].monitor; // 实际曝光埋点
          if (result[i].type !== 1) {
            monitors && monitors.length && monitors.forEach((item) => {
              let dcm = (rmonitor && rmonitor.dcm) || '';
              let dpm = (rmonitor && rmonitor.dpm) || '';
              // let item = is.toObject();
              const dcmNullIndex = this.getPosition(item.monitorDetail_dcm);
              const dpmNullIndex = this.getPosition(item.monitorDetail_dpm);
              if (!think.isEmpty(dcm)) {
                dcm = dcm.split('.');
                dcmNullIndex.forEach((p) => {
                  dcm[p] = dcm[p].indexOf('7ho-') !== -1 ? '7ho-*' : '*';
                });
                dcm = dcm.join('.');
              }
              if (!think.isEmpty(dpm)) {
                dpm = dpm.split('.');
                dpmNullIndex.forEach((p) => {
                  dpm[p] = dpm[p].indexOf('7ho-') !== -1 ? '7ho-*' : '*';
                });
                dpm = dpm.join('.');
              }
              if (item.monitorDetail_dcm === dcm && item.monitorDetail_dpm === dpm) {
                result[i].monitorContent = item.monitorName;
                item['monitor'] = true;
                item['type'] = result[i].type;
                item['typeDesc'] = result[i].typeDesc;
              }
            });
          }
        }
      }
      return this.success({ list: result, monitors });
    } catch (e) {
      think.logger.error(e);
    }
  }
```

### 总结

通过埋点自动化测试，我们会发现puppeteer是一个很有用的工具。如何将工具和实际业务去结合，做一些有意思的事情，需要我们脑洞够大。

## 设计稿还原度检测
**背景**：前端完成页面开发后，无法得知与设计稿的差异性。UI设计师在验收页面时无法快速便捷的发现页面与设计稿的差异。

### 如何检测页面的还原度

页面的还原度检测也就是去比对页面截图和设计稿两张图片的相似度。  
页面截图是使用[puppeteer](https://github.com/GoogleChrome/puppeteer/blob/v1.9.0/docs/api.md#pagescreenshotoptions)截取和设计稿一样大小的图片

### 原理
两张图片的相似度首先要将图片转成hash值，然后通过检测两张图片的hash值之间的汉明值来确认图片的相似度。 汉明值越小说明两种图片的相似度越高 
这里主要用到两个第三方的nodejs包  
1. [sharp-blockhash](https://www.npmjs.com/package/sharp-blockhash)
具有锐利和阻塞的图像感知哈希计算。用于比较相似的图像。 主要用于将图片转成hash值,

2. [hamming-distance](https://www.npmjs.com/package/hamming-distance)  
主要是用来比较hash值之间的harmming值（汉明距离，自行百度，[悲伤] 高数都还给老师了)

3. [pixelmatch](https://www.npmjs.com/package/pixelmatch)  
  最小，最简单，最快速的JavaScript像素级图像比较库，最初用于比较测试中的屏幕截图。具有精确的抗锯齿像素检测 和感知色差指标。 

对比结果示意图(  图片上红色区域表示两张图片之间的差异)  
<img src="http://yun.7ho.com/qiho-h5/images/4b9b85fa-34c4-46f3-96eb-8cdc8877437a_diff.png" width="200" hegiht="313" align=center />


### 关键代码
干巴巴的说那么多，不如贴个代码看看
```
// 相关依赖包
const puppeteer = require('puppeteer');
const fs = require('fs');
const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');
const shash = require('sharp-blockhash');
const hammingDistance = require('hamming-distance');

```

```
// 页面截图
/**
*checkDetail = {
*   width: 设计稿宽度,
*   height: 设计稿高度,
*  pageUrl: 要检测的页面 
*}
*/
async getCheckResult(checkDetail) {
    // 打开浏览器
    const defaultConfig = {
      headless: true, 
      args: ['--no-sandbox', '--disable-setuid-sandbox'] // linux环境下部署需要添加这一项
    };
    const browser = await puppeteer.launch(defaultConfig);// 启动浏览器
    const page = await browser.newPage();
    await page.emulate({
      viewport: {
        width: +checkDetail.imgWidth,
        height: +checkDetail.imgHeight,
        isMobile: true
      },
      userAgent: 'Mozilla/5.0 (Linux; Android 8.0; Pixel 2 Build/OPD3.170816.012) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Mobile Safari/537.36'
    })
    await page.goto(checkDetail.pageUrl);
    // 延时等待页面加载
    await this.timeout(3000);
    const uid = think.uuid(32);
    const path = think.ROOT_PATH + '/www/screenshot/' + uid + '.png';
    // 开始截图
    await page.screenshot({
      path: path,
      type: 'png',
      clip: {x: 0, y: 0, width: +checkDetail.imgWidth, height: +checkDetail.imgHeight}
    });
    // ui设计稿路径
    const uiUrl = think.ROOT_PATH + '/www/upload/' + checkDetail.uiUrl.split('upload/')[1];
    // 获取页面截图和设计稿海明值
    const simple = await this.getSimple(path, uiUrl);
    // 对比两个图片的像素级差异
    const diffImg = await this.compareScreenshots(uiUrl, path);
    const diffImgUrl = think.ROOT_PATH + '/www/screenshot/' + uid + '_diff.png';
    diffImg.diff.pack().pipe(fs.createWriteStream(diffImgUrl));
    // 关闭页面
    await page.close();
    // 关闭浏览器
    await browser.close();
    return {
      similarity: simple,
      diffImgUrl: (think.env === 'production' ? 'http://test.fepath.com' : 'http://127.0.0.1:8370') + '/screenshot/' + uid + '_diff.png',
      screenshotUrl: (think.env === 'production' ? 'http://test.fepath.com' : 'http://127.0.0.1:8370') + '/screenshot/' + uid + '.png'
    };
  }
```
获取页面的汉明距离
```
// path1 path2 为两种对比图片的本地存储路径
 getSimple(path1, path2) {
    return new Promise((resolve, reject) => {
      Promise.all([
        shash(path2).toBlockhash(),
        shash(path1).toBlockhash()
      ]).then(function(hashes) {
        const result = hammingDistance(hashes[0].toString('hex'), hashes[1].toString('hex'));
        resolve(result);
      }).catch((err) => {
        reject(new Error(err));
      });
    });
  }
```
比较两张图片的像素级差异
```
// path1 path2 为两种对比图
compareScreenshots(path1, path2) {
    return new Promise((resolve) => {
      const base = fs.createReadStream(path1).pipe(new PNG()).on('parsed', doneReading);
      const live = fs.createReadStream(path2).pipe(new PNG()).on('parsed', doneReading);
      let filesRead = 0;
      function doneReading() {
        // Wait until both files are read.
        if (++filesRead < 2) {
          return;
        }
        // Do the visual diff.
        const diff = new PNG({width: base.width, height: base.height});
        const mismatchedPixels = pixelmatch(
          base.data, live.data, diff.data, base.width, base.height,
          {threshold: 0.1});
        resolve({
          mismatchedPixels,
          diff
        });
      }
    });
  };
```

## 服务端部署
### 服务器登陆
使用ssh登陆云服务器
```
ssh -p 22 root@ip
```
 22 是开发的端口号。常见的云服务商都会对服务器端口有限制。 我们需要将22端口开放出来。可以在控制台服务器安全组中设置
 
ip为服务器的ip地址

### 代码下载 
服务器需装git

```
yum install -y git
```
clone 代码
```
mkdir project
cd project
git clone xxx
```
### mongodb安装
1. 创建数据目录

```
mkdir -p /data/db
chmod -R 777 /data
```
2. 下载mogodb到自己喜欢的目录 

```
wget https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-rhel70-3.4.4.tgz
```
3. 解压并进入bin目录

```
tar -zxvf mongodb-linux-x86_64-rhel70-3.4.4.tgz
cd mongodb-linux-x86_64-rhel70-3.4.4/
cd bin
```
4. 启动Mongodb
```
./mongod
```
5. 带参数后台启动  
 配置文件方式启动mongo
- 创建配置文件
```
vi mongodb.cnf
```
- 输入以下内容
```
dbpath=/data/db/                   
logpath=/data/db/mongo.log
logappend=true
fork=true
port=27017
```
- 启动
```
./mongod -f ./mongodb.cnf
```
6. 给数据库创建密码
- 进入客户端

```
 ./mongo
```
- 进入想要加密码的数据库（本文以tesataa数据库为例）

```
use tesataa
```
- 为单个数据库添加用户（用户名为useraa,密码为123456）

```
db.createUser({user:"useraa",pwd:"123456",roles:[{role:"dbOwner",db:"tesataa"}]})
```
![image](https://upload-images.jianshu.io/upload_images/4830242-794610bc119f1678.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/732/format/webp)


### nginx安装
Nginx是一款轻量级的网页服务器、反向代理服务器。相较于Apache、lighttpd具有占有内存少，稳定性高等优势。**它最常的用途是提供反向代理服务。**  

 在Centos下，yum源不提供nginx的安装，可以通过切换yum源的方法获取安装。
1. CentOS 7

```
rpm -ivh http://nginx.org/packages/centos/7/noarch/RPMS/nginx-release-centos-7-0.el7.ngx.noarch.rpm
```
2. 查看yum的nginx信息


```
yum info nginx
Loaded plugins: fastestmirror
Determining fastest mirrors
 * base: mirror.esocc.com
 * extras: mirror.esocc.com
 * updates: mirror.esocc.com
base                                                     | 3.7 kB     00:00
base/primary_db                                          | 4.4 MB     00:28
extras                                                   | 3.5 kB     00:00
extras/primary_db                                        |  19 kB     00:00
nginx                                                    | 2.9 kB     00:00
nginx/primary_db                                         |  22 kB     00:00
updates                                                  | 3.5 kB     00:00
updates/primary_db                                       | 2.1 MB     00:10
Installed Packages
Name        : nginx
Arch        : x86_64
Version     : 1.4.0
Release     : 1.el6.ngx
Size        : 874 k
Repo        : installed
From repo   : nginx
Summary     : nginx is a high performance web server
URL         : http://nginx.org/
License     : 2-clause BSD-like license
Description : nginx [engine x] is an HTTP and reverse proxy server, as well as
            : a mail proxy server

```
3. 安装并启动nignx

```
[root@server ~]# yun install nignx
[root@server ~]# service nginx start
Starting nginx:    [  OK  ]
```
4. 然后进入浏览器，输入http://服务器ip，如果看到

```
Welcome to nginx!

If you see this page, the nginx web server is successfully installed and working. Further configuration is required.
For online documentation and support please refer to nginx.org.
Commercial support is available at nginx.com.
Thank you for using nginx.

```

### nginx设置

1. 找到nginx位置
```
/etc/nginx/nginx.conf

vi nginx.conf
```
2. nginx配置文件

```
user  nginx nginx;    
worker_processes  4;    
events {
    use epoll                
    worker_connections  1024;     
}

http {
    server {
        # 配置虚拟主机
        location /one {
            # configuration for processing URIs with '/one'
        }

        location /two {
            # configuration for processing URIs with '/two'
        }
    }

    server {
        #配置虚拟主机
    }
}
```
3. 添加域名解析
-  添加域名解析
   阿里云域名解析 https://help.aliyun.com/document_detail/29716.html  

   腾讯云域名解析
https://cloud.tencent.com/document/product/302/3446
-  添加server配置
```
server{
    listen 80;  #如果是https, 则替换80为443
    server_name test.fepath.com #替换域名

    location ^~ / {
           proxy_http_version 1.1;
           proxy_set_header Connection "upgrade";
           proxy_pass http://118.25.48.234:7002;
           proxy_redirect off;
        }

}

```
4. 重启ngix

### puppeteer lighithoust 服务端部署

1. puppeteer服务端部署需要在puppeteer启动参数添加 

```
args: ['--no-sandbox', '--disable-setuid-sandbox']
```
需要设置为无头浏览器


```
     headless: true,

```
2. lighthouse部署  

lighthouse 服务端部署需要在服务器中下载chromium 并在启动参数executablePath中指定chrome所在路径

## electron打包桌面应用
### 为什么要打包app  
1. 有些功能需要在app中才能实现。 如在我们的埋点自动化测试中，我们有个手动测试的功能， 需要用户记录用户的点击行为 以及拦截页面的埋点请求。 在web页面我们无法启动puppeteer, 我们需要一个app的本地容器取启动一个新的chrome， 在chrome中完成操作。
2. 项目中用的puppeteer需要在服务的启动一个chrome浏览器。这个浏览器虽然是看不到的， 但是依然占据着服务器资源。 设想我们自己的电脑才能同时启动几个chrome浏览器，服务器环境下必然不能支持同时多人在线操作。 而如果我们打包成app，就可以将压力放到客户端。服务的只用来存储数据就可以

### 如何打包成app
我们平常接触到的app大多是手机上的。 手机上将web页面打包成app的有很多工具，如 cordova RN Weex hbuilder等。
在pc端我们常用的打包工具主要是electron。

Electron最初是起源于Atom,然后从Atom剥离开来最终形成了现在的Electron

目前使用Electron來开发的桌面用非常多，我们最熟悉的比如Atom,VScode…,这类IDE，除此之外还有一些开发的辅助工具也借助于electron，比如iview的官方脚手架用来创建vue项目，腾讯的weFlow工具，等等。

electron能将我们的web页面打包成window、mac、linux客户端。使用electron我们可以在web页面代用原生nodejs api。 这样我们能够完成如文件读取存储等网页无法完成的功能。

在这里我们选用electron-vue 脚手架来搭建我们的应用


### electron-vue
electron-vue 是一个结合 vue-cli 与 electron 的项目，主要避免了使用 vue 手动建立起 electron 应用程序，很方便。

我们需要做的仅仅是像平常初始化一个 vue-cli 项目一样  

```
vue init simulatedgreg/electron-vue ecn
```
就可以拥有一个 vue-loader 的 webpack、electron-packager 或是 electron-builder，以及一些最常用的插件，如vue-router、vuex 等等的脚手架  

下图是自动化测试项目中 结合 electron-vue 的目录：  

<img src="http://yun.7ho.com/qiho-h5/images/project_20181010154254.png" width="200px" style="margin: 0 auto"/>  

src 里的 main，即是主进程，而我们需要关心的则仅有 renderer 渲染进程

### web页面使用puppeteer
1. 安装依赖

```
cnpm install puppeteer --save // puppeteer 会下载一个chromium, 这个需要翻墙  
```
2. puppeteer 安装时跳过下载chrome  

在项目目录里安装 puppeteer 时，都会下载 Chromium。这个慢不说，也会造成重复下载、耗时过长等问题。那么可以这么来做跳过 Chromium 的下载：

```
npm install puppeteer --ignore-scripts

```
然后在脚本中通过配置项 executablePath，指定 Chromium 所在的位置。示例：

```
  const platform = 1 // 1为window 2 为mac

  executablePath: platform === 1 ? path.join(__dirname, '../../../chromium/chrome-win/chrome.exe') : path.join(__dirname, '../../../chromium/chrome-mac/Chromium.app/Contents/MacOS/Chromium');
  
```
打包app的时候需要采用这种指定chrome路径方式的方式。 不然electron打包puppeteer的时候不会将puppeteer node_module中的chromium打包进去
3. web页面调用puppeteer和在nodejs端一样


```
const puppeteer = require('puppeteer')
const path = require('path')
const platform = 1 // 1为window 2 为mac
const defaultConfig = {
  headless: false,
  devtools: true,
  executablePath: platform === 1 ? path.join(__dirname, '../../../chromium/chrome-win/chrome.exe') : path.join(__dirname, '../../../chromium/chrome-mac/Chromium.app/Contents/MacOS/Chromium')
}
const getHandTestDetail = (link, cb) => {
  const browser = await puppeteer.launch(defaultConfig)
  const interceptUrl = []
  const page = await browser.newPage()
  await page.setRequestInterception(true)
  await page.emulate(iPhone)
  // await page.on('console', msg => console.log(msg))
  await page.on('request', (interceptedRequest) => {
    let urls = interceptedRequest.url()
    interceptUrl.push(urls)
    if (interceptedRequest.url().endsWith('.png') || interceptedRequest.url().endsWith('.jpg')) { interceptedRequest.abort() } else { interceptedRequest.continue() }
  })
 await page.goto(url);
 await page.on('close', async () => {
    cb && cb(interceptUrl)
 })
}
export {
  getHandTestDetail
}
```
页面调用

```
import { getHandTestDetail } from '../../service/order.js'
// 手动测试
testHandler (row) {
  this.$loading('测试中')
  getHandTestDetail(row.link, (urls) => {
     this.getMonitorData(urls, row._id)
  })
}
```


### 打包
 electron-packager，打包方式比较简单，想为哪个平台打包，执行相应命令即可。
 <img src="https://user-gold-cdn.xitu.io/2017/10/30/78da46a4c3582b0dbd1f1b0f336a4567" width="700"/>
 
### 总结
使用electron-vue我们可以迅速开发一款桌面应用。但是打包出来的安装包相比较而言提价较大。在自动化测试项目中由于我们需要把chromium打包到app， 所以打包出来的安装包大概500m附近。确实太大了!  

![image](//yun.dui88.com/qiho-h5/images/lALPBE1XXmBoztZ1dg_118_117.png)
