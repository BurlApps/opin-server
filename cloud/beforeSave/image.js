Parse.Cloud.beforeSave("Image", function(req, res) {
  var object = req.object

	object.set("active", !!object.get("active"))

  if(!object.isNew()) return res.success()

	object.set("votes", 0)
	object.set("score", 0)
	object.set("good", 0)
	object.set("bad", 0)

  return res.success()
})
