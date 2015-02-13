var session = require('express-session');
var systemMessages = require('../systemMessages');

exports.viewHome = function(req, res) {
	console.log(req.session);
	res.render('homepage');
}