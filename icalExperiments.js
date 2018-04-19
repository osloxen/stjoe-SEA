/*jshint esversion: 6 */
/*jslint node: true */

'use strict';


var moment = require('moment');
var momentTZ = require('moment-timezone');
var ical = require('node-ical');

console.log('now: ', moment());

var url = 'http://www.stjosephsea.org/calendar/calendar_348_gmt.ics';
var url2 = 'https://www.stjosephsea.org/cf_calendar/feed.cfm?type=ical&feedID=A6D4FF56EEF94E8BBFBA55516CCB7F86';
var sportsUrl = 'http://tmsdln.com/r8bv';
var Client = require('node-rest-client').Client;

var client = new Client();

const download = require('download');
const fs = require('fs');


download(sportsUrl).then(buffer => {
    //fs.writeFileSync('dist/foo.jpg', data);
    var data = buffer.toString('utf8');
    var calendar = ical.parseICS(data);
    var schedule = [];
    for (const [key, value] of Object.entries(calendar)) {
      schedule.push(value);
      //console.log(key, value);
    }
    console.log(schedule);
    console.log('num items: ', schedule.length);
});
