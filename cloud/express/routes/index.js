module.exports.home = function(req, res) {
  res.renderT('home/notfound')
}

module.exports.support = function(req, res, next) {
	res.renderT('home/notfound')
}

module.exports.notfound = function(req, res) {
  res.renderT('home/notfound')
}

module.exports.terms = function(req, res) {
  Parse.Config.get().then(function(settings) {
  	res.redirect(settings.get("termsUrl"))
  })
}

module.exports.privacy = function(req, res) {
  Parse.Config.get().then(function(settings) {
  	res.redirect(settings.get("privacyUrl"))
  })
}

module.exports.robots = function(req, res) {
  res.set('Content-Type', 'text/plain')
  res.render('seo/robots')
}

module.exports.sitemap = function(req, res) {
  res.set('Content-Type', 'application/xml')
  res.render('seo/sitemap')
}
