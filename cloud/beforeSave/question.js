Parse.Cloud.beforeSave("Question", function(req, res) {
  var object = req.object

  if(!object.isNew()) return res.success()
  
  object.set("good", 0)
  object.set("bad", 0)

  return res.success()
})
