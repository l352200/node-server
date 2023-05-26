//示例Controller

var router = require('express').Router();
var _ = require('lodash');
const db = require('./utils/db')
var UUID = require("uuid");
//报错信息可查看response.js
var response = require('./utils/response')
const DBObj = require("./utils/dbObj");

//新增时获取数据objectId
function getUUID() {
    return UUID.v1().replace(/-/g, "");
}

/**
 * 获取所有培训方案列表
 */
router.get('/classList', async function (req, res) {
    var params = req.query;
    var page = +params.page || 1;
    var pageSize = +params.pageSize || 20;
    var keyword = params.keyword;

    var skip = (page - 1) * pageSize;
    var sql = "select * from tr_class where isDel=0";
    var args = []
    if (keyword) {
        sql += " and (name like ? or orgName like ?) ";
        args.push(`%${keyword}%`)
        args.push(`%${keyword}%`)
    }
    sql += " order by createdAt desc limit ?,?";
    args.push(skip)
    args.push(pageSize)

    // var ret1 = await db.query(sql, args);
    console.log("sql:", sql)
    //query 数据库查询操作
    db.query(sql, args).then(ret => {
        res.json({
            count: ret.count,
            data: ret.results
        });
    }).catch(err => {
        res.json(response(err));
    });
});

/**
 * 新增培训方案
 */
router.post('/addNewClass', async function (req, res) {
    var params = req.query;
    var name = params.name
    var orgId = params.orgId
    var kind = params.kind
    var year = params.year
    //DBObj 存储字段的对象 
    var newTRClass = new DBObj()
    newTRClass.set("objectId", getUUID())
    newTRClass.set("name", name)
    newTRClass.set("orgId", orgId)
    newTRClass.set("kind", kind)
    newTRClass.set("year", year)
    var sql = "insert into tr_class set ?";
    //execute 数据库写操作 
    // format() 对象封装的格式化方法 对象数组转json 日期yyyy-MM-dd hh:mm:ss格式化 布尔值转0、1
    db.execute(sql, [newTRClass.format()]).then(ret => {
        if (!ret) {
            res.json('新增失败')
            return
        }
        res.json('新增成功')
    }).catch(err => {
        res.json(response(err));
    });
});

/**
 * 修改培训方案信息
 */
router.post('/updateClass', async function (req, res) {
    var params = req.query;
    var id = params.id
    var name = params.name
    var orgId = params.orgId
    var kind = params.kind
    var year = params.year
    var isDel = params.isDel
    if (!id) {
        res.json({
            code: -1,
            msg: '入参缺失'
        })
        return
    }
    if (isDel) {
        //execute 数据库写操作 修改单个字段
        db.execute("update tr_class set isDel=? where objectId=?", [isDel, id]).then(ret => {
            if (!ret) {
                res.json('修改失败')
                return
            }
            res.json('修改成功')
        }).catch(err => {
            res.json(response(err));
        });
        return
    }
    //queryOne 查询单条数据
    var classObj = await db.queryOne("select * from tr_class where objectId=?", [id])
    var newTRClass = new DBObj(classObj)
    newTRClass.set("name", name)
    newTRClass.set("orgId", orgId)
    newTRClass.set("kind", kind)
    newTRClass.set("year", year)
    //execute 数据库写操作 修改多个字段
    var sql = "update tr_class set ? where objectId=?";
    db.execute(sql, [newTRClass.format(), id]).then(ret => {
        if (!ret) {
            res.json('修改失败')
            return
        }
        res.json('修改成功')
    }).catch(err => {
        res.json(response(err));
    });
});

// 常见报错：
// 1、Data too long for column 'XX' at row 1           更新字段超出表中字段长度限制

// 2、Incorrect integer value: 'x' for column 'XX' at row 1          整数类型字段接收到更新字段类型不符

// 3、You have an error in your SQL syntax;           SQL语句语法错误
//    check the manual that corresponds to your MySQL server version for the right syntax to use near 'XX' at line 1

// 4、Unknown column 'XX' in 'field list'         列名错误，查找不到要操作的字段

// 5、Table 'XXX' doesn't exist           表名错误，差找不到要操作的表

// 6、Duplicate entry 'XX' for key 'PRIMARY'        由于主键设置 不能重复

module.exports = router;
