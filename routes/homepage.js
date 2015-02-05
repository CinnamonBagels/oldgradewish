exports.viewHome = function(req, res) {
	console.log(req.query);
	res.render('homepage');
}