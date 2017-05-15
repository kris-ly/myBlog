### 同源策略

在JavaScript中，有一个很重要的安全性限制，被称为“Same-Origin Policy”（同源策略）

根据这个策略，在baidu.com下的页面中包含的JavaScript代码，不能访问在google.com域名下的页面内容；

甚至不同的子域名之间的页面也不能通过JavaScript代码互相访问。例如，在abc.example.com下的页面，不能向def.example.com提交Ajax请求

### jsonp

当请求的数据为json格式时，可以采用json with padding（jsonp）协议进行跨域

原理：
利用在页面中创建<script>节点的方法向不同域提交HTTP请求的方法称为JSONP，这项技术可以解决跨域提交Ajax请求的问题。JSONP的工作原理如下所述：
1. 客户端在请求url后面添加参数，比如："?callback=foo"（foo一般是客户端自定义的一个函数，用以处理传回的json数据）；
2. 服务器会将需要传回的json数据作为之前传递过来的foo函数的参数，组合之后，传回客户端，比如：foo({name:'kris'})；
3. 当客户端返回数据时，直接是客户端能执行的JavaScript，执行foo函数，因此达到跨域请求json的目的。

> 注意：采用jsonp进行跨域请求时，后台也需配合设置，以符合jsonp返回数据的要求

示例：
1. 原生JavaScript实现

```javascript
var jsonHandle = function(response) {
    console.log(response);
}
var script = document.createElement('script');
script.src = 'https://api.weibo.com/2/emotions.json?source=1362404091&callback=jsonHandle';
document.body.appendChild(script);
```

2. 利用jQuery中$.ajax方法
```javacript
$.ajax({
    url: "https://api.weibo.com/2/emotions.json?source=1362404091",
    dataType: 'jsonp',
    success: function (data) {
        console.log(data.code); // server response
    }
});
```