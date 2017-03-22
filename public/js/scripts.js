
// onload = function() {
//     alert('loaded');
// }

// var chkBoxAll = function ( obj ){
//     if(obj.id === 'chkOpt'){
//         var length = muniObj.totalRec;
//         var opt = document.getElementById(obj.id).checked;
//         for (var i = 0; i < length; i++){
//              document.getElementById('chkBx'+i).checked = opt;
//         }
//     }
// }   

var chkBox = function ( obj ){
    chkBoxClear();
    document.getElementById(obj.id).checked = true;
}

var chkBoxClear = function(){
    var length = muniObj.totalRec;    
    for (var i = 0; i < length+1; i++){
        document.getElementById('chkBx'+i).checked = false;
    }
}   

var pageReload = function(){
    window.location.reload();
}


var sendToPrint = function ( obj ){
        var str = '';
        var  arrWardDist = [];    	
        var length = muniObj.totalRec;
        var respLine = '';
        for (var i = 0; i < length+1; i++){
            if(document.getElementById('chkBx'+i).checked){
                str = (document.getElementById('chkBx'+i).value).replace(/\s+/g, '').replace(/-/g , "|");
                // "00|00" represent select all records for output
                str.length === 0 ? arrWardDist.push( "00|00" ) : arrWardDist.push( str );
                respLine = 'respLine'+i; 
             }    
        }

        if (str.length === 0 && arrWardDist.length === 0){
            alert('Please select a check box to print...');
            return false;
        }

    	console.log('Statement: \n', arrWardDist);

        /* If you change the property names then update sqliteQuery.js and server.js */
        var townName = muniObj.muni;
        var query    = 'byTownNameWardDist';
        var outPut = document.getElementById('reportSel').value === 'Poll Books'? 'printCSV' : 'printPDF';
        var mess = outPut === 'printCSV' ? 'Poll Books' : 'Poll Sheets';
 
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
              // document.getElementById("townDetails").innerHTML = this.responseText;
              // document.getElementById(respLine).style.background = "yellow";              
              document.getElementById(respLine).style.color = "red";
              document.getElementById(respLine).innerHTML = this.responseText; //this.responseText;
              document.getElementById('Cancel').innerHTML = ' Done ';
            }
        };
        xhttp.open("GET", '/town/'+townName+'/'+query+'/'+outPut+'/'+arrWardDist, true);
        xhttp.send();
}    


$(function() {
    // GET/Town listings
    $('a').on('click', function() {
        var townName = $(this).attr('id');
        var _href = $(this).attr('href');
        var result = _href.split("-");
        var lineId = 'twn'+result[2];

        for(var x = 0; x < result[1]; x++){
           document.getElementById('twn'+x).style.background = "#fff";
            if(result[2] == x){
                document.getElementById(lineId).style.background = "#8FAEB3";
            }
        }        

        var query  = 'byTownName';
        var outPut = 'returnObj';

        $.ajax({
            url: '/town/'+townName+'/'+query+'/'+outPut,
            contentType: 'application/json',
            success: function(response) {
                muniObj = {
                    muni    : response[0].muni,
                    totalRec : response.length
                };
                var chkbx = '', respLine = '', TotalCount = 0;
                var showData = `<form name="pdfOut" id="pdfOut" >`;
                var showData = `<table name="townList" width="425px" cellpadding="5px;" border="0" bordercolor="red" >`;
                showData += `<tr><td>&nbsp;</td><td colspan="3"><b>${response[0].muni}</b></td></tr>`;

                for (var i = 0; i < response.length; i++) {
                   chkBx    = 'chkBx'+i;
                   respLine  = 'respLine'+i;
                   showData +=`<tr><td width="7%"><input name="${chkBx}" id="${chkBx}" value="${response[i].wardDist}" type="checkbox" onClick="Javascript: chkBox( this );"></td>`;
                   showData +=`<td width="50%">Ward-Dist: ${response[i].wardDist}</td><td align="right" width="18%">${response[i].total}</td><td align="center" id="${respLine}">&nbsp;</td></tr>`;
                   TotalCount = TotalCount+response[i].total;
                }
                chkBx    = 'chkBx'+i;
                respLine  = 'respLine'+i;                
                showData += `<tr><td><input name="${chkBx}" id="${chkBx}" value="" type="checkbox" onClick="Javascript: chkBox( this );"><td >All Wards and Districts:</td><td align="right">${TotalCount}</td><td align="center" id="${respLine}">&nbsp;</td></tr>`;                
                showData +=`</table>`;
                showData +=`<hr/><button id='sendToPdf' onClick="sendToPrint( this )">Run Report</button> <button id='Cancel' onClick="pageReload()">Cancel</button></form>`;                
                $("#townDetails").html(showData);
            }
        });       
    });

});
