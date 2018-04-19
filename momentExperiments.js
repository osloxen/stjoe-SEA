/*jshint esversion: 6 */
/*jslint node: true */

'use strict';


var moment = require('moment');
var momentTZ = require('moment-timezone');

console.log('now: ', moment());

var today = moment();
var tomorrow = moment().add(1, 'days');
var dayAfterTomorrow = moment().add(2, 'days');

var todayTZ = momentTZ().tz('Asia/Tokyo');
var tomorrowTZ = momentTZ().tz('Asia/Tokyo').add(1, 'days');
var dayAfterTomorrowTZ = momentTZ().tz('Asia/Tokyo').add(2, 'days');


console.log('Today: ', today.format('YYYY-MM-DD-hh'));
console.log('Tomorrow: ', tomorrow.format('YYYY-MM-DD-hh'));

console.log('todayTZ: ', todayTZ.format('YYYY-MM-DD-hh'));
console.log('tomorrowTZ: ', tomorrowTZ.format('YYYY-MM-DD-hh'));
