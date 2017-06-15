var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressLayout = require('express-ejs-layouts');
var partials = require('express-partials');
// var MongoStore = require('connect-mongo');
var settings = require('./settings');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session); 
var methodOverride = require('method-override');
var flash = require('connect-flash');

var routes = require('./routes/index');  //首页
var users = require('./routes/users');    // 用户主页

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(expressLayout);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());    //  Cookie 解析的中间件
app.use(express.static(path.join(__dirname, 'public')));

             
app.use(methodOverride('_method'));
app.use(session({         //提供会话支持
  secret : settings.cookieSecret,     
  key : settings.db,                    //cookie name
  cookie : {maxAge : 1000*60*60*24*30},
  resave : false,
  saveUninitialized : true,
  store : new MongoStore({        //设置它的 store 参数为 MongoStore 实例，把会话信息存储到数据库中，以避免丢失。
    db : settings.db,
    host : settings.host,
    post : settings.port,
    url : 'mongodb://127.0.0.1:27017', 
  })
}));
app.use(flash());
app.use(function(req, res, next){
  res.locals.user = req.session.user;
  res.locals.post = req.session.post;
  var error = req.flash('error');
  res.locals.error = error.length ? error : null;
  var success = req.flash('success');
  res.locals.success = success.length ? success : null;
  console.log("----------------------------------------------------");
  console.log(error);
  console.log(success);
  console.log(res.locals.user)
  next();
});

//页面路由方案
// app.use('/', routes);         //首页
app.use('/',routes);
app.use('/users',users);    //用户主页路由，用http://127.0.0.1:3000/u/user访问

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
