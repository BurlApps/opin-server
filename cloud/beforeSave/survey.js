Parse.Cloud.beforeSave("Survey", function(req, res) {
  var object = req.object

	if(object.get("state") == 1) {
		if(object.get("taken") >= object.get("sent")) {
			object.set("state", 2)
		}
	}

  if(!object.isNew()) return res.success()
  
  object.set("sent", 0)
	object.set("taken", 0)
	object.set("state", 0)
	object.set("show", true)

  return res.success()
})
