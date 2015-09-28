Parse.Cloud.beforeSave("Batch", function(req, res) {
  var object = req.object

	object.set("active", !!object.get("active"))

  if(!object.isNew()) return res.success()

	object.set("votes", 0)

  return res.success()
})
