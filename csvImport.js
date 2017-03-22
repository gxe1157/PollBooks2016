//exports = module.exports = runApp;
// Evelio Velez Jr.  Aug 31, 2016

var fs = require("fs"); 
var fileOutput = `${__dirname}/lib/sqlite/csvImport.sqlite`;
var sqlite3 = require('./node_modules/sqlite3').verbose();
var fileImport = './lib/uploads/sendToSql.txt';

module.exports = function (data, res) {
    var delim = data.reportSel ==='Poll Books' ?  `","` : `|`;
    var line = '';
    var flds = ''; 
    var fldLength = 0;

    // fileOutput = /lib/sqlite/csvImport.sqlite
    // Init sqlite3 
    var start = Date.now();    
    var db = new sqlite3.Database(fileOutput);

    // Read csv file 
    var fileContents = fs.readFileSync(fileImport);
    var lines = fileContents.toString().split('\n');

    var importCSV = function(tableSchema, placeHolder){
        // csvToSql
        db.serialize(function() {
        var cnt = 0, showCount = 1000;

        db.run("begin transaction");
            var useTable = 'user';
            db.run("drop table if exists " + useTable);
            db.run("CREATE TABLE user ("+tableSchema+")");  
            var stmt = db.prepare("INSERT INTO user VALUES (" + placeHolder + ")");

            for ( var i = 0; i < lines.length; i++) {
                line = delim === '|' ?  lines[i] : lines[i].slice(1); // remove first char if '"'
                line = line.replace(/"\s*$/, "");
                var flds = line.split(delim);
                
                stmt.run(flds);          

                cnt++;  
                if( cnt === showCount){ 
                  // console.log('cnt: ',cnt,' Name: ', flds[0],delim,fldLength, flds.length,flds);
                   console.log('cnt: ',cnt,' Name: ', flds[0]);
                  showCount = showCount+1000;                  
                     if(showCount === 10000) break;
                }    
            }

        db.run("commit");

        if(data.reportSel ==='Poll Books'){
            db.run("UPDATE user SET PG_COUNT = 'PG_COUNT', TAB_SEP= SUBSTR(LAST,1,1), County ='" + data.County + "', Elec_date = '" + data.Elec_date + "', Elec_Name = '" + data.Elec_Name + "', Super_Name = '" + data.Super_Name + "', reportSel ='" + data.reportSel+"'");  
        }else{        
            db.run("UPDATE user SET County ='" + data.County + "', Elec_date = '" + data.Elec_date + "', Elec_Name = '" + data.Elec_Name + "', Super_Name = '" + data.Super_Name + "', reportSel ='" + data.reportSel+"'");  
        }

        db.close(function() {
          // Close create PDF 
          stmt.finalize();   
          console.log('processing end.......'+cnt);
          console.log("Import Sqlite3 is complete: "+ (Date.now() - start)/1000 + " : sec");
          res.redirect('/town/null/allTowns/screen/null/');
        });   

      });  
    }

    var tableStructure = function(line, callback){
        // Field array of names setup manually
        var  fldNames = [];
               
        if( data.reportSel ==='Poll Books' ){
          fldNames = [ 'LAST','FIRST','MIDDLE','SUFFIX','BLD_NO',
                       'AD1','APT_STE','FILLER1','CITY','ZIP',
                       'FILLER2','VOTERID','DATE_BIRTH','PARTY','STATUS',
                       'ID_REQUIRED','MAIL_IN','MUNICIPALI','DISTRICT','WARD',
                       'ABB_F','ABB_L','TAB_SEP','LINE_CTN','TAB_TOTAL',
                       'PG_COUNT','PG_OF','T_BK_SPLIT','County', 'Elec_date',
                       'Elec_Name', 'Super_Name', 'reportSel' ];
        }else{                  
          fldNames = [ 'VOTERID','LAST','FIRST','MIDDLE','SUFFIX',
                       'BLD_NO','SUF_A','SUF_B','AD1','UNIT',
                       'CITY','MUNICIPALI','ZIP','DATE_BIRTH','PARTY',
                       'WARD','DISTRICT','VOTER_STATUS','REG_PROV_BALLOT','County',
                       'Elec_date', 'Elec_Name', 'Super_Name', 'reportSel' ];
        }

        var tableSchema = '';      
        var fieldType   = '';
        var placeHolder = '';

        line = delim === '|' ?  line : line.slice(1);   // remove first char if '"'
        line = line.replace(/"\s*$/, " ");

        fldLength = fldNames.length;

        for ( var i = 0; i < fldLength; i++) {
          // x = i+1
          fieldType = 'TEXT';
          
          if(i < fldLength-1){
            tableSchema +=  fldNames[i]+' '+fieldType+', ';
            placeHolder += '?,';            
          }else{ 
            tableSchema +=  fldNames[i]+' '+fieldType;            
            placeHolder += '?';                        
          }
        }
        // console.log(tableSchema);
        callback(tableSchema, placeHolder);
    }

    tableStructure(lines[0], importCSV );

}//End runApp

