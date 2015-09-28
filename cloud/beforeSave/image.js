Parse.Cloud.beforeSave("Image", function(req, res) {
  var object = req.object
  
  return Parse.Config.get().then(function(config) {
		var wins = object.get("wins")
		var losses = object.get("losses")
		var votes = object.get("votes")
		var active = object.get("active")
		var maxVotes = object.get("maxVotes")
		var opponents = object.get("opponents")
		var multiplier = config.get("imageMultiplier")
		var score = Math.ceil((opponents + (multiplier * (wins - losses))) / Math.max(votes, 1))
	
		object.set("score", score)
		object.set("active", votes < maxVotes)
		
	  if(!object.isNew()) return res.success()
		
		object.set("votes", 0)
		object.set("maxVotes", config.get("imageMaxVotes"))
		object.set("score", config.get("imageStarter"))
		object.set("wins", 0)
		object.set("losses", 0)
		object.set("opponents", 0)
		
		return res.success()
	})
})
