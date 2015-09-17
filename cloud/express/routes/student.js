var Question = Parse.Object.extend("Question")
var Answer = Parse.Object.extend("Answer")
var Installation = Parse.Installation

module.exports.success = function(req, res) {
	res.renderT("student/message", {
    success: true
  })
} 

module.exports.error = function(req, res) {
	res.renderT("student/message", {
    success: false
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
    res.redirect("callback://done")
	})
}

module.exports.hasSurvey = function(req, res, next) {
	var query = new Parse.Query(Survey)
		
	query.equalTo("code", req.param("survey").toLowerCase())
	
	query.first(function(survey) {	
		if(!survey) return res.redirect("/surveys")
			
  	req.survey = survey
  	res.locals.survey = survey
    next()
	}, function() {		
    res.redirect("/survey/error")
	})
} 

module.exports.survey = function(req, res) {
	var doneURL = (req.installation) ? "callback://done" : "/surveys/success"
	var errorURL = (req.installation) ? "callback://done" : "/surveys/error"
	
	if(!req.session.surveys)
		req.session.surveys = {}
		
	if(req.survey.id in req.session.surveys)
		return res.redirect(errorURL)
	
	req.survey.get("class").fetch().then(function(classroom) {
		res.locals.classroom = classroom
	}).then(function() {
		var query = req.survey.relation("questions").query()
		
		query.ascending("index")
		return query.find()
	}).then(function(questions) {
		res.renderT("student/index", {
			questions: questions,
			config: {
				survey: req.survey.id,
				questionLength: questions.length,
				bTester: Math.random() < 0.5
			}
		})
	})
} 

module.exports.surveyPOST = function(req, res) {
	var answers = req.param("answers")
	var promise = Parse.Promise.as()
	var doneURL = (req.installation) ? "callback://done" : "/surveys/success"
	var errorURL = (req.installation) ? "callback://done" : "/surveys/error"
	
	if(!req.session.surveys)
		req.session.surveys = {}
		
	if(req.survey.id in req.session.surveys)
		return res.redirect(errorURL)
	
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
	  if(!req.installation) return true;
	  
	  var relation = req.installation.relation("surveys")
	  relation.remove(req.survey)
	  return req.installation.save()
  }).then(function() {			
		req.session.surveys[req.survey.id] = true
				  
	  res.successT({
			next: doneURL
		})
  }, res.errorT)
}
