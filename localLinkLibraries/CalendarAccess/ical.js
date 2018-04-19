/*jshint esversion: 6 */
/*jslint node: true */

'use strict';

var async = require('async');
var moment = require('moment');
var momentTZ = require('moment-timezone');
var ical = require('node-ical');
const download = require('download');
var _ = require('lodash');






function awayOrHome(summaryString) {

  var lowerCaseSummaryString = summaryString.toLowerCase();

  if (lowerCaseSummaryString.indexOf("@") >= 0) {
    return "away";
  } else if (lowerCaseSummaryString.indexOf("vs") >= 0) {
    return "home";
  } else {
    return "unknown";
  }
}


function assignSquad(summaryString) {

  var lowerCaseSummaryString = summaryString.toLowerCase();

  // if ((lowerCaseSummaryString.indexOf("varsity")) ||
  //     (lowerCaseSummaryString.indexOf("/V")) >= 0) {
  if (lowerCaseSummaryString.indexOf("varsity") >= 0) {
    return "varsity";
  } else if (lowerCaseSummaryString.indexOf("jv") >= 0) {
    return "jv";
  } else if (lowerCaseSummaryString.indexOf("fresh") >= 0) {
    return "freshman";
  } else {
    return "undefined";
  }
}


function assignSport(summaryString) {

  var lowerCaseSummaryString = summaryString.toLowerCase();

  if (lowerCaseSummaryString.indexOf("baseball") >= 0) {
    return "baseball";
  } else if (lowerCaseSummaryString.indexOf("track") >= 0) {
    return "track";
  } else if (lowerCaseSummaryString.indexOf("softball") >= 0) {
    return "softball";
  } else if (lowerCaseSummaryString.indexOf("soccer") >= 0) {
    return "boys-soccer";
  } else if ((lowerCaseSummaryString.indexOf("soccer") >= 0) &&
              (lowerCaseSummaryString.indexOf("girls") >= 0)) {
    return "girls-soccer";
  } else if (lowerCaseSummaryString.indexOf("tennis") >= 0) {
    return "tennis";
  } else if (((lowerCaseSummaryString.indexOf("lacrosse") >= 0) ||
              (lowerCaseSummaryString.indexOf("lax") >= 0)) &&
              (lowerCaseSummaryString.indexOf("boys") >= 0)) {
    return "boys-lax";
  } else if (((lowerCaseSummaryString.indexOf("lacrosse") >= 0) ||
              (lowerCaseSummaryString.indexOf("lax") >= 0)) &&
              (lowerCaseSummaryString.indexOf("girls") >= 0)) {
    return "girls-lax";
  } else {
    return "undefined";
  }
}


function assignClub(summaryString) {

  var lowerCaseSummaryString = summaryString.toLowerCase();

  if (lowerCaseSummaryString.indexOf("math") >= 0) {
    return "math";
  } else if (lowerCaseSummaryString.indexOf("cheer") >= 0) {
    return "cheer";
  } else if (lowerCaseSummaryString.indexOf("art") >= 0) {
    return "art-club";
  } else if (lowerCaseSummaryString.indexOf("drivers ed") >= 0) {
    return "drivers-ed";
  } else if (lowerCaseSummaryString.indexOf("dance team") >= 0) {
    return "dance-team";
  } else if (lowerCaseSummaryString.indexOf("fbla") >= 0) {
    return "fbla";
  } else if (lowerCaseSummaryString.indexOf("latin")  >= 0) {
    return "latin-club";
  } else if (lowerCaseSummaryString.indexOf("spanish")  >= 0) {
    return "spanish-club";
  } else if (lowerCaseSummaryString.indexOf("robot")  >= 0) {
    return "robotics";
  } else if (lowerCaseSummaryString.indexOf("ping pong")  >= 0) {
    return "ping-pong";
  } else if ((lowerCaseSummaryString.indexOf("seniors") >= 0) ||
              (lowerCaseSummaryString.indexOf("graduates") >= 0) ||
              (lowerCaseSummaryString.indexOf("last blast") >= 0) ||
              (lowerCaseSummaryString.indexOf("graduation") >= 0)) {
    return "graduates";
  } else if ((lowerCaseSummaryString.indexOf("improv") >= 0) ||
              (lowerCaseSummaryString.indexOf("costume") >= 0) ||
              (lowerCaseSummaryString.indexOf("drama") >= 0) ||
              (lowerCaseSummaryString.indexOf("musical") >= 0) ||
              (lowerCaseSummaryString.indexOf("make up")  >= 0)) {
    return "drama";
  } else {
    return "undefined";
  }
}


function assignGender(summaryString) {

  var lowerCaseSummaryString = summaryString.toLowerCase();

  if (lowerCaseSummaryString.indexOf("girls") >= 0) {
    return "girls";
  } else if (lowerCaseSummaryString.indexOf("boys") >= 0) {
    return "boys";
  } else if (lowerCaseSummaryString.indexOf("softball") >= 0) {
    return "girls";
  } else {
    return "undefined";
  }
}




function GetCalendarData(optionalParameters, callerCallback) {

  var self = this;

  self.callerCallback = callerCallback;

  this.initialize = function(callback) {

    console.log('inside initialize');
    console.log('Parameters: ', optionalParameters);

    self.schooliCalUrl = 'http://www.stjosephsea.org/calendar/calendar_348_gmt.ics';
    self.schedule = [];

    callback();
  };



  function processCalenderData(arrayToPopulate, events) {

    console.log('inside processCalenderData');

    console.log(events[0]);

    events.forEach(function (event) {

      var dateOfEvent = moment(event.start);
      var year = dateOfEvent.format('Y');
      var month = dateOfEvent.format('M');
      var day = dateOfEvent.format('D');

      var currentEvent = {};

  //    if (year == "2018") {
      if ((year == "2018") && ((month == "4") || (month == "5") || (month == "6"))) {
  //    if ((year == "2018") && (month == "3") && (day == "10")) {

        currentEvent.sport = assignSport(event.summary);
        currentEvent.club = assignClub(event.summary);

        var startTimeObject = moment(event.start).utcOffset(-7);
        var startTime = startTimeObject.format("h a");
        var eventDate = startTimeObject.format("YYYY-MM-DD");
        var endTimeObject = moment(event.end).utcOffset(-7);
        var endTime = endTimeObject.format("h a");

        currentEvent.squad = assignSquad(event.summary);
        currentEvent.gender = assignGender(event.summary);
        currentEvent.eventType = "game";
        currentEvent.startTime = startTime;
        currentEvent.endTime = endTime;
        currentEvent.eventDate = eventDate;
        currentEvent.awayOrHome = awayOrHome(event.summary);
        currentEvent.location = event.location;
        currentEvent.summary = event.summary;
        currentEvent.description = event.description;

        arrayToPopulate.push(currentEvent);
      }

    });

  }


  this.getSchoolActivitiesData = function(callback) {

    console.log('inside getSchoolActivitiesData');


    download(self.schooliCalUrl).then(buffer => {

        console.log('inside download function');
        console.log(buffer);

        var data = buffer.toString('utf8');
        console.log('data: ', data);
        var calendarKeyPairs = ical.parseICS(data);
        console.log('calendar: ', calendarKeyPairs);
        var iCalSchedule = [];
        for (var key in calendarKeyPairs) {
          iCalSchedule.push(calendarKeyPairs[key]);
        }
        console.log('schedule: ', iCalSchedule);

        processCalenderData(self.schedule, iCalSchedule);

        //console.log(schedule);
        console.log('num items: ', self.schedule.length);

        self.finalFilteredSchedule = self.schedule;  //TODO This is a shortcut!!!

        callback();
    });



  } // end of this.getSchoolActivitiesData




  this.getArtCalendarData = function(callback) {

    console.log('inside getArtCalendarData');

    artsCalendar.getEvents(function(err, events) {
      if (err) { return console.log(err.message); }

      processCalenderData(self.schedule, events);

      self.finalFilteredSchedule = self.schedule;  //TODO This is a shortcut!!!

      callback();
    });

  } // end of this.getArtCalendarData






  this.getSportsAwaySchedule = function(callback) {

    console.log('inside getCalendarData');

    athleticsAwayCalendar.getEvents(function(err, events) {
      if (err) { return console.log(err.message); }

      processCalenderData(self.schedule, events);

      callback();
    });

  } // end of this.getCalendarData




  this.getSportsHomeSchedule = function(callback) {

    console.log('inside getCalendarData');

    athleticsHomeCalendar.getEvents(function(err, events) {
      if (err) { return console.log(err.message); }

      processCalenderData(self.schedule, events);

      callback();
    });

  } // end of this.getSportsHomeSchedule



  this.filterTheSchedule = function(callback) {

    console.log('inside filterTheSchedule');

    console.log('sport: ', sport);
    console.log('squad: ', squad);

    console.log('before filter: ', self.schedule);

    self.sportFilteredSchedule = self.schedule.filter((eventInstance) =>
                                  eventInstance.sport == sport);

    console.log('sportFilteredSchedule: ', self.sportFilteredSchedule);

    self.squadFilteredSchedule = self.sportFilteredSchedule.filter((eventInstance) =>
                                  eventInstance.squad == squad);

    self.finalFilteredSchedule = self.squadFilteredSchedule.filter((eventInstance) =>
                                  eventInstance.eventType == eventType);

    callback();
  }



  this.filterTheScheduleForActivity = function(callback) {

    console.log('inside filterTheScheduleForActivity');

    console.log('Activity: ', sport);  // object calls first parameter "sport"

    console.log('before filter: ', self.schedule);

    self.activityFilteredSchedule = self.schedule.filter((eventInstance) =>
                                  eventInstance.club == sport);

    console.log('activityFilteredSchedule: ', self.activityFilteredSchedule);

    self.finalFilteredSchedule = self.activityFilteredSchedule;

    callback();
  }



  this.sortTheArray = function(callback) {

    //self.finalFilteredSchedule = self.finalFilteredSchedule.reverse();

    self.finalFilteredSchedule.sort(function(a,b){
      // Turn your strings into dates, and then subtract them
      // to get a value that is either negative, positive, or zero.
      return new Date(a.start) - new Date(b.start);
    });

    callback();
  }


  this.getListOfAllActivities = function(callback) {

    self.listOfUndefinedActivities = [];

    console.log(self.finalFilteredSchedule);
    console.log(self.finalFilteredSchedule[0]);

    for (var i = 0;i<self.finalFilteredSchedule.length;i++) {

        if (self.finalFilteredSchedule[i].club == 'undefined') {

          console.log('summary: ', self.finalFilteredSchedule[i].summary);
          self.listOfUndefinedActivities.push(self.finalFilteredSchedule[i].summary);

        }
//        console.log('club: ', eventInstance.club);

    }

    callback();
  }


  this.sendBackUndefinedActivities = function(callback) {

    console.log('before assignment: ', self.finalFilteredSchedule);

    self.finalFilteredSchedule = self.listOfUndefinedActivities;

    console.log('after assignment: ', self.finalFilteredSchedule);

    callback();
  }





  this.filterForNumberOfDays = function(callback) {

    console.log('inside filterForNumberOfDays');

    self.schedLookAhead = [];

    //moment().tz("America/Los_Angeles").format();

    var today = momentTZ().tz("America/Los_Angeles");
    var tomorrow = momentTZ().tz("America/Los_Angeles").add(1, 'days');
    var dayAfterTomorrow = momentTZ().tz("America/Los_Angeles").add(2, 'days');

  /*
    var today = moment();
    var tomorrow = moment().add(1, 'days');
    var dayAfterTomorrow = moment().add(2, 'days');
  */

    console.log('Today: ', today.format('YYYY-MM-DD'));
    console.log('Tomorrow: ', tomorrow.format('YYYY-MM-DD'));

    self.schedLookAhead = self.schedule.filter((event) =>
                            ((event.eventDate == today.format('YYYY-MM-DD')) ||
                            (event.eventDate == tomorrow.format('YYYY-MM-DD'))));

    callback();
  }



  this.updateFinalResultsAfterFilter = function(callback) {

    self.finalFilteredSchedule = self.schedLookAhead;

    callback();
  }



  this.callTheCallback = function(callback) {

    console.log('inside returnData');

    self.callerCallback(null, self.finalFilteredSchedule);
  }

} // end of GetCalendarData






exports.getSchedSummaryLookAhead = function(numDays, callerCallback) {

  console.log('*** inside getSchedSummaryLookAhead ***');
  console.log('Look ahead this many days: ', numDays);  // <-- not hooked up currently

  var parameters = {};
  parameters.numDays = numDays;

  var getCalendarData = new GetCalendarData(parameters, callerCallback);

  async.waterfall([

    // IT ALL BEGINS HERE
    getCalendarData.initialize,
    //getCalendarData.getSportsSchedule,
    getCalendarData.getSchoolActivitiesData,
    //getCalendarData.filterForNumberOfDays,
    //getCalendarData.updateFinalResultsAfterFilter,
    getCalendarData.sortTheArray,
    getCalendarData.callTheCallback
  ]
);

}; // end of getSchedSummaryLookAhead
