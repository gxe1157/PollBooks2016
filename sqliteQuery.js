//exports = module.exports = runQuery;
// Evelio Velez Jr.  

var fs = require("fs"); 
var sqlFileName = `${__dirname}/lib/sqlite/csvImport.sqlite`;
var sqlite3 = require('./node_modules/sqlite3').verbose();

module.exports = function(sqlRequest, cbPDF, cbFusionPro, res) {
  // console.log('sqlRequest: ',sqlRequest);

  var fileOutput = '';
  var qStmnt, pStmnt,dataCheck;
  var displayOption = sqlRequest.output;
  var query    = sqlRequest.query;
  var townName = sqlRequest.townName;
  var selectWardDist = sqlRequest.wardDist;
  selectWardDist = " "+selectWardDist+" ";
  var results = selectWardDist.split(',');
  var debug = 1;  

  // console.log('ln: 19  Init params: ',sqlRequest);
  switch(query) {
      case 'allTowns':
          /* List all municipali in alpha order with counts */      
          qStmnt ="SELECT County, Elec_date, Elec_Name, Super_Name, reportSel, MUNICIPALI as muni, count(*)  as total FROM user where muni != 'null' GROUP BY muni ORDER BY muni asc";        
          break;
      case 'byTownName':
          /* List municipali in order ward,district,last,first,address with counts */            
          qStmnt =`SELECT MUNICIPALI as muni,  WARD||' - ' || DISTRICT as wardDist, count(*)  as total FROM user where muni ='${townName}' GROUP BY wardDist ORDER BY wardDist asc`;              
          // console.log('byTownName: ', qStmnt);          
          break;
      case 'byTownNameWardDist':
          /* select by town-Ward-Dist List in order ward, district, last, first, address */
          selectWardDist = selectWardDist.replace(/\s+/g, '');

          if(displayOption === 'printCSV'){
              qStmnt =`SELECT LAST, FIRST,ZIP,PARTY, LAST||',  ' ||FIRST||' '||MIDDLE||' ' || SUFFIX AS FULLNAME,
                           BLD_NO||' ' ||AD1||' ' || APT_STE AS AD,  CITY||', NJ '||ZIP AS CSZ,
                           VOTERID, DATE_BIRTH, PARTY, MUNICIPALI, WARD, DISTRICT, ABB_F, ABB_L,
                           PG_COUNT, PG_OF, TAB_SEP, TAB_TOTAL, ID_REQUIRED, MAIL_IN, STATUS, T_BK_SPLIT,
                           LINE_CTN, County, Elec_date, Elec_Name, Super_Name, reportSel`;

              if( selectWardDist === '00|00'){
                /*select all by town-Ward-Dist */                        
                qStmnt +=` FROM user where MUNICIPALI='${townName}' ORDER BY WARD,DISTRICT,LAST,FIRST,AD1,CAST(BLD_NO AS INTEGER)`;            
                pStmnt =`SELECT MUNICIPALI as muni,  WARD||' - ' || DISTRICT as wardDist, TAB_SEP, count(*)  as total
                          FROM user where muni ='${townName}' GROUP BY wardDist,TAB_SEP ORDER BY wardDist`;

                fileOutput = `${townName}-all`;     

              }else{
                /*select by town-Ward-Dist */            
                var WD = (results[0].replace(/\s+/g, '')).split('|');
                qStmnt +=` FROM user where MUNICIPALI ='${townName}' AND WARD ='${WD[0]}' AND DISTRICT ='${WD[1]}' ORDER BY FULLNAME, AD `;
                pStmnt =`SELECT MUNICIPALI as muni,  WARD||' - ' || DISTRICT as wardDist, TAB_SEP, count(*)  as total
                          FROM user where muni ='${townName}' AND WARD ='${WD[0]}' AND DISTRICT ='${WD[1]}' GROUP BY wardDist,TAB_SEP ORDER BY wardDist`;

                // var qStmnt =`SELECT * FROM user where MUNICIPALI ='${townName}'  AND WARD ='${WD[0]}' AND DISTRICT ='${WD[1]}' ORDER BY LAST,FIRST,AD1,BLD_NO  DESC`; //   LIMIT 5             
                fileOutput = `${townName}-${WD[0]}${WD[1]}`; 

              }

          }else{
              /* outPut = printPDF */
               // 'VOTERID','LAST','FIRST','MIDDLE','SUFFIX',
               // 'BLD_NO','SUF_A','SUF_B','AD1','UNIT',
               // 'CITY','MUNICIPALI','ZIP','DATE_BIRTH','PARTY',
               // 'WARD','DISTRICT','VOTER_STATUS','REG_PROV_BALLOT','County',
               // 'Elec_date', 'Elec_Name', 'Super_Name', 'reportSel' 
               // BLD_NO ||' '|| AD1 ||' '|| UNIT AS AD,
               
              qStmnt =`SELECT LAST, SUFFIX, MIDDLE, FIRST, ZIP, PARTY,
                           BLD_NO ||' '|| AD1 AS AD,
                           PARTY, MUNICIPALI, WARD, DISTRICT,
                           County, Elec_date, Elec_Name, Super_Name, reportSel`;

              if( selectWardDist === '00|00'){
                /*select all by town-Ward-Dist */                        
                qStmnt +=` FROM user where MUNICIPALI='${townName}' ORDER BY  WARD,DISTRICT,AD1,CAST(BLD_NO AS INTEGER),LAST,FIRST`;            
                fileOutput = `${townName}-all`;     

              }else{
                /*select by town-Ward-Dist */            
                var WD = (results[0].replace(/\s+/g, '')).split('|');
                qStmnt +=` FROM user where MUNICIPALI ='${townName}' AND WARD ='${WD[0]}' AND DISTRICT ='${WD[1]}' ORDER BY AD1,CAST(BLD_NO AS INTEGER),LAST,FIRST`;
                fileOutput = `${townName}-${WD[0]}${WD[1]}`; 

              }
          }    
          break;		  
      default:

  }
  // Init sqlite3 
  var db = new sqlite3.Database(sqlFileName);
  var rowData = [];
  var rowLength = 0;

  var start = Date.now();
  console.log("Sqlite Query Start processing....");    

  db.serialize(function() {  

    db.all(qStmnt, function(err, row) {      
      if(err){
        console.log(err);
        return err;
  	  }

      rowData   = row;
      rowLength = row.length;
    });

    if(pStmnt){
      db.all(pStmnt, function(err, row) {      
        if(err){
          console.log(err);
          return err;
        }
        dataCheck = row;
      });
    }

    db.close(function() {
      // Close create PDF 
      // console.log('rowData: ',rowData);
      console.log(displayOption,"Sqlite Query is complete: "+ (Date.now() - start)/1000 + " : sec" + " Total Records: " + rowLength);
      switch(displayOption) {
          case 'printPDF':
            var response = cbPDF(fs, fileOutput.replace(/\s+/g, ''), rowData, dataCheck);
            // console.log('response',response);
            res.send(response);
            break;

          case 'printCSV':
            var response = cbFusionPro(fs, fileOutput.replace(/\s+/g, ''), rowData, dataCheck);
            // console.log('response',response);
            res.send(response);
            break;

          case 'screen':
             console.log('rowData: ', rowData[0]);

            res.render('uploadSuccess', {
              title: 'Poll Book App',
              success: true,                
              rowData : rowData,
              rowLength: rowLength,
              County: rowData[0]['County'],
              Elec_date: rowData[0]['Elec_date'],
              Elec_Name: rowData[0]['Elec_Name'],
              Super_Name: rowData[0]['Super_Name'],
              reportSel: rowData[0]['reportSel']
            });
            break;

          default:
            // returnObj
            res.send(rowData);
      }

    }); // End db.close   

  }); // End db.serialize          

} //runQuery