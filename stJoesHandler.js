/*jshint esversion: 6 */
/*jslint node: true */

'use strict';

var async = require('async');
var cleanArray = require('clean-array');
var moment = require('moment');

var spreadsheetAccess = require('localLinkLibraries/SpreadsheetAccess/spreadsheet-access.js');
var findSpreadsheetData = require('localLinkLibraries/SpreadsheetData/find-data.js');
var convertSpreadsheetData = require('localLinkLibraries/SpreadsheetData/convert-data.js');
var googleCalendarData = require('localLinkLibraries/GoogleCalendarData/calendar-event-access.js');
var iCalCalendarData = require('localLinkLibraries/CalendarAccess/ical.js');


var frontOfficeSheetId = '';


function lookUpSpreadsheetID(intent) {

    switch (intent) {
    case "front-office":
        return '1sEHqB8x1heOdD32sEIYQ-VBzAApObvzz203uZedisYo';
        break;
    default:
        return undefined
  }
}




exports.getTwitterFeed = function(event, context, callback) {

  console.log('Inside getTwitterFeed');

  console.log('event: ', event);
  console.log('pathParameters: ', event.pathParameters);

  var sportName = event.pathParameters.sport;

  var spreadsheetID = lookUpSpreadsheeetID(sportName);

  async.waterfall([
          function(callback) {
          // do some more stuff ...

          spreadsheetAccess.getGoogleSpreadsheetDataOneColumn(
                            spreadsheetID,
                            13, // what sheet (tab) is wanted
                            20, // how many rows to fetch
                            callback);

        },
        function(spreadsheetData, callback) {
          console.log('inside getTwitterFeed Waterfall: ',spreadsheetData);
          context.succeed(spreadsheetData);
          callback();
        }
  ]);
} // end of getTwitterFeed


exports.getActivityPictures = function(event, context, callback) {

  console.log('Inside getActivityPictures');

  console.log('event: ', event);
  console.log('pathParameters: ', event.pathParameters);

  var sportName = event.pathParameters.sport;

  var spreadsheetID = lookUpSpreadsheeetID(sportName);

  async.waterfall([
          function(callback) {
          // do some more stuff ...

          spreadsheetAccess.getGoogleSpreadsheetDataOneColumn(
                            spreadsheetID,
                            5, // what sheet (tab) is wanted
                            20, // how many rows to fetch
                            callback);

        },
        function(spreadsheetData, callback) {
          console.log('inside getActivityPictures Waterfall: ',spreadsheetData);
          context.succeed(spreadsheetData);
          callback();
        }
  ]);
} // end of getActivityPictures




exports.getActivityKey = function(event, context, callback) {

  console.log('Inside getActivityKey');

  console.log('event: ', event);
  console.log('pathParameters: ', event.pathParameters);
  console.log('query string parameters: ', event.queryStringParameters);

  var sportName = event.pathParameters.sport;
  console.log('sport: ', sportName);

  var spreadsheetID = lookUpSpreadsheeetID(sportName);

  var numColumns = 2;

  async.waterfall([
          function(callback) {

          spreadsheetAccess.getGoogleSpreadsheetDataMultColumns(
                            spreadsheetID,
                            1, // what sheet (tab) is wanted
                            20, // how many rows to fetch  BUGBUG optimize this!
                            numColumns, // num columns [key, sheet number]
                            callback);

        },
        function(spreadsheetDateData, callback) {

          console.log('spreadsheet Date Data: ', spreadsheetDateData);

          var bodyAsJson = JSON.parse(spreadsheetDateData.body);

          console.log('body as json: ', bodyAsJson);

          callback(null, bodyAsJson.sheetDataArray);

        },
        function(arrayOfKeys, callback) {
              var events = [];

              console.log('spreadsheet keys: ', arrayOfKeys);

              for (var i=numColumns;i<arrayOfKeys.length;i+=numColumns) {
                if (arrayOfKeys[i] != '') {
                  var event = {};
                  event.key = arrayOfKeys[i];
                  event.sheetNum = arrayOfKeys[i+1];

                  events.push(event);
                }
              }

              callback(null, events);
          },

        function(keyArray, callback) {
          console.log('end of getSportSheetData Waterfall: ',keyArray);

          var keys = {};
          keys.keyArray = keyArray;

          const res = {
              "statusCode": 200,
              "headers": {
                'Content-Type': 'application/json',
                "X-Requested-With": '*',
                "Access-Control-Allow-Headers": 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers',
                "Access-Control-Allow-Origin": '*',
                "Access-Control-Allow-Methods": 'GET,HEAD,OPTIONS,POST,PUT'
              },
              "body": JSON.stringify(keys) // body must be returned as a string
            };

          context.succeed(res);
          callback();
        }
  ]);


} // end of getActivityKey




exports.getTeamScheduleFromCalendar = function(event, context, callback) {

  console.log('Inside getTeamScheduleFromCalendar');

  console.log('event: ', event);
  console.log('pathParameters: ', event.pathParameters);
  console.log('query string parameters: ', event.queryStringParameters);

  var sportName = event.pathParameters.sport;
  var squad = event.queryStringParameters.squad;
  var gender = event.queryStringParameters.gender;
  var eventType = "game";

  if (event.queryStringParameters.eventType != undefined) {  // if left off parameters just get games
    eventType = event.queryStringParameters.eventType;
  }

  console.log('sport: ', sportName);
  console.log('squad: ', squad);
  console.log('gender: ', gender);
  console.log('event type: ', eventType);

  async.waterfall([
          function(callback) {

          googleCalendarData.getGoogleSportsCalendarData(
                            sportName,
                            squad, // varsity, jv or freshman
                            gender,
                            eventType, // game or practice (or both???)
                            callback);
        },
        function(scheduleArray, callback) {
          console.log('end of getGoogleSportsCalendarData Waterfall: ',scheduleArray);

          var scheduleObject = {};
          scheduleObject.schedule = scheduleArray;

          const res = {
              "statusCode": 200,
              "headers": {
                'Content-Type': 'application/json',
                "X-Requested-With": '*',
                "Access-Control-Allow-Headers": 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers',
                "Access-Control-Allow-Origin": '*',
                "Access-Control-Allow-Methods": 'GET,HEAD,OPTIONS,POST,PUT'
              },
              "body": JSON.stringify(scheduleObject) // body must be returned as a string
            };

          context.succeed(res);
          callback();
        }
  ]);

} //end of getTeamScheduleFromCalendar





exports.getArtsAndActivitiesFromCalendar = function(event, context, callback) {

  console.log('Inside getArtsAndActivitiesFromCalendar');

  console.log('pathParameters: ', event.pathParameters);

  var activity = event.pathParameters.activity;

  console.log('Activity is: ', activity);

  async.waterfall([
          function(callback) {

          googleCalendarData.getGoogleActivitiesCalendarData(activity, callback);
        },
        function(scheduleArray, callback) {
          console.log('end of getGoogleActivitiesCalendarData Waterfall: ',scheduleArray);

          var scheduleObject = {};
          scheduleObject.schedule = scheduleArray;

          const res = {
              "statusCode": 200,
              "headers": {
                'Content-Type': 'application/json',
                "X-Requested-With": '*',
                "Access-Control-Allow-Headers": 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers',
                "Access-Control-Allow-Origin": '*',
                "Access-Control-Allow-Methods": 'GET,HEAD,OPTIONS,POST,PUT'
              },
              "body": JSON.stringify(scheduleObject) // body must be returned as a string
            };

          context.succeed(res);
          callback();
        }
  ]);

} //end of getArtsAndActivitiesFromCalendar




exports.getAllArtsAndActivities = function(event, context, callback) {

  console.log('Inside getAllArtsAndActivities');

  async.waterfall([
          function(callback) {

          googleCalendarData.getAllGoogleActivitiesCalendarData(callback);
        },
        function(scheduleArray, callback) {

          var scheduleObject = {};
          scheduleObject.schedule = scheduleArray;

          const res = {
              "statusCode": 200,
              "headers": {
                'Content-Type': 'application/json',
                "X-Requested-With": '*',
                "Access-Control-Allow-Headers": 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers',
                "Access-Control-Allow-Origin": '*',
                "Access-Control-Allow-Methods": 'GET,HEAD,OPTIONS,POST,PUT'
              },
              "body": JSON.stringify(scheduleObject) // body must be returned as a string
            };

          context.succeed(res);
          callback();
        }
  ]);

} //end of getAllArtsAndActivities



// ***
// Use this to look ahead for the first page summary on the apps.
// ***
exports.getAllCalendarDataSchedSummary = function(event, context, callback) {

  console.log('Inside getAllCalendarDataSchedSummary');

  console.log('query string parameters: ', event.queryStringParameters);

  // *** TODO turn this on ***
  //var numDaysLookAhead = event.pathParameters.numDays;
  var numDaysLookAhead = 3;  // as in 3 days

  async.waterfall([
          function(callback) {

          iCalCalendarData.getSchedSummaryLookAhead(numDaysLookAhead, callback);
        },
        function(scheduleArray, callback) {

          var scheduleObject = {};
          scheduleObject.schedule = scheduleArray;

          const res = {
              "statusCode": 200,
              "headers": {
                'Content-Type': 'application/json',
                "X-Requested-With": '*',
                "Access-Control-Allow-Headers": 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers',
                "Access-Control-Allow-Origin": '*',
                "Access-Control-Allow-Methods": 'GET,HEAD,OPTIONS,POST,PUT'
              },
              "body": JSON.stringify(scheduleObject) // body must be returned as a string
            };

          context.succeed(res);
          callback();
        }
  ]);

} //end of getAllCalendarDataSchedSummary



// ***
// Use this to get details for today and tomorrow.
// ***
exports.getDayDetails = function(event, context, callback) {

  console.log('Inside getDayDetails');

  console.log('query string parameters: ', event.queryStringParameters);

  var today = moment();
  var requestedDate = today.format('YYYY-MM-DD');  // just a placeholder.

  async.waterfall([
          function(callback) {

          googleCalendarData.getDayDetails(requestedDate, callback);  // This is where the requested date would go
        },
        function(scheduleArray, callback) {

          var scheduleObject = {};
          scheduleObject.schedule = scheduleArray;

          const res = {
              "statusCode": 200,
              "headers": {
                'Content-Type': 'application/json',
                "X-Requested-With": '*',
                "Access-Control-Allow-Headers": 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers',
                "Access-Control-Allow-Origin": '*',
                "Access-Control-Allow-Methods": 'GET,HEAD,OPTIONS,POST,PUT'
              },
              "body": JSON.stringify(scheduleObject) // body must be returned as a string
            };

          context.succeed(res);
          callback();
        }
  ]);

} //end of getDayDetails



exports.getTeamSchedule = function(event, context, callback) {

  console.log('Inside getTeamSchedule');

  console.log('event: ', event);
  console.log('pathParameters: ', event.pathParameters);
  console.log('query string parameters: ', event.queryStringParameters);

  var sportName = event.pathParameters.sport;
  var squad = event.queryStringParameters.squad;
  var schedule = event.queryStringParameters.eventType;

  console.log('sport: ', sportName);
  console.log('squad: ', squad);
  console.log('schedule: ', schedule);

  var spreadsheetID = lookUpSpreadsheeetID(sportName);
  var scheduleSelected = lookUpScheduleSelection(squad, schedule);

  console.log('selecting spreadsheet tab: ', scheduleSelected);

  async.waterfall([
          function(callback) {

          spreadsheetAccess.getGoogleSpreadsheetDataMultColumns(
                            spreadsheetID,
                            scheduleSelected, // what sheet (tab) is wanted
                            100, // how many rows to fetch  BUGBUG optimize this!
                            6, // num columns [name, number, class]
                            callback);

        },
        function(spreadsheetDateData, callback) {

          console.log('spreadsheet Date Data: ', spreadsheetDateData);

          var bodyAsJson = JSON.parse(spreadsheetDateData.body);

          console.log('body as json: ', bodyAsJson);

          callback(null, bodyAsJson.sheetDataArray);

        },
        function(arrayOfDateData, callback) {
              var events = [];

              console.log('spreadsheet date data: ', arrayOfDateData);

              for (var i=6;i<arrayOfDateData.length;i+=6) {
                if (arrayOfDateData[i] != '') {
                  var event = {};
                  event.date = arrayOfDateData[i];
                  event.startTime = arrayOfDateData[i+1];
                  event.opponent = arrayOfDateData[i+2];
                  event.locationName = arrayOfDateData[i+3];
                  event.locationAddress = arrayOfDateData[i+4];
                  event.locationNotes = arrayOfDateData[i+5];

                  events.push(event);
                }
              }

              callback(null, events);
          },

        function(scheduleArray, callback) {
          console.log('end of getSportSheetData Waterfall: ',scheduleArray);

          var scheduleObject = {};
          scheduleObject.schedule = scheduleArray;

          const res = {
              "statusCode": 200,
              "headers": {
                'Content-Type': 'application/json',
                "X-Requested-With": '*',
                "Access-Control-Allow-Headers": 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers',
                "Access-Control-Allow-Origin": '*',
                "Access-Control-Allow-Methods": 'GET,HEAD,OPTIONS,POST,PUT'
              },
              "body": JSON.stringify(scheduleObject) // body must be returned as a string
            };

          context.succeed(res);
          callback();
        }
  ]);
}; // end of getTeamSchedule






exports.getTeamRoster = function(event, context, callback) {

  console.log('Inside getTeamRoster');

  console.log('event: ', event);
  console.log('pathParameters: ', event.pathParameters);

  var sportName = event.pathParameters.sport;

  var spreadsheetID = lookUpSpreadsheeetID(sportName);

  async.waterfall([
          function(callback) {

          spreadsheetAccess.getGoogleSpreadsheetDataMultColumns(
                            spreadsheetID,
                            9, // Sports - what sheet (tab) is wanted
                            50, // how many rows to fetch
                            3, // num columns [name, number, class]
                            callback);

        },
        function(spreadsheetData, callback) {

          console.log('spreadsheetData: ', spreadsheetData);

          var bodyAsJson = JSON.parse(spreadsheetData.body);

          console.log('body as json: ', bodyAsJson);

          callback(null, bodyAsJson.sheetDataArray);

        },
        function(arrayOfRosterData, callback) {
              var roster = [];

              console.log('spreadsheet roster: ', arrayOfRosterData);

              for (var i=3;i<arrayOfRosterData.length;i+=3) {
                if (arrayOfRosterData[i] != '') {
                  var player = {};
                  player.lastName = arrayOfRosterData[i];
                  player.number = arrayOfRosterData[i+1];
                  player.class = arrayOfRosterData[i+2];

                  roster.push(player);
                }
              }

              callback(null, roster);
          },

        function(rosterPlayerArray, callback) {
          console.log('end of getSportSheetData Waterfall: ',rosterPlayerArray);

          var participantsArray = {};
          participantsArray.listOfParticipants = rosterPlayerArray;

          const res = {
              "statusCode": 200,
              "headers": {
                'Content-Type': 'application/json',
                "X-Requested-With": '*',
                "Access-Control-Allow-Headers": 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers',
                "Access-Control-Allow-Origin": '*',
                "Access-Control-Allow-Methods": 'GET,HEAD,OPTIONS,POST,PUT'
              },
              "body": JSON.stringify(participantsArray) // body must be returned as a string
            };

          context.succeed(res);
          callback();
        }
  ]);
}; // end of getTeamRoster




exports.getVolunteerOpportunities = function(event, context, callback) {

  console.log('Inside getVolunteerOpportunities');

  console.log('event: ', event);
  console.log('pathParameters: ', event.pathParameters);

  var sportName = event.pathParameters.sport;

  var spreadsheetID = lookUpSpreadsheeetID(sportName);

  async.waterfall([
          function(callback) {
          // do some more stuff ...

          spreadsheetAccess.getGoogleSpreadsheetDataOneColumn(
                            spreadsheetID,
                            9, // what sheet (tab) is wanted
                            50, // how many rows to fetch
                            callback);

        },
        function(spreadsheetData, callback) {
          console.log('inside getVolunteerOpportunities Waterfall: ',spreadsheetData);
          context.succeed(spreadsheetData);
          callback();
        }
  ]);
} // getVolunteerOpportunities


exports.getTryoutInfo = function(event, context, callback) {

  console.log('Inside getTryoutInfo');

  console.log('event: ', event);
  console.log('pathParameters: ', event.pathParameters);

  var sportName = event.pathParameters.sport;

  var spreadsheetID = lookUpSpreadsheeetID(sportName);

  async.waterfall([
          function(callback) {
          // do some more stuff ...

          spreadsheetAccess.getGoogleSpreadsheetDataOneColumn(
                            spreadsheetID,
                            4, // what sheet (tab) is wanted
                            2, // how many rows to fetch
                            callback);

        },
        function(spreadsheetData, callback) {
          console.log('inside getSportAnnouncements Waterfall: ',spreadsheetData);
          context.succeed(spreadsheetData);
          callback();
        }
  ]);
} // getTryoutInfo



exports.getSportAnnouncement = function(event, context, callback) {

  console.log('Inside getSportAnnouncement');

  console.log('event: ', event);
  console.log('pathParameters: ', event.pathParameters);

  var sportName = event.pathParameters.sport;

  var spreadsheetID = lookUpSpreadsheeetID(sportName);

  async.waterfall([
          function(callback) {
          // do some more stuff ...

          spreadsheetAccess.getGoogleSpreadsheetDataOneColumn(
                            spreadsheetID,
                            3, // what sheet (tab) is wanted
                            2, // how many rows to fetch
                            callback);

        },
        function(spreadsheetData, callback) {
          console.log('inside getSportAnnouncements Waterfall: ',spreadsheetData);
          context.succeed(spreadsheetData);
          callback();
        }
  ]);
} // end of getSportAnnouncement



exports.getListOfSports = function(event, context, callback) {

  console.log('Inside getListOfSports');

  async.waterfall([
          function(callback) {

          console.log('spreadsheetAccess: ', spreadsheetAccess);

          spreadsheetAccess.getGoogleSpreadsheetDataOneColumn(
                            frontOfficeSheetId,
                            3, // what sheet (tab) is wanted
                            50, // how many rows to fetch
                            callback);

        },
        function(spreadsheetData, callback) {
          console.log('end of getListOfSports Waterfall: ',spreadsheetData);
          context.succeed(spreadsheetData);
          callback();
        }
  ]);
};



exports.getSportDetails = function(event, context, callback) {

  console.log('Inside getSportSheetData');

  console.log('event: ', event);
  console.log('pathParameters: ', event.pathParameters);

  var sportName = event.pathParameters.sport;

  async.waterfall([
          function(callback) {

          spreadsheetAccess.getGoogleSpreadsheetDataMultColumns(
                            frontOfficeSheetId,
                            3, // Sports - what sheet (tab) is wanted
                            50, // how many rows to fetch
                            4, // num columns [name, sheetLink, picturesLink, sheetId]
                            callback);

        },
        function(spreadsheetData, callback) {

          console.log('spreadsheetData: ', spreadsheetData);

          var bodyAsJson = JSON.parse(spreadsheetData.body);

          console.log('body as json: ', bodyAsJson);

          var positionOfSport = bodyAsJson.sheetDataArray.indexOf(sportName);

          console.log('positionOfSport: ', positionOfSport);

          var sportDetails = {};
          sportDetails.sport = sportName;

          if (positionOfSport == -1) {
            sportDetails.sheetLink = null;
            sportDetails.picturesLink = null;
            sportDetails.sheetId = null;
          } else {
            sportDetails.sheetLink = bodyAsJson.sheetDataArray[positionOfSport + 1];
            sportDetails.picturesLink = bodyAsJson.sheetDataArray[positionOfSport + 2];
            sportDetails.sheetId = bodyAsJson.sheetDataArray[positionOfSport + 3];
          }

          callback(null, sportDetails);

        },
        function(sportData, callback) {
          console.log('end of getSportSheetData Waterfall: ',sportData);

          const res = {
              "statusCode": 200,
              "headers": {
                'Content-Type': 'application/json',
                "X-Requested-With": '*',
                "Access-Control-Allow-Headers": 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers',
                "Access-Control-Allow-Origin": '*',
                "Access-Control-Allow-Methods": 'GET,HEAD,OPTIONS,POST,PUT'
              },
              "body": JSON.stringify(sportData) // body must be returned as a string
            };

          context.succeed(res);
          callback();
        }
  ]);
}; // end of getSportSheetData




exports.getListOfArtsActivities = function(event, context, callback) {

  console.log('Inside getListOfArtsActivities');

  async.waterfall([
          function(callback) {

          spreadsheetAccess.getGoogleSpreadsheetDataOneColumn(
                            frontOfficeSheetId,
                            4, // what sheet (tab) is wanted
                            50, // how many rows to fetch
                            callback);

        },
        function(spreadsheetData, callback) {
          console.log('end of getListOfArtsActivities Waterfall: ',spreadsheetData);
          context.succeed(spreadsheetData);
          callback();
        }
  ]);
};  // end of getListOfArtsActivities


exports.getListOfClubs = function(event, context, callback) {

  console.log('Inside getListOfClubs');

  async.waterfall([
          function(callback) {

          spreadsheetAccess.getGoogleSpreadsheetDataOneColumn(
                            frontOfficeSheetId,
                            5, // what sheet (tab) is wanted
                            50, // how many rows to fetch
                            callback);

        },
        function(spreadsheetData, callback) {
          console.log('end of getListOfClubs Waterfall: ',spreadsheetData);
          context.succeed(spreadsheetData);
          callback();
        }
  ]);
};  // end of getListOfClubs
