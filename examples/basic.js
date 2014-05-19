var Pianode = require('../pianode.js')
, settings = require('./settings.js');

var pandora = new Pianode({
    email: settings.email,
    password: settings.password,
    verbose: true
});

console.log('pianode object created.');

pandora.on('error', function(error) {
    console.log('! %s: %s !', error.type, error.text);
});

pandora.on('statusChange', function(statusChange) {
    console.log('[ %s > %s ]', statusChange.prevStatus, statusChange.status);
});

pandora.on('close', function(code) {
    console.log('| Closing with code %s |', code);
});

pandora.on('songChange', function(song) {
    console.log('> Now playing %s from %s <', song.name, song.artist);
});

pandora.on('stationChange', function(station) {
    console.log('> Now listening to %s <', station.name);
});


var count = 0;
pandora.on('timeChange', function(time) {
    if (count <= 20) {
        count++;
    } else {
        count = 0;
        pandora.next();
    }
});

console.log('pianode event listeners added.');

pandora.start();

console.log('pianode started.');
