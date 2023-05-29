var router = require('express').Router();
var _ = require('lodash');
const db = require('./utils/db')
var UUID = require("uuid");
var response = require('./utils/response')
const DBObj = require("./utils/dbObj");

router.get('/getNews', async function (req,res) {
    var params = req.query;
    var id=params.id
    var sql1 = "select * from re_news order by createdAt desc limit 0,5"
    var sql2 = "select count(*) as count from re_news "
    var args1 = [id]
    var total = await db.queryOne(sql2)
    console.log(total);
    db.query(sql1, args1).then(ret => {
        console.log(ret, 'ret');
        let list = ret.results

        res.json({
            list,
            count:total.count||0
        })
    })
})

module.exports = router