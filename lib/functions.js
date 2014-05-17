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

// upcoming()
// switchStation(i)
// addStation(i)
// addMusicToStation(i)

module.exports.setUp = setUp;
module.exports.playPause = playPause;
module.exports.pause = pause;
module.exports.play = play;
module.exports.next = next;
module.exports.love = love;
module.exports.ban = ban;
module.exports.history = history;
module.exports.explain = explain;
