var User = Parse.User
var Settings = require("cloud/utils/settings")

module.exports.restricted = function(req, res, next) {
	if(req.session.user) {
  	var user = new User()

  	user.id = req.session.user
  	user.fetch().then(function() {
    	req.user = user
    	res.locals.user = user
      next()
  	}, function() {
    	req.session = null
      res.redirect("/login?next=" + req.url)
  	})
	} else if(req.xhr) {
		res.errorT("Login required :(")
	} else {
  	req.session = null
		res.redirect("/login?next=" + req.url)
	}
}

module.exports.loggedIn = function(req, res, next) {	
	if(req.session.user) {
  	return res.redirect("/classes")
	}

	next()
}

module.exports.login = function(req, res) {
  res.renderT('auth/login', {
    next: req.param("next"),
    remember: req.cookies.remember || ""
  })
}

module.exports.logout = function(req, res) {
  req.session = null
  res.redirect("/")
}

module.exports.register = function(req, res) {
  res.renderT('auth/register')
}

module.exports.reset = function(req, res) {
  res.renderT('auth/reset')
}

module.exports.resetPassword = function(req, res) {
  if(req.param("token") == null) {
    return res.redirect("/")
  }

  res.renderT('auth/resetPassword', {
    appID: req.param("id"),
    token: req.param("token"),
    username: req.param("username")
  })
}

module.exports.resetSuccess = function(req, res) {
  res.renderT('auth/resetSuccess')
}

module.exports.emailSuccess = function(req, res) {
  res.renderT('auth/emailSuccess')
}

module.exports.authRouter = function(req, res) {
  res.redirect("https://www.parse.com" + req.param("link") + "?" + req.originalUrl.split("?")[1])
}

module.exports.expired = function(req, res) {
  res.renderT('auth/expired')
}

module.exports.loginPOST = function(req, res) {
  Parse.User.logIn(req.param("email"), req.param("password"), {
	  success: function(user) {
  	  if(!user) {
    	  return res.errorT("Invalid credentials :(")
  	  }

      if(req.param("remember") == "true") {
        res.cookie('remember', user.get("email"), {
          maxAge: 900000,
          httpOnly: 604800000
        })
      } else {
        res.clearCookie('remember')
      }

  	  req.session.user = user.id

  	  res.successT({
        user: user.id,
        name: user.get("name"),
        email: user.get("email"),
		  	next: req.param("next") || "/classes"
	  	})
	  },
	  error: function(user, error) {
      res.errorT("Invalid credentials :(")
	  }
	})
}

module.exports.registerPOST = function(req, res) {
  var user = new User()
  user.set("username", req.param("email"))
  user.set("password", req.param("password"))
  user.set("email", req.param("email"))
  user.set("name", req.param("name"))

  user.signUp(null, {
    success: function(user) {
  	  if(!user) {
    	  return res.errorT("Something Went Wrong :(")
  	  }

  	  req.session.user = user.id

  	  res.successT({
        user: user.id,
        name: user.get("name"),
        email: user.get("email"),
		  	next: req.param("next") || "/classes"
	  	})
	  },
	  error: function(user, error) {
  	  var message = "Something Went Wrong :("

  	  if(error.code == 202) {
    	  message = "Email Already Used :("
  	  }

      res.errorT(message)
	  }
  })
}

module.exports.resetPOST = function(req, res) {
  Parse.User.requestPasswordReset(req.param("email"), {
    success: function() {
      res.successT({
        message: "Email Sent!",
		  	next: "/",
		  	delay: 5000
	  	})
    },
    error: function(error) {
      var message = "Something Went Wrong :("

  	  if(error.code == 125) {
    	  message = "Email Not Found :("
  	  }

      res.errorT(message)
    }
  })
}
