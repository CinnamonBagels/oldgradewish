exports.viewLogin = function(req, res) {
	if(req.session.user) {
		res.render()
	}
	res.render('login');
}