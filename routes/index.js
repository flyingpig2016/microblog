var express = require('express'),
	router = express.Router(),
	crypto = require('crypto'),
	User = require('../models/user.js'),
	Post = require('../models/post.js'),
	flash = require('connect-flash');
/* 主页路由*/
router.get('/', function (req, res, next) {
	Post.get(null, function (err, posts) {
		if (err) {
			posts = [];
		}
		res.render('index', {
			title: '首页',
			posts: posts,
			user: req.session.user,
			layout: 'layout',
			success: res.locals.success,  //不能用req.flash('success').toString(),
			error: res.locals.error		  //不能用req.flash('error').toString(),
		})
		console.log("========================================================");
		console.log(res.locals.success)
		console.log(res.locals.error)
	})
});

// 用户注册路由 /reg
router.get('/reg',checkNotLogin);   //路由中间件，用来为页面设置访问权限
router.get('/reg', function (req, res) {
	res.render('reg', {
		title: '用户注册',
	});
})
router.post('/reg',checkNotLogin);	//路由中间件，用来为页面设置访问权限
router.post('/reg', function (req, res) {
	//检验用户两次输入的口令是否一致
	if (req.body['password-repeat'] != req.body.password) {
		req.flash('error', '两次输入的口令不一致');
		return res.redirect('./reg');
	}
	console.log(req.body['password'])
	//生成口令的散列值
	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('hex');
	var newUser = new User({name: req.body.username,password : password,});
	//检查用户名是否已经存在
	User.get(newUser.name, function (err, user) {
		if (user) {
			err = "用户名已经存在";
		}
		if (err) {
			req.flash('error', err);
			return res.redirect('/reg');
		}
		//如果不存在则新增用户
		newUser.save(function (err) {
				if (err) {
					req.flash('error', err);
					return res.redirect('/reg');
				}
				req.session.user = newUser; //保存用户到 session
				console.log("-------------------------------------");
				console.log(req.session.user);
				req.flash('success', '注册成功');
				res.redirect('/'); //返回到首页
			})
	})
})

//用户登录路由   //login
router.get('/login',checkNotLogin);   //路由中间件，用来为页面设置访问权限
router.get('/login', function (req, res, next) {
	res.render('login', {
		title: '登录页面',
	})
});
router.post('/login',checkNotLogin);   //路由中间件，用来为页面设置访问权限
router.post("/login",function(req,res){
	//生成口令的散列值
	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('hex');
	var username = req.body.username;
	User.get(username,function(err,user){
		if(!user){
			req.flash('error','用户不存在');
			return res.redirect('/login');
		}
		if(user.password != password){
			req.flash('error','用户口令错误');
			return res.redirect('/login');
		}
		req.session.user = user;
		req.flash('success','登陆成功');
		res.redirect('/');
	})
})


//用户登出路由   //logout
router.get('/logout',checkLogin);   //路由中间件，用来为页面设置访问权限
router.get('/logout', function (req, res, next) {
	req.session.user = null;
	req.flash('success','登出成功');
	res.redirect('/');
});

//发表信息路由 /post
router.post('/post',checkLogin)
router.post('/post', function (req, res, next) {
	var currentUser = req.session.user;
	var post = new Post(currentUser.name,req.body.post);
	post.save(function(err){
		if(err){
			req.flash('error',err);
			return res.redirect('/');
		}
		req.flash('success','发表成功');
		res.redirect('/u/' + currentUser.name);
	})

});
//用户信息路由
router.get('/u/:user', function (req, res, next) {
	User.get(req.session.user.name,function(err,user){
		console.log('**************************************');
		console.log(req.session.user.name);
		if(!user){
			req.flash('error','用户不存在-------------');
			return res.redirect('/');
		}
		Post.get(user.name,function(err,posts){
			if(err){
				req.flash('error',err);
				return res.redirect('/');
			}
			res.render('user', {
				title: user.name,
				posts : posts
			});
		})
	})
});

function checkLogin(req,res,next){
	if(!req.session.user){
		req.flash('error','未登入');
		return res.redirect('/login');
	}
	next();
}
function checkNotLogin(req,res,next){
	if(req.session.user){
		req.flash('error','已登入');
		return res.redirect('/reg');
	}
	next();
}
module.exports = router;