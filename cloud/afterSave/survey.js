Parse.Cloud.afterSave("Survey", function(req, res) {
  var object = req.object
  
  if(object.existed()) return
  
  var code = object.id.toLowerCase().match(/[a-zA-Z]+/g).join("").slice(0,5)

  object.set("code", code)
  object.save()
})