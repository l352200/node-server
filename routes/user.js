var router = require('express').Router();
var _ = require('lodash');
const db = require('./utils/db')
var UUID = require("uuid");
var response = require('./utils/response')
const DBObj = require("./utils/dbObj");
const getClientIp=require('./config').getClientIp
var jwt = require('jsonwebtoken');
var secretOrPrivateKey = "vueTestAdmin"
const addLogs=require('./log')
async function getJWTTokenData(token) {
    return jwt.verify(token, secretOrPrivateKey, async (err, decode) => {
        if (err) { //  时间失效的时候/ 伪造的token
            return "";
        } else {
            return decode;
        }
    });
}



//获取登录用户个人信息
router.get('/getUser', async function (req, res) {
    var token = req.headers['x-token']
    var msg=await getJWTTokenData(token)
    // var params = req.query;
    var id = msg.id
    if (!id) {
        res.json({
            code: -1,
            msg:'获取身份信息失败'
        })
        return
    }
    var sql = "select * from re_user where id=?"
    args = [id]
    db.queryOne(sql, args).then(ret => {
        res.json({
            stuUser: ret,
            code: 200,
            permission:''
        })
    })
})

//修改用户信息
router.post('/updateUserInfo', async function (req,res) {
    var pathname = req._parsedUrl.pathname;

    var params = req.body;
    var id=params.id
    var userInfo=params.userInfo
    var sql = "select * from re_user where id=?"
    args = [id]
    db.queryOne(sql, args).then(ret => {
        if (!ret) {
            res.json({
                code: -1,
                msg:'用户未查到，请重新登录再尝试'
            })
            return
        }
        var newUser = new DBObj()
        newUser.set('username',userInfo.username)
        newUser.set('age',userInfo.age)
        newUser.set('sex',userInfo.sex)
        newUser.set('hobit',userInfo.hobit)
        db.execute("update re_user set ? where id=?", [newUser.format(), id]).then(() => {
            addLogs({
                userId: id,
                type:'修改用户信息',
                requestUrl:pathname,
                requestMethod:'post',
                requestParams:params,
                requestIp:getClientIp(req,true).ip,
                requestIpAddr:getClientIp(req,true).ipAddr,
                requestTime: new Date(),
                responseData:null,
                responseStatus:1,
            })
            res.json({
                msg: '操作成功'
            })  
        }).catch((e) => {
            addLogs({
                userId:id,
                type:'修改用户信息',
                requestUrl:pathname,
                requestMethod:'post',
                requestParams:params,
                requestIp:getClientIp(req,true).ip,
                requestIpAddr:getClientIp(req,true).ipAddr,
                requestTime: new Date(),
                responseData:e,
                responseStatus:0,
            })
            res.json({
                code: -1,
                msg:e
            })
        })

    })
})

//登录
router.post('/login', async function (req,res) {
    var pathname = req._parsedUrl.pathname;
    var params = req.body;
    var username=params.username
    var password=params.password
    var sql = "select * from re_user where username=? and password=?"
    args = [username,password]
    db.queryOne(sql, args).then(ret => {
        if (!ret) {
            res.json({
                code: -1,
                msg:'用户名不存在或密码错误'
            })
            return
        }
        var token = jwt.sign({
            id: ret.id
        }, secretOrPrivateKey, {
            expiresIn: 30 * 60 
        });
        addLogs({
            userId: ret.id,
            type:'登录',
            requestUrl:pathname,
            requestMethod:'post',
            requestParams:params,
            requestIp:getClientIp(req,true).ip,
            requestIpAddr:getClientIp(req,true).ipAddr,
            requestTime: new Date(),
            responseData:null,
            responseStatus:1,
        })
        res.json({
            msg: '操作成功',
            token:token
        })
    })
})

//注册
router.post('/register', async function (req,res) {
    var params = req.body;
    var username=params.username
    var password=params.password
    var sql = "select * from re_user where username=?"
    args = [username]
    db.queryOne(sql, args).then(async ret => {
        if (ret) {
            res.json({
                code: -1,
                msg:'用户名已存在'
            })
            return
        }
        var newUser=new DBObj()
        newUser.set('id', UUID.v1().replace(/-/g, ""))
        newUser.set('username',username)
        newUser.set('password',password)
        await db.execute("insert into re_user set ?",[newUser.format()])
        res.json({
            msg: '操作成功'
        })
    })
})

module.exports = router