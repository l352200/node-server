/**
 * 文件说明: Mysql 数据库操作
 * ----------------------------------------
 * 创建用户: liubiqu@qq.com
 * 创建日期: 2022/10/7
 */
const mysql = require("mysql2");
const changeDate = require('./changeDate');

let envConfig = process.env['MY_MYSQL'];
if (!envConfig) {
    console.error("$$$$$$$$$$$$$ MY_MYSQL 数据库连接未配置")
    return;
}
const dbConfig = envConfig ? JSON.parse(envConfig) : "";

let envConfigRO = process.env['MY_MYSQL_RO'];
if (!envConfigRO) {
    console.warn("$$$$$$$$$$$$$ MY_MYSQL_RO 数据库连接未配置，读写分离不生效")
    // return;
}
const dbConfigRO = envConfigRO ? JSON.parse(envConfigRO) : dbConfig;
const poolRO = mysql.createPool(dbConfigRO);
const pool = mysql.createPool(dbConfig);

pool.on('connection', function () {
    console.log("MySqlConnectPool success", dbConfig.host, dbConfig.user);
});
poolRO.on('connection', function () {
    console.log("MySqlConnectPool ReadOnly success", dbConfigRO.host, dbConfigRO.user);
});

/**
 * 数据库查询单一记录
 * @param sql
 * @param params
 * @param callback
 * @returns {Promise<unknown>}
 */
function queryOne(sql, params = [], callback = null) {
    if (sql && sql.toLowerCase().startsWith('select ')) {
        return new Promise((resolve, reject) => {
            poolRO.getConnection(function (err, connection) {
                if (err) {
                    console.error("getconnection error:", err['errno'], err['sqlMessage']);
                    reject({code: err['errno'], message: err['sqlMessage'], sql});
                }
                if (sql.toLowerCase().indexOf(' limit ') === -1) {
                    sql = `${sql} limit 1`;
                }
                connection.query(sql, params, function (err, rows) {
                    connection.release();
                    if (process.env.NODE_ENV !== "production") {
                        console.log('queryOne sql string：', connection.format(sql, params));
                    }
                    if (err) {
                        console.error("queryOne error:", err['errno'], err['sqlMessage']);
                        // todo 同步到后台错误日志服务
                        reject({code: err['errno'], message: err['sqlMessage'], sql, params});
                    } else if (rows.length) {
                        const _res = {...rows[0]};
                        resolve(_res);
                        callback && callback(_res);
                    } else {
                        resolve(null);
                        callback && callback(null);
                    }
                });
            });
        });
    } else {
        return null;
    }
}

/**
 * 数据库查询操作
 * @param sql
 * @param params
 * @param callback
 * @returns {Promise<unknown>}
 */
function query(sql, params = [], callback = null) {
    sql = sql && sql.trim();
    if (sql && sql.toLowerCase().startsWith('select ')) {
        if (sql.toLowerCase().indexOf('SQL_CALC_FOUND_ROWS') === -1) {
            sql = `select SQL_CALC_FOUND_ROWS ${sql.substring(7)}`;
        }
        return new Promise((resolve, reject) => {
            poolRO.getConnection(function (err, connection) {
                if (err) {
                    console.error("getconnection error:", err['errno'], err['sqlMessage']);
                    reject({code: err['errno'], message: err['sqlMessage'], sql});

                }
                connection.query(sql, params, function (err, rows) {
                    if (process.env.NODE_ENV !== "production") {
                        console.log('query sql string：', connection.format(sql, params));
                    }
                    if (err) {
                        connection.release();
                        console.error("query error:", err['errno'], err['sqlMessage']);
                        reject({code: err['errno'], message: err['sqlMessage'], sql, params});
                    } else {
                        connection.query('SELECT FOUND_ROWS() as cnt', function (err, cnt) {
                            connection.release();
                            const _res = {results: rows, count: cnt[0]['cnt']};
                            resolve(_res);
                            callback && callback(_res);
                        });
                    }
                });
            });
        });
    } else {
        return null;
    }
}

/**
 * 数据库写操作
 * @param sql
 * @param params
 * @param callback
 * @returns {Promise<unknown>}
 */
function execute(sql, params = [], callback = null) {
    sql = sql && sql.trim();
    if (sql) {
        return new Promise((resolve, reject) => {
            pool.getConnection(function (err, connection) {
                if (err) {
                    console.error("getconnection error:", err['errno'], err['sqlMessage']);
                    reject({code: err['errno'], message: err['sqlMessage'], sql});

                }
                connection.query(sql, params, function (err, result, res) {
                    connection.release();
                    if (process.env.NODE_ENV !== "production") {
                        console.log('execute sql string：', connection.format(sql, params));
                    }
                    if (err) {
                        console.error("execute error:", err['errno'], err['sqlMessage']);
                        reject({code: err['errno'], message: err['sqlMessage'], sql, params});
                    } else {
                        resolve(result);
                        callback && callback(result);
                    }
                });
            });
        });
    } else {
        return null;
    }
}

/**
 * 根据ids查列表
 * @param tableName
 * @param ids
 */
function queryByIds(tableName, ids) {
    let _ids = [];
    if (ids && ids instanceof Array) {
        ids.forEach((_id) => {
            if (_id && !_ids.includes(_id)) {
                _ids.push(_id);
            }
        });
    }
    if (!_ids.length) {
        return {results: [], count: 0};
    } else {
        const sql = 'select * from ?? where objectId in (?)';
        return query(sql, [tableName, _ids]);
    }
}

/**
 * 根据id查对像
 * @param tableName
 * @param id
 */
function queryById(tableName, id) {
    const sql = 'select * from ?? where objectId=?';
    return queryOne(sql, [tableName, id]);
}

/**
 * 根据结果集生成子集
 * @param res
 * @param fieldName
 * @param tableName
 */
async function includeByRes(res, fieldName, tableName) {
    if (!tableName) {
        var tables = {
            "resultId": "tr_allowance",
            "certId": "tr_cert_zypx",
            "groupId": "tr_allowance_group",
            "companyUserId": "tr_ent_user",
            "classUserId": "tr_class_user",
            "orgId": "tr_company",
            "classId": "tr_class"
        };
        tableName = tables[fieldName];
    }
    if (!tableName) {
        console.log("includeByRes_res", fieldName, tableName);
        return;
    }
    var _ids = res.map(_ => _[fieldName]);
    if (_ids && _ids.length > 0) {
        var _arr = [];
        _ids.forEach((_id, index) => {
            if (_id && _id instanceof Array) {
                if (_id.length > 0) {
                    var _objectIds = _id.map(_ => {
                        if (typeof (_) === "object") {
                            return _["objectId"]
                        }
                        if (typeof (_) === "string") {
                            return _
                        }
                    });
                    _arr.push(..._objectIds);
                    res[index]["objectIds"] = _objectIds;
                    res[index][fieldName] = [];
                } else {
                    _ids[index] = null;
                }
            }
        });
        if (_arr && _arr.length > 0) {
            _ids = _arr;
        }
        _ids.forEach((_id, index) => {
            if (!_id) {
                delete _ids[index];
            }
        });
        var _ret = await queryByIds(tableName, _ids);
        _ret.results.forEach((_item, index) => {
            res.forEach((_item2, index2) => {
                if (_arr.length > 0) {
                    if (_item2["objectIds"].indexOf(_item.objectId) !== -1) {
                        res[index2][fieldName].push(_item);
                    }
                } else {
                    if (_item.objectId == _item2[fieldName]) {
                        res[index2][fieldName] = _item;
                    }
                }
            });
        });
    }
    res.forEach((_item, index) => {
        delete _item["objectIds"];
    });
    return res;
}

/**
 * 格式化sql语句对象
 * @param obj
 */
function fmtSqlObj(obj) {
    // 遍历Object/Array转JSON串
    for (let key in obj) {
        // 删除多余字段
        if (["id"].indexOf(key) !== -1) {
            delete obj[key];
        }
        // Date转化
        if (obj[key] instanceof Date) {
            obj[key] = changeDate(obj[key], "yyyy-MM-dd hh:mm:ss");
        }
        // Boolean转化
        if (obj[key] instanceof Boolean) {
            obj[key] = obj[key] ? 1 : 0;
        }
        // 对像转化为字符串（放最后）
        if (typeof (obj[key]) == "object") {
            obj[key] = JSON.stringify(obj[key]);
        }
    }
    return obj;
}

/**
 * 格式化sql语句对象
 * @param str
 */
function splitStr(str) {
    let ret = str;
    if (str && typeof (str) === 'string') {
        ret = str.split(",");
    }
    return ret;
}

module.exports = {
    queryOne, query, execute, queryByIds, queryById, includeByRes, fmtSqlObj, splitStr
}
