
var fs = require("fs"); 
var pdf = require("pdfkit");
var options = {'layout':'landscape', 'margin': 0, 'font' : 'Helvetica' };

console.log("CreatePDF Start........... ");          
var myDoc = new pdf(options);
myDoc.pipe(fs.createWriteStream(`${__dirname}/lib/pdfout/testSpace.pdf`));


myDoc.moveDown();
myDoc.moveDown();
myDoc.moveDown();

myDoc.fontSize(9)                                
   .text('FAYDHERBEDEMAUDAVEJOHNSTON', { width: 200, align: 'left' } );

myDoc.moveDown();

myDoc.fontSize(9)                                
   .text('FAYDHERBEDEMAUDAVEJOHNSTON', { width: 200, align: 'left', characterSpacing: -.05} );

myDoc.fontSize(9)                                
   .text('FAYDHERBEDEMAUDAVEJOHNSTON', { width: 200, align: 'left', characterSpacing: -1} );

myDoc.fontSize(9)                                
   .text('FAYDHERBEDEMAUDAVEJOHNSTON', { width: 200, align: 'left', characterSpacing: -1.5} );

myDoc.fontSize(9)                                
   .text('FAYDHERBEDEMAUDAVEJOHNSTON', { width: 200, align: 'left', characterSpacing: -2} );



// Close create PDF 
myDoc.end();