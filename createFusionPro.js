// exports = module.exports;
// Evelio Velez Jr.  Oct 21 2016 10:47pm

module.exports = function(fs, fileOutput, sqliteData, dataCheck) {

    var start = Date.now();
    var arr_pageTabs = []; //['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']; 26 letters
    var dataError  = [];
    var arrFields = [];
    for(var i = 0; i<28; i++){
      arrFields.push('null');  
    } 
      
    var recordsPerPage = 0; // records per page
    var sqlTabTotal = 0;
    var totalPageNo = 0;
    var fillBlancs = 0;
    var WD ='';
    var writeRecordCount = 1;
    var emptyPages = 0;
    var howManyInfoBoxes = 5;
    var sqlData = '';
    var nextLtr = '';
    var compare = '';
    var newBook = 0;

    var dd = function(){
            process.exit(1);
    }

    var nextTab = function(compare, recsPerPage, fillBlancs){
        do {
            /* print remaining names then add blanks */
            if( fillBlancs ){
                var addBlankPages = howManyInfoBoxes - recsPerPage;
                if(addBlankPages) addBlancs(addBlankPages, recsPerPage);
            }

            /* get the next Letter in array */            
            updateTabArray();

            /* Reset in case of more than one loop */
            recsPerPage = 0;             

        }
        while ( compare != arr_pageTabs[0] );
    } 

    var initTabArray = function() {
        arr_pageTabs = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
    }

    var updateTabArray = function() {
        /* Count tab shifts to to reset for new book */
        // newBook++;
        // if( newBook >= 25 ){
        //     console.log('Ltr: ',arr_pageTabs[0]);
        //     newBook = 0;
        //     totalPageNo = 0;
        // }

        /* get the next Letter in array */            
        nextLtr = arr_pageTabs[0];
        arr_pageTabs.push(nextLtr);
        arr_pageTabs.shift();
    }


    var addBlancs = function(addBlankPages, recsPerPage){
        var blankFields = '';

        for( var i = 0; i < addBlankPages;  i++){
            recsPerPage++;
            /* Setup csv header line with info */
            if( recsPerPage == 1 ){
                /* Do not count empty pages as totalPageNo */
                emptyPages++;

                /* Use this only if you want to count empty pages as part of totalPageNo */
                // totalPageNo++;    
                // arrFields[15] = totalPageNo;                                         
            }    
            arrFields[16] = arr_pageTabs[0];
            arrFields[22] = recsPerPage;                        
            blankFields = Array(arrFields).join(",");
            file.write( blankFields+'\n' );    
            writeRecordCount++;            
         } 
    }

    var writeToFile = function(recsPerPage){
		/* build output line in CSV format   */
		var stdOut ='"';
		sqlData = sqliteData[line];

        if( recsPerPage == 1 ){
            totalPageNo++;                
            sqlData['PG_OF'] = totalPageNo; 
        }else{
            sqlData['PG_OF'] = '';//recsPerPage; 
        }

		for( var oline in sqlData ){
			 stdOut +=sqlData[oline]+'","';    
		}
        
		/* Replace "," with \n */
		stdOut = stdOut.replace(/","\s*$/, "\"\n");
		file.write(stdOut);
        writeRecordCount++;
    }

    var csvHeader = function(){
        sqlData = sqliteData[0];
        var header = Object.keys(sqlData).join();
        file.write( header+'\n');
        return header;
    }
	
	var newPageInfo = function(LastNameUpdate){
		/* New page */
        recordsPerPage = recordsPerPage < 0 ? 0 : recordsPerPage;
        var firstNameUpdate = line - recordsPerPage;
        WD = sqliteData[firstNameUpdate].WARD+' - '+sqliteData[firstNameUpdate].DISTRICT;

		sqliteData[firstNameUpdate].ABB_F = sqliteData[firstNameUpdate].LAST.substr(0,3).toUpperCase();
		sqliteData[firstNameUpdate].ABB_L = sqliteData[LastNameUpdate].LAST.substr(0,3).toUpperCase();   
    }

    var dataCheckProof = function( TabTotal,  WD ){
        /* obj - dataCheck from sqlite3 query */
        var dataCtn = dataCheck.length;

        for( i = 0; i < dataCtn; i++){
            if( dataCheck[i].TAB_SEP === arr_pageTabs[0] && WD === dataCheck[i].wardDist ){
                dataCheck[i].appTabTotal = TabTotal;
                break;
            }    
        }
    }

    var verifyDataImport = function(){
        var dataCtn = dataCheck.length;
        var appTotalRec = 0;
        var errDescript ='';
        var sqlTotalRecs = sqliteData.length;

        /* Compare dataCheck[i].total from sql query with dataCheck[i].appTabTotal assigned by app  */
        for( i = 0; i < dataCtn; i++){
            appTotalRec  += dataCheck[i].appTabTotal;
            if( dataCheck[i].total !== dataCheck[i].appTabTotal ){
                console.log('Error .... dataCheck');
                errDescript = `${i} - wardDist: ${dataCheck[i].wardDist} Letter ${dataCheck[i].TAB_SEP} failed. sqlTotal: ${dataCheck[i].total} not equal to apptotal: ${dataCheck[i].appTabTotal}`;
                dataError.push(errDescript);       
                errDescript ='';                
            }    
        }

        /* Compare  totalPageNo written to Total pages assigned by app */
        writeRecordCount--; // Adjust for header line 
        var totalPages = writeRecordCount / howManyInfoBoxes;
        if( (totalPageNo+emptyPages) !== totalPages ) {
            errDescript = `Total Records [ ${writeRecordCount} ]. The page count written [ ${totalPages} ] does not match appication page count [ ${totalPageNo} ]!... Abort program..... `;
            dataError.push(errDescript);       
        }

        /* Compare sqlTotalRecs with appTotalRec app assigned counts */
        if( appTotalRec !== sqlTotalRecs ) {
            errDescript = `The data file count [ ${sqlTotalRecs} ] does not match appication running count [ ${appTotalRec} ]!... Abort program..... `;
            dataError.push(errDescript);       
        }
        // console.log(dataCheck);        
    }
    
	
    /*  Main App Code  */	
    initTabArray();

    var file = fs.createWriteStream(`${__dirname}/lib/${fileOutput}.csv`);
    file.on('error', function(err) { /* error handling */
        console.log('ln: 113','Problem with opening file: ',`${__dirname}/lib/${fileOutput}.csv`);
    });

    file.end();

    /* Proof Check Data Output */
        verifyDataImport();
        if( dataError.length !== 0 ){
                console.log( 'dataError: ', dataError );            
                // return 'Failed...'+ totalPageNo;
        }            
    /* Proof Check Data Output */


    /* Write final output file for Fusion Pro */   
    const readline = require('readline');
    var lineCtn  = 0;
    var csvFinal = '';
    var Header   = [];

    var rl = readline.createInterface({
        input: fs.createReadStream(`${__dirname}/lib/${fileOutput}.csv`),
        output: process.stdout,
        terminal: false
    });

    fd = fs.openSync(`${__dirname}/lib/${fileOutput}final.csv`, 'w');
    rl.on('line', function(line) {
        if( Header.length === 0 ){
            /* Builder header line for csv file */
            var sqlDataKeys = Object.keys( sqliteData[0] );

            for(var i=0; i < howManyInfoBoxes; i++ ){
                var DataKeys = sqlDataKeys.map( function(item, index){  return item+(i+1) } );
                /* Add DataKeys array to Header array */
                Header.push(DataKeys);
            }

            /* Convert array to string */
            Header = Header.join();
            fs.write(fd, Header+'\n'); 
        }else{
    		lineCtn++;
    		csvFinal += line+',';
    		if(lineCtn >= howManyInfoBoxes ){
    		   lineCtn = 0; 
    		   csvFinal = csvFinal.replace(/PG_COUNT/gi, totalPageNo );
               csvFinal = csvFinal.replace(/null/gi,'');          
    		   fs.write(fd, csvFinal+"\n"); 
    		   csvFinal ='';      
    		}
        }    
    })

    .on('close', function() {
        // fs.closeSync(fd);
        console.log('File is written................');
    });
    process.stdin.destroy();
    return 'Completed..';       

} // End module.exports
