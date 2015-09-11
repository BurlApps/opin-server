var Class = Parse.Object.extend("Class")

module.exports.hasClasses = function(req, res, next) {
	var relation = req.user.relation("classes")

  relation.query().find(function(classes) {
    if(classes.length == 0)  
    	return res.redirect('/classes/new')
    
    req.user.classes = classes
    next()
  })
}

module.exports.home = function(req, res) {
  res.renderT('dashboard/index', {
    classes: req.user.classes
  })
}

module.exports.new = function(req, res) {
  res.renderT('dashboard/new')
}

module.exports.newPOST = function(req, res) {
	var classroom = new Class()
	var relation = req.user.relation("classes")
	
	classroom.set("name", req.param("name"))
	
	classroom.save(function() {		
		relation.add(classroom)
		return req.user.save()
	}).then(function() {
		res.successT({
			next: "/classes"
		})
	}, res.errorT)
}
