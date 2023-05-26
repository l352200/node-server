/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 2022/11/10
 */
//日期格式转换
function changeDate(time, dateType) {
    if (!time) return "";
    if (!dateType) {
        dateType = "yyyy-MM-dd"
    }
    time = new Date(time);
    var y = time.getFullYear();
    var M = time.getMonth() + 1;
    var d = time.getDate();
    var h = time.getHours();
    var m = time.getMinutes();
    var s = time.getSeconds();
    var t = time.getMilliseconds();
    if (y == "NaN") {
        return null;
    }
    M = M < 10 ? ("0" + M) : M;
    d = d < 10 ? ("0" + d) : d;
    h = h < 10 ? ("0" + h) : h;
    m = m < 10 ? ("0" + m) : m;
    s = s < 10 ? ("0" + s) : s;
    dateType = dateType.replace("yyyy", y);
    dateType = dateType.replace("MM", M);
    dateType = dateType.replace("dd", d);
    dateType = dateType.replace("hh", h);
    dateType = dateType.replace("mm", m);
    dateType = dateType.replace("ss", s);
    dateType = dateType.replace("tt", t);
    return dateType;
}
module.exports = changeDate;
