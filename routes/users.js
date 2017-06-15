var express = require('express');
var router = express.Router();
//用户的主页路由 /u/user
router.get('/', function(req, res, next) {
  res.send('respond with a resource')
});
module.exports = router;
