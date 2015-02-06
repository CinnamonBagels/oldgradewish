exports.viewClasses = function(req, res) {
	if (req.query.class)
	{
		res.render('class', {
			'className' : req.query.class
		});
	}
	else 
	{
		res.render('classes', {
			class : [
				{className : 'CSE170'},
				{className : 'CSE120'}
			]
		});
	}
}

