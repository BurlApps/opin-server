var Class = Parse.Object.extend("Class")
var Survey = Parse.Object.extend("Survey")
var Moment = require("moment")

module.exports.hasClasses = function(req, res, next) {
	var relation = req.user.relation("classes")

  relation.query().find(function(classes) {
    if(classes.length == 0)  
    	return res.redirect('/classes/new')
    
    req.user.classes = classes
    res.locals.classes = classes
    next()
  })
}

module.exports.hasClass = function(req, res, next) {
	module.exports.hasClasses(req, res, function() {	
		var classroom = new Class()
			
		classroom.id  = req.param("class")
		
		classroom.fetch().then(function() {
	  	req.classroom = classroom
	  	res.locals.classroom = classroom
	    next()
		}, function() {
	    res.redirect("/classes")
		})
	})
}

module.exports.findClass = function(req, res, next) {
	res.redirect("/classes/" + req.user.classes[0].id)
}

module.exports.home = function(req, res) {	
	var now = new Date()
	var query = new Parse.Query(Survey)
	var surveys = []
	
	query.equalTo("class", req.classroom)
	query.descending("createdAt")
	
	query.find().then(function(temps) {				
		return surveys = temps.map(function(survey) {
	    survey.duration = Moment.duration(survey.createdAt - now).humanize(true)
	    return survey
    })
	}).then(function() {
		return req.classroom.relation("students").query().count()
	}).then(function(students) {
		res.renderT('dashboard/classes/index', {
	  	mode: "surveys",
	    surveys: surveys,
	    students: students
		})
	})
}

module.exports.new = function(req, res) {
  res.renderT('dashboard/classes/new')
}

module.exports.newPOST = function(req, res) {
	var classroom = new Class()
	var relation = req.user.relation("classes")
	
	classroom.set("name", req.param("name"))
	
	classroom.save().then(function() {
		relation.add(classroom)
		return req.user.save()
	}).then(function() {
		res.successT({
			next: "/classes/" + classroom.id
		})
	}, res.errorT)
}
