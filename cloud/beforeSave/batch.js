Parse.Cloud.beforeSave("Batch", function(req, res) {
  var object = req.object
  var active = object.get("active")
  var votes = object.get("votes")
  var userVotes = object.get("userVotes")
	var maxVotes = object.get("maxVotes")
	
	if(!object.isNew()) {
		if(votes > maxVotes)
			object.set("votes", maxVotes)
			
		if(userVotes > maxVotes)
			object.set("userVotes", maxVotes)
	
		if(active)
			object.set("active", votes < maxVotes || userVotes < maxVotes)

	  return res.success()
	}

	object.set("votes", 0)
	object.set("userVotes", 0)

  return res.success()
})
