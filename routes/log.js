var router = require('express').Router();
var _ = require('lodash');
const db = require('./utils/db')
var UUID = require("uuid");
var response = require('./utils/response')
const DBObj = require("./utils/dbObj");



//写入日志
function addLogs(params) {
    var userId = params.userId || null
    var type=params.type||""
    var requestUrl = params.requestUrl || null
    var requestMethod = params.requestMethod || null
    var requestParams = params.requestParams || null
    var requestIp = params.requestIp || null
    var requestIpAddr = params.requestIpAddr || null
    var requestTime = params.requestTime || null
    var responseData = params.responseData || null
    var responseStatus = params.responseStatus || 0

    var newLog = new DBObj()
    newLog.set('userId', userId)
    newLog.set('type', type)
    newLog.set('requestUrl', requestUrl)
    newLog.set('requestMethod', requestMethod)
    newLog.set('requestParams', requestParams)
    newLog.set('requestIp', requestIp)
    newLog.set('requestIpAddr', requestIpAddr)
    newLog.set('requestTime', requestTime)
    newLog.set('responseData', responseData)
    newLog.set('responseStatus', responseStatus)
    try {
        db.execute('insert into re_log set ?', [newLog.format()])
    } catch (error) {
        console.error(error,'error');
    }
}

module.exports = addLogs;