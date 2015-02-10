var session = require('express-session');

exports.viewHome = function(req, res) {
	console.log(req.session);
	res.render('homepage');
}