Parse.Cloud.afterSave("Class", function(req, res) {
  var object = req.object
  
  if(object.existed()) return

  object.set("code", object.id.toLowerCase())
  object.save()
})