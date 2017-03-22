//Evelio Velez Jr. 9.10.16
var destroySess = function(sess, fnName){
	sess.destroy( function(err) {
		if(err){
			 throw 'Error destroying session';
		}
	})

	setTimeout(function(sess) {
		console.log('===============================================');
		if (typeof sess != "undefined") {
			console.log('sessionIndex: ', sess.sessdata );	
		}else{
			console.log('Session Status: ','Closed....');				
		}

		console.log('===============================================');		
	}, 1000 );

}

exports.login = function(req,res){
	sess = req.session;
	destroySess(sess, 'login');

    res.render('loginPage', {
    	title: 'Poll Book App - Login Page'
    });
};

exports.home = function(req,res){
    res.render('uploadForm', {
    	title: 'Poll Book App',
	   	userLoggedIn : 'user_name'
    });
};

exports.logOut = function(req,res){
	sess = req.session;
	destroySess(sess, 'logout');

    res.render('loginPage', {
    	title: 'Poll Book App - Login Page'
    });
}

exports.appPage = function(req,res){
	sess = req.session;
    res.render('uploadForm', {
    	title: 'Poll Book App: ',
	   	success: false
    });
};

// Main Page
exports.uploadData = function(req,res){
	var fs = require("fs");	
	var multer = require('multer');	
	var storage =   multer.diskStorage({
	  destination: function (req, file, callback) {
	    callback(null, './lib/uploads');
	  },
	  filename: function (req, file, callback) {
	    // callback(null, file.originalname);
	    // changed orinal name to sendToSql.txt to insure we import right file.
	    callback(null, 'sendToSql.txt');	    
	  }
	});

	var upload = multer({ storage : storage}).single('csvFile');
    upload(req,res,function(err) {
        if(err) {
            return res.end("Error uploading file. ");
        }

		 // console.log('body:',req.body, req.params);
      	res.redirect('/importSql/'+req.body.County+'/'+req.body.Elec_date+'/'+req.body.Elec_Name+'/'+req.body.Super_Name+'/'+req.body.reportSel);
	});
};

exports.sql = function(req,res){
	// console.log('sql: ', req.params);
    var csvImport = require('../csvImport'); 
	var data = ({ County    : req.params.County,
				  Elec_date : req.params.Elec_date,
				  Elec_Name : req.params.Elec_Name,
				  Super_Name: req.params.Super_Name,
				  reportSel : req.params.reportSel
	})

    // Import then re-direct to runQuery
    csvImport(data, res);
};

exports.runQuery = function(req, res) {
    var createPDF = require('../createPDF');     
    var createFusionPro = require('../createFusionPro');     

	var data = ({ townName	: req.params.townName,
	               query 	: req.params.query,
	               output	: req.params.output,
	               wardDist : req.params.wardDist
                });

    var myQuery   = require('../sqliteQuery');
    // Run Query then re-direct to output    
    myQuery(data, createPDF, createFusionPro, res);    
};

// Route for all other page requests
exports.notFound = function(req, res) {
	res.end("Page not found............... ");
};