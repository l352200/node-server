var router = require('express').Router();
var _ = require('lodash');
const db = require('./utils/db')
var UUID = require("uuid");
var response = require('./utils/response')
const DBObj = require("./utils/dbObj");

router.get('/getUser', async function (req,res) {
    var params = req.query;
    var id=params.id
    var sql = "select * from re_user where id=?"
    args = [id]
    db.queryOne(sql, args).then(ret => {
        console.log(ret, 'ret');
        res.json(ret)
    })
})

router.post('/login', async function (req,res) {
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
        console.log(ret, 'ret');
        res.json({
            data: ret
        })
    })
})

module.exports = router