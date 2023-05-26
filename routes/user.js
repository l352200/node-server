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

module.exports = router