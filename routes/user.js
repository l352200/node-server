var router = require('express').Router();
var _ = require('lodash');
const db = require('./utils/db')
var UUID = require("uuid");
var response = require('./utils/response')
const DBObj = require("./utils/dbObj");
var jwt = require('jsonwebtoken');
var secretOrPrivateKey = "vueTestAdmin"

async function getJWTTokenData(token) {
    return jwt.verify(token, secretOrPrivateKey, async (err, decode) => {
        if (err) { //  时间失效的时候/ 伪造的token
            console.log(err,'err');
            return "";
        } else {
            console.log(decode,'decode');
            return decode;
        }
    });
}
router.get('/getUser', async function (req, res) {
    console.log(req.headers['x-token'], 'req');
    var token = req.headers['x-token']
    var msg=await getJWTTokenData(token)
    console.log(msg);
    // var params = req.query;
    var id=msg.id
    var sql = "select * from re_user where id=?"
    args = [id]
    db.queryOne(sql, args).then(ret => {
        console.log(ret, 'ret');
        res.json({
            stuUser: ret,
            code: 200,
            permission:''
        })
    })
})

// router.post('/getUserInfo', async function (req,res) {
//     var params = req.body;
//     var username=params.username
//     var password=params.password
//     var sql = "select * from re_user where username=? and password=?"
//     args = [username,password]
//     db.queryOne(sql, args).then(ret => {
//         if (!ret) {
//             res.json({
//                 code: -1,
//                 msg:'用户名不存在或密码错误'
//             })
//             return
//         }
//         console.log(ret, 'ret');
//         res.json({
//             data: ret
//         })
//     })
// })

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
        var token = jwt.sign({
            id: ret.id
        }, secretOrPrivateKey, {
            expiresIn: 30 * 60 
        });
        res.json({
            msg: '操作成功',
            token:token
        })
    })
})
module.exports = router