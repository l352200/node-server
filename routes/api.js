var router = require('express').Router();
router.use("/user", require("./user.js"));
module.exports = router;
