var router = require('express').Router();
router.use("/user", require("./user.js"));
router.use("/info", require("./info.js"));
module.exports = router;
