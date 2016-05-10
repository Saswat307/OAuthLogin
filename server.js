/**
 * Created by lenovo on 5/5/2016.
 */
var express=require('express');
var app=express();

var PORT=8080;
var morgan=require('morgan');
var cookieParser=require('cookie-parser');
var bodyParser=require('body-parser');
var session=require('express-session');
var passport = require('passport');
var flash = require('connect-flash');
const MongoStore = require('connect-mongo')(session);

var mongoose=require('mongoose');
var configDB=require('./config/database.js');

mongoose.connect(configDB.url);


app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended:true }));
app.use(session({
    secret:'superduper',
    saveUninitialized:true,
    resave:true,
    store: new MongoStore({ mongooseConnection: mongoose.connection,
                            ttl:2 * 60 * 60})
    }));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

app.set('view engine','ejs');

require('./config/passport')(passport);


/*
app.use('/',function(req,res){
    res.send("Our first express project");
    console.log(req.cookies);
    console.log("====================");
    console.log(req.session);
});
*/

var api=express.Router();
require('./router/api.js')(api,passport);
app.use('/api',api);

var auth=express.Router();
require('./router/auth.js')(auth,passport);
app.use('/auth',auth);

var secure=express.Router();
require('./router/secure.js')(secure,passport);
app.use('/',secure);





//require('./router/routes.js')(app,passport);


app.listen(PORT);

console.log("Application is running in PORT no. "+PORT);

