# Hacker系统之防运营商劫持

### 背景：

1.我司活动场景丰富，业务规模广泛，活动页遭到大量劫持插入广告，诱导用户点击，导致用户流失   
2.部分被劫持活动页面出现卡死、白屏现象，导致参与下降，直接影响大盘消耗

## 常见劫持手段

### dns劫持   
DNS劫持可以理解为用户的请求去往了错误的DNS服务器进行查询解析，返回来的目的主机IP自然不是我们想要达到的资源服务器主机，这往往发生在用户请求的第一步。DNS 劫持就是通过劫持了 DNS 服务器，通过某些手段取得某域名的解析记录控制权，进而修改此域名的解析结果，导致对该域名的访问由原IP地址转入到修改后的指定IP，其结果就是对特定的网址不能访问或访问的是假网址，从而实现窃取资料或者破坏原有正常服务的目的。
简单说就是我们请求的是 http://www.a.com/index.html ，直接被重定向了 http://www.b.com/index.html
### http劫持   
HTTP劫持，大多数情况是运营商HTTP劫持，当我们使用HTTP请求请求一个网站页面的时候，网络运营商会在正常的数据流中插入精心设计的网络数据报文，让客户端（通常是浏览器）展示“错误”的数据，通常是一些弹窗，宣传性广告或者直接显示某网站的内容，大家应该都有遇到过。
### https劫持   
https普遍被认为是防劫持救星，但前提是必须用受信任的SSL证书。
HTTPS 服务需要权威CA机构颁发的SSL证书才算有效。自签证书浏览器不认，而且会给予严重的警告提示。而遇到“此网站安全证书存在问题”的警告时，大多用户不明白是什么情况，就点了继续，导致允许了黑客的伪证书，HTTPS 流量因此遭到劫持。
还有伪造证书，通过病毒或者其他方式将伪造证书的根证书安装在用户系统中。
代理也有客户的证书与私钥，或者客户端与代理认证的时候不校验合法性，即可通过代理来与我们服务端进行数据交互
### xss劫持
XSS指的是攻击者利用漏洞，向 Web 页面中注入恶意代码，当用户浏览该页之时，注入的代码会被执行，从而达到攻击的特殊目的。
关于这些攻击如何生成，攻击者如何注入恶意代码到页面中本文不做讨论，只要知道如 HTTP 劫持 和 XSS 最终都是恶意代码在客户端，通常也就是用户浏览器端执行


## 防劫持方案
### 白名单策略
#### 节点检测
通过MutationObserver，实时监测页面新增的dom节点
```
 new MutationObserver(mutationHandler).observe(document.getElementsByTagName('body')[0], {
            'childList': true,
            'subtree': true
        });
```
#### 节点拦截
获取到新增script标签src属性的域名，并通过白名单助手将该域名与白名单列表做比配，匹配通过即为白名单，匹配失败即为黑名单，对该脚本进行拦截处理
```
var mutationHandler = function(records) {
    records.forEach(function(record) {
        Array.prototype.slice.call(record.addedNodes).forEach(function(addedNode) {
            srcFilterTags.forEach(function(tagName) {
                if (addedNode.tagName === tagName.toUpperCase()) {
                    if (!inWhileList(addedNode.src)) {
                        $(addedNode).remove(); //溢出非法DOM
                        ... //发送埋点信息
                    }
                };
            });
        });
    })
};

```


### CSP策略（内容安全策略）
#### 什么是csp策略？
CSP 全称为 Content Security Policy，即内容安全策略。主要以白名单的形式配置可信任的内容来源，在网页中，能够使白名单中的内容正常执行（包含 JS，CSS，Image 等等），而非白名单的内容无法正常执行，从而减少跨站脚本攻击（XSS），也能够减少运营商劫持的内容注入攻击。
#### 使用方式
##### HTML Meta 标签
在 HTML 的 Head 中添加如下 Meta 标签，将在符合 CSP 标准的浏览器中使非同源的 script 不被加载执行。不支持 CSP 的浏览器将自动会忽略 CSP 的信息，不会有什么影响。

```
<meta http-equiv="Content-Security-Policy" content="script-src 'nonce-shendun' zeptojs.com; object-src 'none';">
```
##### 后端配置
```
server {
    ...
    add_header Content-Security-Policy "default-src *; script-src 'self' 'nonce-shendun' baidu.com *.baidu.com;";
    ...
```

## 结论
无论是采用哪种方式，都能有效的进行防运营商劫持，但目前还不能够100%拦截，存在 Head 头部协议被篡改的情况，这时“薅羊毛” 有了可乘之机；   
由于两种形式都走白名单策略，所以对白名单的维护工作要非常及时准确，否则会出现活动页面崩溃的情况

#### 白名单管理
对黑名单进行拦截删除后，会向后台发送包含黑名单的埋点信息，便于后续筛选新白名单；   
目前共收录白名单239条，通过白名单维护，及时更新黑白名单，避免错杀漏杀

## 后期展望
将防劫持做成平台化，更高效灵活地录入黑/白名单实施拦截   
