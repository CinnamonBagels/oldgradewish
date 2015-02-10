exports.viewClasses = function(req, res) {
	if(!req.session.email) {
		return res.redirect('/login');
	}
	if (req.query.class)
	{
		res.render('class', {
			'className' : req.query.class
		});
	}
	else 
	{
		res.render('classes', {
			classes : [
				{className : 'CSE170'},
				{className : 'CSE120'}
			]
		});
	}
}

