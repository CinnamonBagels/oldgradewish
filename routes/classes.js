var systemMessages = require('../systemMessages');
var session = require('express-session');
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var User = require('../Schemas/users');
var Assignment = require('../Schemas/assignment');
var Class = require('../Schemas/class');

exports.viewClasses = function(req, res) {
	var classObject;
	var classPageObject;
	var classes = [];
	if(!req.session.email) {
		return res.redirect('/login');
	} else {
		User.findOne({ email : req.session.email }, function(err, data) {
			if(err) {
				//console.log(err);
				res.end();
			} else {
				data.classes.forEach(function(element) {
					classObject = {
						'className' : element
					};
					classes.push(classObject);
				});
				res.render('classes', {
					'classes' : classes,
					'session' : {
						'sessionClasses' : classes
					}
				});
			}
		});
	}
}

exports.viewClass = function(req, res) {
	var classes = [];
	var assignments;
	var desiredGrade;
	var classPageObject;
	var classObject;
	var currentGrade;
	var assignmentPercentage;
	if(!req.session.email) {
		res.redirect('/login');
	} else {
		assignments = [];
		User.findOne({ email : req.session.email }, function(err, user) {
			if(err) {
				//console.log(err);
				res.send({
					err : systemMessages.status.error
				});
			} else {
				if(user) {

					user.classes.forEach(function(element) {
						classObject = {
							'className' : element
						};
						classes.push(classObject);
					});
					Assignment.find({ email : req.session.email, className : req.params.classID }, function(err, data) {
						if(err) {
							//console.log(err);
							res.send(err);
						} else {
							assignments = data;
							Class.findOne({ email : req.session.email, className : req.params.classID }, function(err, classObj) {
								if(err) {
									//console.log(err);
									res.send(err);
								} else {
									if(classObj) {
										desiredGrade = classObj.desiredGrade;
										if(classObj.currentGrade < 0) {
											currentGrade = null;
										} else {
											currentGrade = classObj.currentGrade;
										}

										assignmentPercentage = classObj.assignmentGoal

										if(assignmentPercentage < 0) {
											assignmentPercentage = '(' + assignmentPercentage + ')';
											classPageObject = {
												'className' : req.params.classID,
												'assignments' : assignments,
												'desiredGrade' : desiredGrade,
												'assignmentPercentage' : assignmentPercentage,
												'currentGrade' : currentGrade,
												'session' : {
													'sessionClasses' : classes
												},
												'overacheive' : true
											};
										} else if(assignmentPercentage > 100) {
											assignmentPercentage = '(' + assignmentPercentage + ')';
											classPageObject = {
												'className' : req.params.classID,
												'assignments' : assignments,
												'desiredGrade' : desiredGrade,
												'assignmentPercentage' : assignmentPercentage,
												'currentGrade' : currentGrade,
												'session' : {
													'sessionClasses' : classes
												},
												'impossible' : true
											};
										} else {
											classPageObject = {
												'className' : req.params.classID,
												'assignments' : assignments,
												'desiredGrade' : desiredGrade,
												'assignmentPercentage' : assignmentPercentage,
												'currentGrade' : currentGrade,
												'session' : {
													'sessionClasses' : classes
												}
											};
										}

										res.render('class', classPageObject);
									}
								}
							});
							
						}
					});
				} else {
					//console.log('cannot find user');
					res.send({
						err : systemMessages.status.error
					});
				}
			}
		});
	}
}

exports.addClass = function(req, res) {
	var fields = req.body;
	var newClass = fields.className;
	var currentClasses = [];
	var classExists = false;
	var classObject;
	//console.log(fields.desiredGrade);

	if(fields.desiredGrade.match(/\D/) || fields.desiredGrade === '') {
		res.send({
			err : systemMessages.status.error.nonNumeric
		});
	} else {
		User.findOne({ email : req.session.email }, function(err, data) {
			if(data) {
				data.classes.forEach(function(element) {
					if(element === newClass) {
						classExists = true;
					}
				});
				if(classExists === false) {

					data.classes.unshift(newClass);
					data.save(function(err) {
						if(err) {
							//console.log(err);
							res.send({
								err : err
							});
						}
					});

					classObject = new Class({
						className : newClass,
						email : req.session.email,
						desiredGrade : fields.desiredGrade
					});

					classObject.save(function(err) {
						if(err) {
							//console.log(err);
							res.send({
								err : err
							});
						} else {
							res.send({
								ok : systemMessages.status.ok
							});
						}
					})
				} else {
					res.send({
						err : 'You cannot add duplicate classes.'
					});
				}
				
			} else {
				res.send({
					err : 'User not found, please logout and log back in.'
				});
			}
		});
	}
}

exports.updateDesiredGrade = function(req, res) {
	var fields = req.body;
	if(fields.desiredGrade === '' || fields.desiredGrade.match(/\D/)) {
		res.send({
			err : systemMessages.status.error.nonNumeric
		});
	} else {
		Class.findOne({ email : req.session.email, className : fields.className }, function(err, data) {
			if(err) {
				//console.log(err);
				res.send({
					err : systemMessages.status.error
				});
			} else {
				if(data) {
					data.desiredGrade = fields.desiredGrade;
					data.save(function(err) {
						if(err) {
							//console.log(err);
							res.send({
								err : systemMessages.status.error
							});
						} else {
							res.send({
								ok : systemMessages.status.ok
							});
						}
					});
				}
			}
		});
	}
}

exports.deleteClass = function(req, res) {
	var fields = req.body;
	var classes = [];

	Class.remove({ email : req.session.email, className : fields.className }, function(err) {
		if(err) {
			//console.log(err);
			res.send({
				err : systemMessages.status.error
			});
		} else {
			Assignment.remove( { email : req.session.email, className : fields.className}, function(err) {
				if(err) {
					//console.log(err);
					res.send({
						err : systemMessages.status.error
					});
				} else {
					User.findOne({ email : req.session.email }, function(err, data) {
						if(err) {
							//console.log(err);
							res.send({
								err : systemMessages.status.error
							});
						} else {
							if(data) {
								data.classes.forEach(function(element) {
									if((element === fields.className) == false) {
										classes.push(element);
									}
								});

								data.classes = classes;
								data.save(function(err) {
									if(err) {
										//console.log(err);
										res.send({
											err : systemMessages.status.error
										});
									} else {
										res.send({
											ok : systemMessages.status.ok
										});
									}
								});
							}
						}
					});
				}
			})
		}
	})
}

