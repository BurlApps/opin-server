var Settings = require("cloud/utils/settings")
var express = require('express')
var app = express()
var random = Math.random().toString(36).slice(2)

// Set Master Key
Parse.Cloud.useMasterKey()

// Routes
var routes = {
  core: require("cloud/express/routes/index"),
  auth: require("cloud/express/routes/auth"),
  classes: require("cloud/express/routes/classes"),
  surveys: require("cloud/express/routes/surveys"),
  students: require("cloud/express/routes/students")
}

// Global app configuration section
app.set('views', 'cloud/express/views')
app.set('view engine', 'ejs')

app.enable('trust proxy')

app.use(express.bodyParser())
app.use(express.cookieParser())
app.use(express.cookieSession({
  secret: 'ursid',
  cookie: {
    httpOnly: true,
    maxAge: 604800000,
    proxy: true
  },
  rolling: true
}))
app.use(express.csrf())
app.use(function(req, res, next) {
  // Success Shorcut
  res.successT = function(data) {
    data = data || {}
    data.success = true
    res.json(data)
  }

  // Error Shorcut
  res.errorT = function(error) {
	  console.error(error)
	  
    if(typeof error != "string")
      error = error.description || error.message || "An error occurred"

    res.json({
      success: false,
      message: error
    })
  }

  // Render Shorcut
  res.renderT = function(template, data) {
    data = data || {}
    data.template = data.template || template
    res.render(template, data)
  }

  // Auth
  req.basicAuth = express.basicAuth
  res.locals.csrf = req.session._csrf

  // Locals
  res.locals.host = req.session.host || ("http://" + req.host)
  res.locals.url = res.locals.host + req.url
  res.locals.path = req.url
  res.locals.user = null
  res.locals.mixpanelToken = req.session.mixpanelToken
  res.locals.random = random
  res.locals.config = {}
  res.locals.support = false

  if(!(req.session.appliedSettings !== true || !req.session.mixpanelToken)) 
  	return next()
  
  Settings().then(function(settings) {
    req.session.appliedSettings = true
    req.session.host = settings.get("host")
    req.session.mixpanelToken = settings.get("mixpanelToken")
    res.locals.host = req.session.host
    res.locals.url = res.locals.host + req.url
    res.locals.account = req.session.account
    res.locals.mixpanelToken = req.session.mixpanelToken
    next()
  })
})

// Landing
app.get('/', routes.auth.loggedIn, routes.auth.register)
app.get('/support', routes.core.support, routes.auth.login)

// Auth
app.get('/login', routes.auth.loggedIn, routes.auth.login)
app.get('/logout', routes.auth.logout)
app.get('/register', routes.auth.loggedIn, routes.auth.register)
app.get('/reset', routes.auth.reset)
app.get('/reset/password', routes.auth.resetPassword)
app.get('/reset/success', routes.auth.resetSuccess)
app.get('/email/success', routes.auth.emailSuccess)
app.get('/auth/router', routes.auth.authRouter)
app.get('/auth/expired', routes.auth.expired)

app.post('/login', routes.auth.loginPOST)
app.post('/register', routes.auth.registerPOST)
app.post('/reset', routes.auth.resetPOST)

// Dashboard
app.get('/classes', routes.auth.restricted, routes.classes.hasClasses, routes.classes.findClass)
app.get('/classes/new', routes.auth.restricted, routes.classes.new)
app.get('/classes/:class', routes.auth.restricted, routes.classes.hasClass, routes.classes.home)
app.get('/classes/:class/new', routes.auth.restricted, routes.classes.hasClass, routes.surveys.new)
app.get('/classes/:class/:survey', routes.auth.restricted, routes.classes.hasClass, routes.surveys.hasSurvey, routes.surveys.view)
app.get('/classes/:class/:survey/edit', routes.auth.restricted, routes.classes.hasClass, routes.surveys.hasSurvey, routes.surveys.edit)
app.get('/classes/:class/:survey/send', routes.auth.restricted, routes.classes.hasClass, routes.surveys.hasSurvey, routes.surveys.send)
app.get('/classes/:class/:survey/duplicate', routes.auth.restricted, routes.classes.hasClass, routes.surveys.hasSurvey, routes.surveys.duplicate)
app.get('/classes/:class/:survey/remove', routes.auth.restricted, routes.classes.hasClass, routes.surveys.hasSurvey, routes.surveys.remove)

app.post('/classes/new', routes.auth.restricted, routes.classes.newPOST)
app.post('/classes/:class/new', routes.auth.restricted, routes.classes.hasClass, routes.surveys.newPOST)
app.post('/classes/:class/:survey/edit', routes.auth.restricted, routes.classes.hasClass, routes.surveys.hasSurvey, routes.surveys.editPOST)

// WebView Survey
app.get('/surveys/success', routes.student.success)
app.get('/surveys/error', routes.student.error)
app.get('/surveys/:survey', routes.student.hasSurvey, routes.student.survey)
app.get('/surveys/:survey/:installation', routes.student.hasInstallation, routes.suveys.hasSurvey, routes.student.survey)

app.post('/surveys/:survey', routes.student.hasSurvey, routes.student.surveyPOST)
app.post('/surveys/:survey/:installation', routes.student.hasInstallation, routes.suveys.hasSurvey, routes.student.surveyPOST)

// Terms & Privacy
app.get('/terms', routes.core.terms)
app.get('/privacy', routes.core.privacy)

// Robots
app.get('/robots', routes.core.robots)
app.get('/robots.txt', routes.core.robots)

// Sitemap
app.get('/sitemap', routes.core.sitemap)
app.get('/sitemap.xml', routes.core.sitemap)

// Not Found Redirect
app.all("*", routes.core.notfound)

// Listen to Parse
app.listen()
