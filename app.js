const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const expressValidator = require('express-validator')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('passport')
const cfg = require('./cfg/database')

// Init db
mongoose.connect(cfg.database)
let db = mongoose.connection

//Check connection
db.once('open',function(){
  console.log('Connected to MongoDB')
})

//Check db errors
db.on('error',function(err){
  console.log(err)
})

//Init app
const app = express()

//Model
let Article = require('./models/article')

//Load view engine
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

//Parse app urlencoded
app.use(bodyParser.urlencoded({extended: false}))
//Parse app json
app.use(bodyParser.json())

//Public folder
app.use(express.static(path.join(__dirname, 'public')))

//Express session middleware
app.use(session({
  secret:'keybaord cat',
  resave: true,
  saveUninitialized: true
}))

//Express messages middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})

//Express validator middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value){
    var namespace = param.split('.')
    , root = namespace.shift()
    , formParam = root

  while (namespace.length) {
    formParam += '[' + namespace.shift() + ']'
  }
  return{
    param : formParam,
    msg : msg,
    value : value
  }
  }
}))

//Passport cfg
require('./cfg/passport')(passport)

//Passport middleware
app.use(passport.initialize())
app.use(passport.session())

app.get('*',function(req, res,next){
  res.locals.user = req.user || null
  next()
})

//Home route
app.get('/',function(req, res) {
  Article.find({}, function(err, articles){
    if(err){
      console.log(err)
    }
    else {
      res.render('index', {
        title:'Hello',
        articles: articles
      })
    }
  })
})

//Route files
let articles = require('./routes/articles')
let users = require('./routes/users')
app.use('/articles',articles)
app.use('/users',users)

//Start
app.listen(3000, function(){
  console.log('Server on port 3000...')
})
