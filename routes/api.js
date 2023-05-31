var router = require('express').Router();
router.use("/", require("./user.js"));
router.use("/info", require("./info.js"));
module.exports = router;
