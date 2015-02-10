var session = require('express-session');

exports.viewHome = function(req, res) {
	res.render('homepage');
}