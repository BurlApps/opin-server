var Survey = Parse.Object.extend("Survey")
var Question = Parse.Object.extend("Question")
var Answer = Parse.Object.extend("Answer")
var Installation = Parse.Installation

module.exports.hasSurvey = function(req, res, next) {
	var survey = new Survey()
		
	survey.id = req.param("survey")
	
	survey.fetch().then(function() {		
  	req.survey = survey
  	res.locals.survey = survey
    next()
	}, function() {
    res.redirect("/classes")
	})
}

module.exports.hasInstallation = function(req, res, next) {
	var installation = new Installation()
		
	installation.id = req.param("installation")
	
	installation.fetch().then(function() {
  	req.installation = installation
  	res.locals.installation = installation
    next()
	}, function(error) {
    res.renderT("home/notfound")
	})
}

module.exports.new = function(req, res) {
  res.renderT('dashboard/surveys/index', {
	  mode: "create",
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
		
	questions.forEach(function(data) {
    promise = promise.then(function() {
      var question = new Question()
      
      question.set("tag", data.tag)
      question.set("question", data.question)
      
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
		res.redirect("/classes/" + req.classroom.id)
	})
}

module.exports.view = function(req, res) {
  if(req.survey.get("state") == 0)
		return res.redirect("/classes/" + req.classroom.id + "/" + req.survey.id + "/edit")
	
	
	var query = req.survey.relation("questions").query()
	
	query.descending("good")
	
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
		
	questions.forEach(function(data) {
    promise = promise.then(function() {
      var question = new Question()
      
      question.id = data.id
      question.set("tag", data.tag)
      question.set("question", data.question)
      
      return question.save().then(function() {
	    	return relation.add(question)
      })
    })
  })
	  
	promise.then(function() {
		return req.survey.save()
	}).then(function() {
		res.successT({
			next: "/classes/" + req.classroom.id
		})
	}, res.errorT)
}

module.exports.student = function(req, res) {
	if(req.survey.get("state") == 2)
		return res.redirect("callback://done")
	
	req.survey.get("class").fetch().then(function(classroom) {
		res.locals.classroom = classroom
	}).then(function() {
		var query = req.survey.relation("questions").query()
		return query.find()
	}).then(function(questions) {
		res.renderT("student/index", {
			questions: questions
		})
	})
} 

module.exports.studentPOST = function(req, res) {
	if(req.survey.get("state") == 2)
		return res.successT({
			next: "callback://done"
		})
	
	var relation = req.installation.relation("surveys")
	var answers = req.param("answers")
	var promise = Parse.Promise.as()
		
	answers.forEach(function(data) {
    promise = promise.then(function() {
	    var question = new Question()
	    var answer = new Answer()
	    var score = parseInt(data.score)
	    
	    question.id = data.question
      
      answer.set("question", question)
      answer.set("student", req.installation)
      answer.set("score", score)
      
      return answer.save().then(function() {
	    	question.increment(score == 1 ? "good" : "bad")
	    	return question.save()
      })
    })
  })
  
  promise.then(function() {
	  req.survey.increment("taken")
	  req.survey.save()
  }).then(function() {
	  relation.remove(req.survey)
	  return req.installation.save()
  }).then(function() {
	  res.successT({
			next: "callback://done"
		})
  }, res.errorT)
}