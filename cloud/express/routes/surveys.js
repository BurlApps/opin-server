var Survey = Parse.Object.extend("Survey")
var Question = Parse.Object.extend("Question")

module.exports.hasSurvey = function(req, res, next) {
	var survey = new Survey()
		
	survey.id = req.param("survey")
	
	survey.fetch().then(function() {		
  	req.survey = survey
  	res.locals.survey = survey
    next()
	}, function() {
		if(req.installation)
			return res.redirect("callback://done")
			
    res.redirect("/classes")
	})
}

module.exports.new = function(req, res) {
	var date = new Date()
	var month = date.getMonth() + 1
	var day = date.getDate()
	
  res.renderT('dashboard/surveys/index', {
	  mode: "create",
	  day: month + '/' +day,
	  config: {
			mode: "Create"
	  }
  })
}

module.exports.newPOST = function(req, res) {
	var survey = new Survey()
	var questions = req.param("questions")
	var relation = survey.relation("questions")
	var promise = Parse.Promise.as()
	
	survey.set("name", req.param("name"))
	survey.set("class", req.classroom)
		
	questions.forEach(function(data, index) {
    promise = promise.then(function() {
      var question = new Question()
      
      question.set("tag", data.tag)
      question.set("question", data.question)
      question.set("index", index)
      
      return question.save().then(function() {
	    	return relation.add(question)
      })
    })
  })
	  
	promise.then(function() {
		return survey.save()
	}).then(function() {
		res.successT({
			next: "/classes/" + req.classroom.id
		})
	}, res.errorT)
}

module.exports.send = function(req, res) {
	if(req.survey.get("state") > 0)
		return res.redirect("/classes/" + req.classroom.id + "/" + req.survey.id)
	
	var students = req.classroom.relation("students")
	var count = 0

	students.query().each(function(student) {
		var surveys = student.relation("surveys")
		
		surveys.add(req.survey)
		count++
		
		return student.save()
	}).then(function() {
		return Parse.Push.send({
		  where: students.query(),
		  data: {
		    actions: "survey.new",
		    survey: req.survey.id,
		    alert: req.classroom.get("name") + " posted a new survey!",
		    badge: "Increment"
		  }
		})
	}).then(function() {
		req.survey.set("sent", count)
		req.survey.set("state", 1)
		
		return req.survey.save()
	}).then(function() {
		res.redirect("/classes/" + req.classroom.id + "/" + req.survey.id)
	})
}

module.exports.view = function(req, res) {
  if(req.survey.get("state") == 0)
		return res.redirect("/classes/" + req.classroom.id + "/" + req.survey.id + "/edit")
	
	
	var query = req.survey.relation("questions").query()
	
	query.ascending("index")
	
	query.find().then(function(questions) {
		res.renderT("dashboard/surveys/index", {
			mode: "view",
			questions: questions
		})
	})
}

module.exports.edit = function(req, res) {
  if(req.survey.get("state") > 0)
		return res.redirect("/classes/" + req.classroom.id + "/" + req.survey.id)
	
	var query = req.survey.relation("questions").query()
	
	query.ascending("index")
	
	query.find().then(function(questions) {
		res.renderT("dashboard/surveys/index", {
			mode: "edit",
			questions: questions,
			config: {
				mode: "Save"
		  }
		})
	})
}

module.exports.editPOST = function(req, res) {
	var questions = req.param("questions")
	var relation = req.survey.relation("questions")
	var promise = Parse.Promise.as()
	
	req.survey.set("name", req.param("name"))
	
	relation.query().each(function(question) {
		relation.remove(question)
	}).then(function() {
		questions.forEach(function(data, index) {
	    promise = promise.then(function() {
	      var question = new Question()
	      
	      question.id = data.id
	      question.set("tag", data.tag)
	      question.set("question", data.question)
	      question.set("index", index)
	      
	      return question.save().then(function() {
		    	return relation.add(question)
	      })
	    })
	  })
	  
	  return promise
	}).then(function() {
		return req.survey.save()
	}).then(function() {
		res.successT({
			next: "/classes/" + req.classroom.id
		})
	}, res.errorT)
}

module.exports.duplicate = function(req, res) {
	var survey = new Survey()
	var relation = survey.relation("questions")
	var query = req.survey.relation("questions").query()
	
	survey.set("name", (req.survey.get("name") + " (copy)"))
	survey.set("class", req.survey.get("class"))
	
	query.each(function(question) {
		var temp = new Question()
		
		temp.set("tag", question.get("tag"))
    temp.set("question", question.get("question"))
    temp.set("index", question.get("index"))
		
		return temp.save().then(function() {
			relation.add(temp)
		})
	}).then(function() {
		return survey.save()
	}).then(function() {
		return res.redirect("/classes/" + req.classroom.id)
	})
}

module.exports.remove = function(req, res) {
	req.survey.set("show", false)

	req.survey.save().then(function() {
		return res.redirect("/classes/" + req.classroom.id)
	})
}

