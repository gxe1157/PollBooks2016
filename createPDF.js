// exports = module.exports = runPDF;
// Evelio Velez Jr.  Oct 21, 2016 10:36pm

module.exports = function( fs, fileOutput, sqliteData, dataCheck ) {
    // init pdf
    console.log("CreatePDF Start........... ");          
    var pdf = require("pdfkit");
    var options = {'layout':'landscape', 'margin': 0, 'font' : 'Helvetica' };


    // rect(x, y, width, height)
    var box_x = 36;         // move left or right
    var box_y = 36;         // move up or down
    var boxWidth  = 720;
    var boxheight = 90;
    var spacer = 9;
    var moveColumn = 360;

    var start = Date.now();
    var lineCount = 0, pageTotal = 84;    
    var totalRecords = 0;
    var lineData = '';
    var ward = '';
    var district = '';

    var addColumn = true;
    var lineSpace = 4;

    var x_startline = box_x+spacer;
    var y_startline = box_y+boxheight;
    var headerBox = [box_x, box_y, boxWidth, boxheight];  
    var totalPages = Math.ceil(sqliteData.length/pageTotal);

    var y_line = y_startline+lineSpace;
    var x_line = x_startline;

    var objTrenton = {
      11:'TRENTON NORTH',
      12:'TRENTON SOUTH',
      13:'TRENTON EAST',
      14:'TRENTON WEST'
    };

    var arrLinePos = [];
    var checkTheseValues = 0; 
    for(var i = 0; i<13; i++){
      checkTheseValues = checkTheseValues +3;
      arrLinePos.push(checkTheseValues);  
    } 

    var pageCount = 0, recordCounts = 0;

    var pageSetup = function(data){
      // Reset the boxes to top of page
      pageCount++;

      if(data['MUNICIPALI'] === 'TRENTON'){
        data['MUNICIPALI'] = objTrenton[ data.WARD ];
      }

      myDoc.rect(headerBox[0], headerBox[1], headerBox[2], headerBox[3])
          .stroke();

      myDoc.rect(headerBox[0], headerBox[1], headerBox[2], 63)
          .fillColor('black', 0.1)              // This add gray scale
          .fillAndStroke()      
          .fillColor('black', 1 )
          .stroke();

      myDoc.fontSize(12)
           .font('Helvetica')
           .text(`${data['County'].toUpperCase()} REGISTERED VOTERS`, x_startline,  box_y+15,  { width: 720-18, align: 'center'} )
           .text(`STREET LIST`, x_line,  box_y+30,  { width: 720-18, align: 'center'} );

      myDoc.fontSize(10)
           .text(`${data['Super_Name'].toUpperCase()}, COUNTY CLERK`, x_startline,  box_y+15,  { width: 720-18, align: 'left'} )
           .text(`PAGE ${pageCount} of ${totalPages}`, x_startline,  box_y+15,  { width: 720-18, align: 'right'} )           
           .text(`MUNICIPALITY: ${data['MUNICIPALI']}`, x_startline,  box_y+51,  { width: 252-18, align: 'left'} )
           .text(`WARD: ${ data['WARD']}`, x_startline+270,  box_y+51,  { width: 288-18, align: 'left'} )
           .text(`DISTRICT: ${data['DISTRICT']}`, x_startline+414,  box_y+51,  { width: 432-18, align: 'left'} )                     
           .text(`DATE: ${today}`, x_startline+576+18,  box_y+51,  { width: 108, align: 'right'} );

      myDoc.fontSize(9)                                
           .text(`VOTER NAME`, x_startline,  114, { width: 140, align: 'left'} )
           .text(`STREET ADDRESS`, x_startline+180,  114, { width: 120, align: 'left'} );

      myDoc.fontSize(8)                                
           .text(`ZIP CODE`, x_startline+300,  106.3,  { width: 30, align: 'left'} )
           .text(`PTY`, x_startline+332, 115.6);

      myDoc.fontSize(10)                                
           .text(`VOTER NAME`, x_startline+moveColumn,  114, { width: 140, align: 'left'} )
           .text(`STREET ADDRESS`, x_startline+moveColumn+180,  114, { width: 120, align: 'left'} );

      myDoc.fontSize(8)                                           
           .text(`ZIP CODE`, x_startline+moveColumn+300,  106.3,  { width: 30, align: 'left'} )
           .text(`PTY`, x_startline+moveColumn+332, 115.6);


      myDoc.moveTo( 36, 99)                     // this is your starting position of the line, from the left side of the screen 200 and from top 200
           .lineTo(756, 99)                     // this is the end point the line 
           .stroke();        
      myDoc.moveTo( 36, 589.5)                  // this is your starting position of the line, from the left side of the screen 200 and from top 200
           .lineTo(756, 589.5)                  // this is the end point the line 
           .stroke();        

    var vlines = [36, 126, 589.5];  

      myDoc.moveTo( 36, vlines[1] )
           .lineTo( 36, 589.5)
           .stroke();

      myDoc.moveTo( 216, vlines[1] )
           .lineTo( 216, 589.5)
           .stroke();          

      myDoc.moveTo( 342, vlines[1] )
           .lineTo( 342, 589.5)
           .stroke();          

      myDoc.moveTo( 373.5, vlines[1] )
           .lineTo( 373.5, 589.5)
           .stroke();          

      myDoc.moveTo( 396, vlines[1] )
           .lineTo( 396, 589.5)
           .stroke();          
      myDoc.moveTo( 397, vlines[1] )
           .lineTo( 397, 589.5)
           .stroke();                     

      /* 2nd column */
      myDoc.moveTo( 576, vlines[1] )
           .lineTo( 576, 589.5)
           .stroke();          
      myDoc.moveTo( 702, vlines[1] )
           .lineTo( 702, 589.5)
           .stroke();          
      myDoc.moveTo( 733.5, vlines[1] )
           .lineTo( 733.5, 589.5)
           .stroke();          
      myDoc.moveTo( 756, vlines[1] )
           .lineTo( 756, 589.5)
           .stroke();          
    }

    var getToday = function() {
        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        month = (month < 10 ? "0" : "") + month;
        var day  = date.getDate();
        day = (day < 10 ? "0" : "") + day;

        return month + "/" + day + "/" +year;
    }

    var pageLines = function(data, lineCount ){
        var moveDown = 8;
        var middleName = data['MIDDLE'].length == 1 ? data['MIDDLE']+'.' : data['MIDDLE'];
        // console.log(middleName, data['MIDDLE']);  
        var spaceLast  = -1;
        var spaceFirst = 0;

        myDoc.fontSize(7)
           .text(`${data['LAST']} ${data['SUFFIX'].toUpperCase()}`, x_line,  y_line, {characterSpacing: 0} )
           .text(`${data['FIRST']} ${middleName}`, x_line+90,  y_line)
           .text(`${data['AD']}`, x_line+177,  y_line,  {
                                                           width: 115,
                                                           align: 'right'} )
           .text(`${data['ZIP']}`, x_line+302.5,  y_line,  {
                                                           width: 20,
                                                           align: 'center'} )    
           .text(`${data['PARTY'].substr(0, 1)}`, x_line+334,  y_line,  {
                                                           width: 10,
                                                           align: 'center'} );
        
          if( arrLinePos.indexOf(lineCount) != -1  ) {
              myDoc.moveTo( 36, y_line+moveDown)
                 .lineTo(756 , y_line+moveDown)
                 .stroke();        
          }   

    }
    // End init pdf

    //pdfOutput
    var today = getToday();
    var myDoc = new pdf(options);
    myDoc.pipe(fs.createWriteStream(`${__dirname}/lib/pdfout/${fileOutput}.pdf`));

    if(lineCount == 1 ){
        // myDoc.addPage(options);              
        pageSetup(lineData); 
     }

    for( var line in sqliteData ) {
        lineData = sqliteData[line];
        lineCount++;
        totalRecords++; // use this as counter for html page

        if(line == 0 ){
            pageSetup(lineData); 
        }

        if( lineCount > pageTotal ){
            // (ward != lineData['WARD'] || district != lineData['DISTRICT']) ||
            ward    = lineData['WARD'];      
            district= lineData['DISTRICT'];      

            if( lineCount > pageTotal ){
                addColumn = true;
                lineCount = 1;
                y_line = y_startline+lineSpace;                
                x_line = x_startline;                
                // console.log(`x: ${x_line} LN: ${lineCount}  Pg: ${pageCount}: ${lineData['FULLNAME']}, ${lineData['AD']}, ${lineData['CSZ']} `);                            
            }
  
            // fill in blank spaces if needed
            myDoc.addPage(options);              
            pageSetup(lineData);  
            // console.log(`Page: ${pageCount}: ${lineData['FULLNAME']}  Box: ${lineCount} `);            
        }

        if( lineCount > pageTotal/2 && addColumn === true ){
            addColumn = false;
            y_line = y_startline+lineSpace;
            x_line = x_startline+moveColumn;
            // console.log(`x: ${x_line} LN: ${lineCount}  Pg: ${pageCount}: ${lineData['FULLNAME']}`);                            
        }
 
        // write to pdf
        pageLines(lineData, lineCount);             
        y_line = y_line+11;

      // console.log(`Page: ${pageCount}: ${lineData['FULLNAME']}  Box: ${lineCount} `);
    } // endfor sqliteData 

    // Close create PDF 
    myDoc.end();
    return 'Completed..';         
    console.log("CreatePDF is complete: "+ (Date.now() - start)/1000 + " : sec" + "   Total Records: " + totalRecords);      

} // End module.exports
