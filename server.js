// Evelio Velez Jr.  Nov 6, 2016

//Server dependencies
var express = require('express');
var session = require('express-session');
var sess;
var path = require('path');
var bodyParser = require('body-parser');
var hbs = require('express-handlebars');
var routes = require('./routes');

// Init vars
var app = express();
var http = require('http').Server(app);

var PORT = process.env.PORT || 3000;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))
// parse application/json
app.use(bodyParser.json())

function ensureAuthenticated(req, res, next){
	// console.log('body:',req.body, 'params: ',req.params);	
	// dbf lookup goes here
	var userName = req.body.user_name;
	var pw = req.body.password;
	sess = req.session;
	sess.sessdata = {};
	sess.sessdata.email = userName;
	sess.sessdata.pass = pw;
	sess.sessdata.isAuthenticated = false;	

	if ( userName == 'evelio@mailers.com' &&  pw == 'pw' ){
		sess.sessdata.isAuthenticated = true;
		sess.save(function(err) {
			if(err) throw 'Error saving session';
		})
		return next();		
	}else{
	    console.log("Error!");
		res.redirect('/');		
	}
}

function isAuthenticated(req, res, next){
	console.log('isAuthenticated: ... ',sess.sessdata.isAuthenticated);
	if( sess.sessdata.isAuthenticated )
    	return next();
    else
    	res.redirect('/logout');
}


app.use(session({
	secret: 'test session',
	resave: false,
	saveUninitialized: true
}));


// View engine setup and static assets from the public folder
// app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', hbs({extname: 'hbs', defaultLayout:'layout', layoutsDir: __dirname + '/views/layouts/'}));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));


// Routes
app.get('/', routes.login);

app.post('/home', ensureAuthenticated, routes.home);

app.get('/appPage',isAuthenticated, routes.appPage);

app.get('/logout', routes.logOut);

app.post('/upload', isAuthenticated, routes.uploadData);

app.get('/importSql/:County/:Elec_date/:Elec_Name/:Super_Name/:reportSel?', isAuthenticated, routes.sql);

app.get('/town/:townName/:query/:output/:wardDist?', isAuthenticated, routes.runQuery);

app.get('*', routes.notFound);

app.listen(PORT, function() {
    console.log('Server listening on ' + PORT);
});
