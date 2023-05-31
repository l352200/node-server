var router = require('express').Router();
var _ = require('lodash');
const db = require('./utils/db')
var UUID = require("uuid");
var response = require('./utils/response')
const DBObj = require("./utils/dbObj");

//首页最新资讯列表
router.get('/getNewsList', async function (req,res) {
    // var params = req.query;
    var sql1 = "select * from re_news where type=1 order by createdAt desc limit 0,5"
    var sql2 = "select count(*) as count from re_news where type=1 "
    var total = await db.queryOne(sql2)
    console.log(total);
    db.query(sql1).then(ret => {
        let list = ret.results

        res.json({
            rows:list,
            count:total.count||0
        })
    }).catch(e => {
        res.json(response(e))
    })
})
//获取单条资讯详情
router.get('/getNews', async function (req,res) {
    var params = req.query;
    var id = params.id
    if (!id) {
        res.json({
            code: -1,
            msg:'id缺失'
        })
        return
    }
    var sql1 = "select * from re_news where id=? and type=1"
    var args1 = [id]
    db.queryOne(sql1, args1).then(ret => {
        res.json({
            data:ret
        })
    }).catch(e => {
        res.json(response(e))
    })
})
// 首页相关事项列表
router.get('/getMattersList', async function (req,res) {
    // var params = req.query;
    var sql1 = "select * from re_news where type=2 order by createdAt desc limit 0,5"
    var sql2 = "select count(*) as count from re_news where type=2 "
    var total = await db.queryOne(sql2)
    console.log(total);
    db.query(sql1).then(ret => {
        let list = ret.results

        res.json({
            rows:list,
            count:total.count||0
        })
    }).catch(e => {
        res.json(response(e))
    })
})
// 获取单条事项详情
router.get('/getMatters', async function (req,res) {
    var params = req.query;
    var id = params.id
    if (!id) {
        res.json({
            code: -1,
            msg:'id缺失'
        })
        return
    }
    var sql1 = "select * from re_news where id=? and type=2"
    var args1 = [id]
    db.queryOne(sql1, args1).then(ret => {
        res.json({
            data:ret
        })
    }).catch(e => {
        res.json(response(e))
    })
})
module.exports = router