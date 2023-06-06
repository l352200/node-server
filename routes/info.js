var router = require('express').Router();
var _ = require('lodash');
const db = require('./utils/db')
var UUID = require("uuid");
var response = require('./utils/response')
const DBObj = require("./utils/dbObj");

//首页最新资讯列表
router.get('/getNewsList', async function (req, res) {
    // var params = req.query;
    var sql1 = "select * from re_news where type=1 order by createdAt desc limit 0,5"
    var sql2 = "select count(*) as count from re_news where type=1 "
    var total = await db.queryOne(sql2)
    console.log(total);
    db.query(sql1).then(ret => {
        let list = ret.results

        res.json({
            rows: list,
            count: total.count || 0
        })
    }).catch(e => {
        res.json(response(e))
    })
})
//获取单条资讯详情
router.get('/getNews', async function (req, res) {
    var params = req.query;
    var id = params.id
    if (!id) {
        res.json({
            code: -1,
            msg: 'id缺失'
        })
        return
    }
    var sql1 = "select * from re_news where id=? and type=1"
    var args1 = [id]
    db.queryOne(sql1, args1).then(ret => {
        res.json({
            data: ret
        })
    }).catch(e => {
        res.json(response(e))
    })
})
// 首页相关事项列表
router.get('/getMattersList', async function (req, res) {
    // var params = req.query;
    var sql1 = "select * from re_news where type=2 order by createdAt desc limit 0,5"
    var sql2 = "select count(*) as count from re_news where type=2 "
    var total = await db.queryOne(sql2)
    console.log(total);
    db.query(sql1).then(ret => {
        let list = ret.results

        res.json({
            rows: list,
            count: total.count || 0
        })
    }).catch(e => {
        res.json(response(e))
    })
})
// 获取单条事项详情
router.get('/getMatters', async function (req, res) {
    var params = req.query;
    var id = params.id
    if (!id) {
        res.json({
            code: -1,
            msg: 'id缺失'
        })
        return
    }
    var sql1 = "select * from re_news where id=? and type=2"
    var args1 = [id]
    db.queryOne(sql1, args1).then(ret => {
        res.json({
            data: ret
        })
    }).catch(e => {
        res.json(response(e))
    })
})

// 获取个人文章信息
router.get('/getPeronalArticle', async function (req, res) {
    var params = req.query;
    var authorId = params.authorId
    var page = +params.page || 1;
    var pageSize = +params.pageSize || 20;
    if (!authorId) {
        res.json({
            code: -1,
            msg: 'authorId缺失'
        })
        return
    }
    var skip = (page - 1) * pageSize;
    var sql1 = "select * from re_news where authorId=? and type in (1,3)"
    sql1 += " order by createdAt desc limit " + skip + "," + pageSize;
    var args1 = [authorId]
    var sql2 = "select count(*) as count from re_news where authorId=? and type in (1,3)"
    var total = await db.queryOne(sql2, args1)
    db.query(sql1, args1).then(ret => {

        res.json({
            rows: ret.results,
            count: total.count
        })
    }).catch(e => {
        res.json(response(e))
    })
})

//新增个人文章
router.post('/addPersonalArticle', async function (req, res) {
    var params = req.body;
    var authorId = params.authorId
    var title = params.title
    var content = params.content
    var type = params.type
    if (type == 1 && (!authorId || !title || !content)) {
        res.json({
            code: -1,
            msg: 'authorId/title/content未填写'
        })
    }
    var sql = "select * from re_user where id=?"
    db.queryOne(sql, [authorId]).then(ret => {
        if (!ret) {
            res.json({
                code: -1,
                msg: '作者信息错误无法发布，请联系管理员'
            })
            return
        }
        var author = ret.username
        console.log(ret, 'ret');
        var newsObj = new DBObj()
        newsObj.set('id', UUID.v1().replace(/-/g, ""))
        newsObj.set('title', title)
        newsObj.set('content', content)
        newsObj.set('authorId', authorId)
        newsObj.set('author', author)
        newsObj.set('type', type)
        db.execute("insert into re_news set ?", [newsObj.format()]).then(ret => {
            res.json({
                code: 0,
                msg: '操作成功'
            })
        }).catch(e => {
            res.json(response(e))
        })
    })


})


//修改个人文章
router.post('/updatePersonalArticle', async function (req, res) {
    var params = req.body;
    var id = params.id
    var title = params.title
    var content = params.content
    if (!id || !title || !content) {
        res.json({
            code: -1,
            msg: 'id/title/content未填写'
        })
    }
    db.execute("update re_news set title=?,content=? where id=?", [title, content, id]).then(ret => {
        res.json({
            code: 0,
            msg: '操作成功'
        })
    }).catch(e => {
        res.json(response(e))
    })

})

module.exports = router
