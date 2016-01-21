/**
 * @fileoverview Event server for programming test.
 * @author Chelsea Chen
 */

'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var express = require('express'),
	bodyParser = require('body-parser'),
	assign = require('object-assign'),
	https = require('https'),
	json2csv = require('json2csv'),
	fs = require('fs');

//------------------------------------------------------------------------------
// Private
//------------------------------------------------------------------------------

var data = {},
	app = express();

//------------------------------------------------------------------------------
// Server
//------------------------------------------------------------------------------

app.use(bodyParser());

// enable CORS
app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Max-Age', 7200);
	res.header('Access-Control-Allow-Headers', 'X-Requested-With');
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	next();
});

app.get('/eventConf', function(req, res) {

	https.get('https://registration.gputechconf.com/cubehenge/json.php/GTC.MobileGuestServices.getSessions/GTC%202015/true', function(resData) {
		
		console.log('statusCode: ', resData.statusCode);
  console.log('headers: ', resData.headers);

  var body = ""; // a container for the response
		resData.on('data', function(d) {
		    body += d;
		});

		resData.on('end', function() {
      		
           var obj = JSON.parse(body),
           	   sessionIds, sessionId, aSpeakerInfo,
               aSpeaker, speakers = {}, i, j;
           var sessionsClone = [];
												

           //Task1 - Speaker Info
           for(i=0; i<obj.length; i++) {
             var clone = {}
             Object.getOwnPropertyNames(obj[i]).forEach(function (name) {
													  if(name !== "speakerInfo")
												      clone[name] = obj[i][name];
												 });
             sessionsClone.push(clone);

           		sessionId = obj[i].id;
           		aSpeakerInfo = obj[i].speakerInfo;

           		for(j=0; j<aSpeakerInfo.length; j++) {

           			aSpeaker = speakers[aSpeakerInfo[j].name];
           			if(aSpeaker) {
           				aSpeaker.sessionIds.push(sessionId); 
           			} else {
           				sessionIds = [];
           				aSpeaker = aSpeakerInfo[j];
           				sessionIds.push(sessionId);
           				aSpeaker['sessionIds']=sessionIds;
           				speakers[aSpeaker.name] = aSpeaker;
           			}
           		}
            }

           	console.log("Task 1 (Speaker Information):");
           	for(prop in speakers) {
           		aSpeaker = speakers[prop];
           		console.log(aSpeaker.name + " has spoken at " + aSpeaker.sessionIds.length + " session(s).");
           	}

           	//Task2 - Organization Info
           	var organzations = {}, orgName, prop;
     
           	for(prop in speakers) {
           		//console.log("speakers." + prop );
           		aSpeaker = speakers[prop];
           		orgName = aSpeaker.organization;

           		if(organzations[orgName]) {
           			organzations[orgName]['sperakers'].push(aSpeaker);
           		} else {
           				organzations[orgName] = {};
           				organzations[orgName]['sperakers'] = [];
           				organzations[orgName]['sperakers'].push(aSpeaker);
           			}
           	}

           	//find the unique session id in the sessions of org
           var k, sId, prop, 
           			sessionArr=[],
              speakerArr=[];

            for(prop in organzations) {
              
              speakerArr = organzations[prop]['sperakers'];
              
              sessionArr=[];

              for (k=0; k<speakerArr.length; k++) {
              	sessionIds = speakerArr[k].sessionIds;

              	for (var l=0, len=sessionIds.length; l<len; l++) {
	              	if((sessionArr.indexOf(sessionIds[l])) === -1) {
																			sessionArr.push(sessionIds[l]);
								  						}
							  						}
              }
              organzations[prop]['sessions'] = sessionArr;
            }

            console.log("Task 2 (Organization Information):");
            for(prop in organzations) {
                console.log(prop + " had " + 
                	organzations[prop]['sperakers'].length + " employee(s) that spoke at " 
                	+ organzations[prop]['sessions'].length + " session(s). ");
            }

            //Task 4 - write to csv file
            var fields = Object.keys(sessionsClone[0]);
 
												json2csv({ data: sessionsClone, fields: fields }, function(err, csv) {
												  if (err) console.log(err);
												  //console.log(csv);
               fs.writeFile('public/event.csv', csv, 'utf8', function (err) {
																  if (err) {
																    console.log('Some error occured - file either not saved or corrupted file saved.');
																  } else{
																    console.log('It\'s saved!');
																  }
															});
												});

            res.send(obj); 
           });

		resData.on('error', function(e) {
  			console.error(e);
  	  	});
	});
});

//-------------------------------------------------------------
// application 
//-------------------------------------------------------------
app.use(express.static('public'));

app.get('/', function(req, res) {
	
	res.sendfile('./public/index.html'); // load the single view file 
});

app.get('/csv', function(req, res) {
	
	res.sendfile('./public/event.csv'); // load the single view file 
});


app.listen(9899);
console.log('Started listening on port 9899');
