/* Import env */
require('dotenv').config()

/* Make the webserver */
var express = require('express')
var app = express()
var server = require('http').createServer(app)

/* Import socket(s) */
var socket = require('socket.io')
var io = socket(server)

/* Quick! Look over there :eyes: */
var quick = new (require('./Helpers/quick.db'))()

/* Import passport(s) and configure them */
var passport = require('passport')
var passlocal = require('passport-local')
var session = require('express-session')

passport.serializeUser((user, done) => done(null, user))
passport.deserializeUser((user, done) => done(null, user))

passport.use(new passlocal.Strategy(async (username, password, done) => {
  console.log(quick.all())
  var user = await quick.verifyUser(username, password)
  if (user.stack) return done(null, false, { message: user.message })
  else return done(null, user.data)
}))

app.use(session({ secret: 'keyboard cat uwu', saveUninitialized: false, resave: false }))
app.use(passport.initialize())
app.use(passport.session())

/* Configure */
app.use(express.static('./node_modules'))
app.use(express.static('./views'))
app.use(require('body-parser').urlencoded({ extended: false }))
app.set('view engine', 'ejs')
app.use(require('connect-flash')())

/** Route Time **/

/* / */
app.get('/', async (req, res) => {
  return res.render('home/index', { req })
})

/* /register */
app.get('/register', async (req, res) => {
  return res.render('signup/index', { req })
})

/* /login */
app.get('/login', (req, res) => {
  return res.render('signin/index', { req, messages: req.flash('error') })
})

/* [post] /auth/login */
app.post('/auth/login', passport.authenticate('local', { failureRedirect: '/login', failureFlash: true, failWithError: true }), (req, res) => {
  return res.redirect('/chatrooms')
})

/* [post] /auth/register */
app.post('/auth/register', async (req, res) => {
  var user
  try {
    user = await quick.createUser(req.body.username, req.body.password)
  } catch (error) {
    return res.redirect('/register?msg=' + error.stack + '&type=error')
  }
  console.log(user)
  return res.redirect('/login?msg=Your account has been created successfully!&type=info')
})

/* Manage Socket Events */
io.on('connection', socket => {
  socket.on('disconnect', () => console.log(`Socket ${socket.id} disconnected.`))
})

/* Open your fucking ears */
server.listen(process.env.PORT, () => console.log('I\'m not listening...'))
