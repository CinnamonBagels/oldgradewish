var session = require('express-session');
var status = require('../status');

exports.viewHome = function(req, res) {
	console.log(req.session);
	res.render('homepage');
}