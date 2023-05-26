/*引入express*/
const express = require("express")
const path = require('path');
const timeout = require('connect-timeout');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
/*创建一个app实列调用对象*/
const app = express()

app.use(cookieParser());
app.use(cookieSession({
    name: 'session',
    // secure: false,
    // sameSite: 'none',
    keys: ['tr-train']
}));

// 设置模板引擎
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(bodyParser.text({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: false}))
app.use(bodyParser.json({limit: '50mb'}));
// 设置默认超时时间
app.use(timeout('15s'));

app.use("/demo", require('./routes/demoController'));//接口请求示例文件
app.use("/api", require('./routes/api'));

app.get('/', function (req, res) {
    res.render('index', {
        currentTime: new Date()
    });
});


app.use(function (req, res, next) {
    // 如果任何一个路由都没有返回响应，则抛出一个 404 异常给后续的异常处理器
    if (!res.headersSent) {
        var err = new Error('您所请求的信息不存在[' + req.protocol + '://' + req.hostname + req.originalUrl + ']，我们已记录了。请稍候再试或联系管理员');
        console.error('[' + req.protocol + '://' + req.hostname + req.originalUrl + ']', req.ip, req.ips);
        err.status = 404;
        next(err);
    }
});

module.exports = app;
