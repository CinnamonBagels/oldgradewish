var systemMessages = require('../systemMessages');
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var Assignment = require('../Schemas/assignment');
var Class = require('../Schemas/class');

exports.addAssignment = function(req, res) {
	
	var fields = req.body;
	//email = req.session.email
	//form fields = req.body = {}
	if(fields.assignmentPercentage.match(/\D/)
	 || (fields.assignmentWeight === '' || fields.assignmentWeight.match(/\D/))) {
		res.send({
			err : systemMessages.status.error.nonNumeric
		});
	} else {
		Assignment.findOne({ email : req.session.email, className : fields.className, assignment : fields.assignmentName }, function(err, assignment) {
			if(assignment) {
				res.send({
					err : 'Your assignments must have unique names'
				})
			} else {
				Assignment.find({ email : req.session.email, className : fields.className }, function(err, data) {
					if(err) {
						//console.log(err);
						res.send({
							err : systemMessages.status.error
						});
					} else {
						if(fields.extraCredit) {
							Class.findOne({ email : req.session.email, className : fields.className }, function(err, classDoc) {
								if(err) {
									//console.log(err);
									res.send({
										err : systemMessages.status.error
									});
								} else {
									if(classDoc) {
										var assignmentObject = {
											className : fields.className,
											email : req.session.email,
											assignment : fields.assignmentName,
											percentage : fields.assignmentPercentage,
											weight : fields.assignmentWeight,
											extraCredit : true
										}

										var newAssignment = new Assignment(assignmentObject);

										newAssignment.save(function(err) {
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
						} else {
							var totalWeight = 0;
							data.forEach(function(entry) {
								if(entry.extraCredit === false) {
									totalWeight = +totalWeight + +entry.weight;
								}
							});

							totalWeight = +totalWeight + +fields.assignmentWeight;

							if(Math.floor(totalWeight) > 100) {
								//console.log('Weight cannot exceed 100');
								res.send({
									err : systemMessages.status.error.exceedWeight
								});
							} else {
								Class.findOne({ email : req.session.email, className : fields.className }, function(err, classDoc) {
									if(err) {
										//console.log(err);
										res.send({
											err : systemMessages.status.error
										});
									} else {
										if(classDoc) {
											var assignmentObject = {
												className : fields.className,
												email : req.session.email,
												assignment : fields.assignmentName,
												percentage : fields.assignmentPercentage,
												weight : fields.assignmentWeight,
												extraCredit : false
											}

											var newAssignment = new Assignment(assignmentObject);

											newAssignment.save(function(err) {
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
										} else {
											//console.log('cannot find classDoc');
											res.send({
												err : systemMessages.status.error
											});
										}
									}
								});
							}
						}
					}
				});
			}
		})
		
	}

}

/*
 { className : className, assignmentPercentage: percentage, assignmentName : assignment}
 */
exports.updateAssignmentPercentage = function(req, res) {
	var fields = req.body;
	if(fields.assignmentPercentage.match(/\D/)) {
		res.send({
			err : systemMessages.status.error.nonNumeric
		})
	} else {
		Assignment.findOne({ email : req.session.email, className : fields.className, assignment : fields.assignmentName }, function(err, data) {
			if(err) {
				//console.log(err);
				res.send({
					err : systemMessages.status.error
				});
			} else {
				data.percentage = fields.assignmentPercentage;
				data.save(function(err) {
					if(err) {
						//console.log(err);
						res.send({
							err : systemMessages.status.error
						});
					} else {
						//console.log(systemMessages.status.ok);
						res.send({
							ok : systemMessages.status.ok
						});
					}
				});
			}
		});
	}
}

exports.updateAssignmentGoal = function(req, res) {
	//console.log(req.body);
	var fields = req.body;
	var desiredGrade = +fields.desiredGrade / 100;
	var pointsBurned = 0;
	var totalPoints = 0;
	var currentGrade = -1;
	var undoneWeight = 0;
	var goalTotal = 0;
	var necessaryPoints = 0;

	if(fields.assignmentWeights && fields.assignmentPercentages) {
		//console.log('why do i go in here');
		for(var i = 0; i < fields.assignmentWeights.length; i++) {
			if(fields.assignmentWeights[i] === '') {
				totalPoints += fields.assignmentPercentages[i] / 100;
			} else if(fields.assignmentPercentages[i] !== '' && fields.assignmentWeights[i] !== '') {
				totalPoints += (+fields.assignmentPercentages[i] / 100) * (+fields.assignmentWeights[i] / 100);
				pointsBurned += (+fields.assignmentWeights[i] / 100);
			} 
		}

		if(totalPoints !== 0) {
			currentGrade = totalPoints / pointsBurned;
		}

		undoneWeight = 1 - pointsBurned;

		goalTotal = desiredGrade - totalPoints;

		necessaryPoints = goalTotal / undoneWeight;
		necessaryPoints = Math.floor(necessaryPoints * 100);
		currentGrade = Math.floor(currentGrade * 100);
		//console.log(currentGrade, necessaryPoints);

		fields.assignmentPercentages.forEach(function(percentage) {
			totalPoints = percentage
		});

		Class.findOne({ email : req.session.email, className : fields.className }, function(err, data) {
			if(err) {
				//console.log(err);
				res.send({
					err : systemMessages.status.error
				});
			} else {
				if(data) {
					data.currentGrade = currentGrade;
					data.assignmentGoal = necessaryPoints;
					data.save(function(err) {
						if(err) {
							//console.log(err);
							res.send({
								err : systemMessages.status.error
							});
						} else {

							if(currentGrade < 0) {
								currentGrade = null;
							}
							
							if(necessaryPoints < 0) {
								necessaryPoints = '(' + necessaryPoints + ')';
								res.send({
									ok : systemMessages.status.ok,
									currentGrade : currentGrade,
									goal : necessaryPoints,
									overachieve : true
								});
							} else if(necessaryPoints > 100) {
								necessaryPoints = '(' + necessaryPoints + ')';
								res.send({
									ok : systemMessages.status.ok,
									currentGrade : currentGrade,
									goal : necessaryPoints,
									impossible : true
								});
							} else {
								res.send({
									ok : systemMessages.status.ok,
									currentGrade : currentGrade,
									goal : necessaryPoints
								});
							}
							
						}
					})
				} else {
					//console.log('cannot find data');
					res.send({
						err : systemMessages.status.error
					});
				}
			}
		});
	} else {
		res.send({
			ok : systemMessages.status.ok
		})
	}
}

/*{ assignmentName : assignment, className : className, weight : weight }*/
exports.updateAssignmentWeight = function(req, res) {
	var fields = req.body;
	if(fields.weight === '' || fields.weight.match(/\D/)) {
		res.send({
			err : systemMessages.status.error.nonNumeric
		});
	} else {
		Assignment.find({ email : req.session.email, className : fields.className }, function(err, data) {
			if(err) {
				//console.log(err);
				res.send({
					err : systemMessages.status.error
				});
			} else {
				if(data) {
					Assignment.findOne({email : req.session.email, assignment : fields.assignmentName, className : fields.className }, function(err, assignment) {
						if(err) {
							//console.log(err);
							res.send({
								err : systemMessages.status.error
							});
						} else {
							if(assignment) {
								//calculate whether assignment + total weight > 100
								var totalWeight = 0;

								data.forEach(function(entry) {
									//console.log(entry);
									if(entry.extraCredit === false) {
										totalWeight = +totalWeight + +entry.weight;
									}
								});

								totalWeight = +totalWeight - +assignment.weight;
								totalWeight = +totalWeight + +fields.weight;
								if(Math.floor(totalWeight) > 100) {
									//console.log('Weight cannot exceed 100');
									res.send({
										err : systemMessages.status.error.exceedWeight
									});
								} else {
									assignment.weight = fields.weight;
									assignment.save(function(err) {
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
							} else {
								//console.log('assignment not found');
								res.send({
									err : systemMessages.status.error
								});
							}
						}
					});
				} else {
					//console.log('data not found');
					res.send({
						err : systemMessages.status.error
					});
				}
			}
		})
	}
}

/*{ assignmentName : assignment, className : className }*/
exports.deleteAssignment = function(req, res) {
	var fields = req.body;

	Assignment.findOneAndRemove({ assignment : fields.assignmentName, email : req.session.email, className : fields.className }, function(err) {
		if(err) {
			//console.log(err);
			res.send({
				err : systemMessages.status.error
			});
		} else {
			Assignment.find({ email : req.session.email, className : fields.className }, function(err, data) {
				if(err) {
					//console.log(err);
					res.send({
						err : systemMessages.status.error
					});
				} else {
					if(data.length == 0) {
						Class.findOne({ email : req.session.email, className : fields.className }, function(err, data) {
							if(err) {
								//console.log(err);
								res.send({
									err : systemMessages.status.error
								});
							} else {
								if(data) {
									data.currentGrade = -1;
									data.assignmentGoal = 0;
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
					} else {
						//console.log(data);
						//console.log('data found?');
						res.send({
							ok : systemMessages.status.ok
						});
					}
				}
			});
		}
	});
}

exports.updateAssignment = function(req, res) {
	var fields = req.body;

	Assignment.findOne({ email : req.session.email, assignment : fields.assignmentName, className : fields.className }, function(err, assignment) {
		if(err) {
			//console.log(err);
			res.send({
				err : 'lol'
			});
		} else {
			if(assignment) {
				assignment.weight = fields.assignmentWeight;
				assignment.percentage = fields.assignmentPercentage;
				assignment.assignment = fields.newAssignmentName
				assignment.save(function(err) {
					if(err) {
						//console.log(err);
						res.send({
							err : 'lol'
						});
					} else {
						res.send({
							ok : systemMessages.status.ok,
						});
					}
				});
			}
		}
	});
}

exports.updateAssignmentName = function(req, res) {
	var fields = req.body;

	Assignment.findOne({ email : req.session.email, assignment : fields.newAssignmentName, className : fields.className }, function(err, oldAssignment) {
		if(oldAssignment && oldAssignment.assignment !== fields.newAssignmentName) {
			res.send({
				err : 'Your assignments must have unique names'
			});
		} else {
			Assignment.findOne({ email : req.session.email, assignment : fields.oldAssignmentName, className : fields.className }, function(err, assignment) {
				if(err) {
					res.send({
						err : err
					});
				} else {
					if(assignment) {
						assignment.assignment = fields.newAssignmentName;
						assignment.save(function(err) {
							if(err) {
								res.send({
									err : err
								});
							} else {
								res.send({
									ok : 'OK'
								})
							}
						});
					} else {
						res.send({
							err : 'no assignment found'
						});
					}
				}
			});
		}
	});
}

