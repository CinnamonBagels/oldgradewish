exports.viewClasses = function(req, res) {
	/*if (req.query)
	{
		res.render('classPage');
	}
	else */
	{
		console.log(req);
		res.render('classes', {
			class : [
				{className : 'CSE170'},
				{className : 'CSE120'}
			]
		});
	}
}

