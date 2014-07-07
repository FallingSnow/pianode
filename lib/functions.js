// functions.js
// the part of pianode which processes the users input functions

var p = null;
// p.write
// p.setStatus
// p.getStatus
// p.setState

var setUp = function(pianode) {
    p = pianode;
};

var playPause = function() {
    if (p !== null) {
        var s = p.getStatus();
        if (s === 'playing') {
            p.write('p');
            p.setStatus('paused');
            p.setState({
                playing: false,
                loggedIn: true,
                running: true
            });
        } else if (s === 'paused') {
            p.write('p');
            p.setStatus('playing');
            p.setState({
                playing: true,
                loggedIn: true,
                running: true
            });
        }
    }
};

var pause = function() {
    if (p !== null) {
        if (p.getStatus() === 'playing') {
            p.write('S');
            p.setStatus('paused');
            p.setState({
                playing: false,
                loggedIn: true,
                running: true
            });
        }
    }
};

var play = function() {
    if (p !== null) {
        if (p.getStatus() === 'paused') {
            p.write('P');
            p.setStatus('playing');
            p.setState({
                playing: true,
                loggedIn: true,
                running: true
            });
        }
    }
};

var next = function() {
    if (p !== null) {
        var s = p.getStatus();
        if (s === 'playing' || s === 'paused') {
            p.write('n');
        }
    }
};

var love = function() {
    if (p !== null) {
        var s = p.getStatus();
        if (s === 'playing' || s === 'paused') {
            p.write('+');
        }
    }
};

var ban = function() {
    if (p !== null) {
        var s = p.getStatus();
        if (s === 'playing' || s === 'paused') {
            p.write('-');
        }
    }
};

var history = function() {
    if (p !== null) {
        var s = p.getStatus();
        if (s === 'playing' || s === 'paused') {
            p.write('h');
        }
    }
};

var explain = function() {
    if (p !== null) {
        var s = p.getStatus();
        if (s === 'playing' || s === 'paused') {
            p.write('e');
        }
    }
};

var createStation = function(i) {
    // i = artist or song for station seed
    if (p !== null) {
        var s = p.getStatus();
        if (s === 'playing' || s === 'paused') {
            p.write('c');
            p.write(i);
        }
    }
};

var createStationFrom = function(c) {
    // c = 's' for from song
    // c = 'a' for from artist
    if (p !== null && (c === 's' || c === 'a')) {
        var s = p.getStatus();
        if (s === 'playing' || s === 'paused') {
            p.write('v');
            p.write(s);
        }
    }
};

var addMusicToStation = function(i) {
    // i = artist or song to add to station
    if (p !== null) {
        var s = p.getStatus();
        if (s === 'playing' || s === 'paused') {
            p.write('a');
            p.write(i);
        }
    }
};

var getStationList = function() {
    if (p !== null) {
        var s = p.getStatus();
        if (s === 'playing' || s === 'paused') {
            p.write('s');
            p.write('');
        }
    }
};

var changeStation = function(i) {
    // i = station number
    if (p !== null) {
        var s = p.getStatus();
        if (s === 'playing' || s === 'paused') {
            p.write("s");
            p.write(i);
        }
    }
};

// upcoming()
// switchStation(i)

module.exports.setUp = setUp;
module.exports.playPause = playPause;
module.exports.pause = pause;
module.exports.play = play;
module.exports.next = next;
module.exports.love = love;
module.exports.ban = ban;
module.exports.history = history;
module.exports.explain = explain;
module.exports.createStation = createStation;
module.exports.createStationFrom = createStationFrom;
module.exports.addMusicToStation = addMusicToStation;
module.exports.getStationList = getStationList;
module.exports.changeStation = changeStation;
