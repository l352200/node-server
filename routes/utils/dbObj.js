/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625
 * 创建日期: 2022/10/31
 */


const changeDate = require("./changeDate");

function isValidDate(dateString) {
    const regEx = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateString.match(regEx)) return false;  // Invalid format
    const d = new Date(dateString);
    const dNum = d.getTime();
    if (!dNum && dNum !== 0) return false; // NaN value, Invalid date
    return d.toISOString().slice(0, 10) === dateString;
}

class DBObj {
    constructor(_data) {
        for (let _key in _data) {
            if (_data.hasOwnProperty(_key)) {
                this[_key] = _data[_key];
            }
        }
        if (this.objectId) { //  && !this.id
            this.id = this.objectId;
        }
    }

    get(_key) {
        return this[_key];
    }

    set(_key, _val) {
        if (_val === true || _val === false) {
            this[_key] = +_val;
        } else {
            this[_key] = _val;
        }
    }

    unset(_key) {
        this[_key] = null;
    }


    format() {
        for (let _key in this) {
            if (this.hasOwnProperty(_key)) {
                if (this[_key] === undefined) {
                    this[_key] = null;
                }
            }
        }
        let _res = JSON.parse(JSON.stringify(this));
        for (let _key in _res) {
            if (_res.hasOwnProperty(_key)) {
                if (_res[_key] instanceof Object || _res[_key] instanceof Array) {
                    _res[_key] = JSON.stringify(_res[_key]);
                } else if (_res[_key] instanceof Date) {
                    _res[_key] = changeDate(_res[_key], "yyyy-MM-dd hh:mm:ss");
                } else if (typeof _res[_key] === 'string' && _res[_key].length > 10 && isValidDate(_res[_key].substr(0, 10)) && new Date(_res[_key]).toString() !== 'Invalid Date') {
                    _res[_key] = changeDate(_res[_key], "yyyy-MM-dd hh:mm:ss");
                } else if (_res[_key] === false) {
                    _res[_key] = 0;
                } else if (_res[_key] === true) {
                    _res[_key] = 1;
                }
            }
        }
        if (_res.objectId === _res.id) {
            delete _res.id;
        }
        return _res;
    }

    toDBObject() {
        return this.format();
    }
}

module.exports = DBObj;
