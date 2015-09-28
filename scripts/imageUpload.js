var fs = require("fs")
var Parse = require("parse/node")
var VoterImage = Parse.Object.extend("Image")
var path = process.argv[2]

Parse.initialize("q1NZZSGYNxaYIQq5dDNkMlD407fmm2Hq6BoXBzu4", "m736Jb7Z8atZGPSfW7eBnrOKwJNyDDSUFmTOVT5G")

fs.readdir(path, function(err, files) {
	if(err) return console.error(err)
	
	files.forEach(function(filePath) {
		if(["jpg", "png"].indexOf(filePath.split(".")[1]) == -1) return
		
		fs.readFile(path + "/" + filePath, function(err, data) {
			var fileData = Array.prototype.slice.call(new Buffer(data), 0)
			var file = new Parse.File("image.png", fileData)
			
			return file.save().then(function() {
				var image = new VoterImage()
				
				image.set("active", true)
				image.set("image", file)
				
				return image.save()
			}).then(function() {
				console.log("Image uploaded: " + filePath)
			}, function(error) {
				console.error(error)
			})
		})
	})
})