Parse.Cloud.beforeSave("Batch", function(req, res) {
  var object = req.object
  var active = object.get("active")
  var votes = object.get("votes")
	var maxVotes = object.get("maxVotes")

	if(active)
		object.set("active", votes < maxVotes)

  if(!object.isNew()) return res.success()

	object.set("votes", 0)

  return res.success()
})
