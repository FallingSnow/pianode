// processIo.js
// The part of pianode which processes the stdio of the pianobar process.
var _ = require('underscore');

module.exports = function(p) {

    // [?] Select station:
    if (/\[\?\] Select station:/.test(p.data)) {
        p.log('Station selection detected!');
        if (!p.options.loggedIn)
            p.write(p.options.station);
        p.emit('selectStation');
        p.setState({
            running: true,
            loggedIn: true
        });
        if (p.options.debug)
            console.log('Select station');
    }
    // (i) We're playing this track because
    else if (/\(i\) We're playing this track because .+/.test(p.data)) {
        p.setState({
            lastExplination: p.data.match(/\(i\) We're playing this track because .+/)
        });
        p.setStatus('received explanation');
    }
    // [?] Password:
    else if (/\[\?\] Password:/.test(p.data)) {
        p.log('Password request detected!');
        p.write(p.options.password);
        p.emit('passwordRequest');
        p.setStatus('logging in');
        p.setState({
            running: true,
            loggedIn: false
        });
        if (p.options.debug)
            console.log('Enter password');
    }
    // [?] Email:
    else if (/\[\?\] Email:/.test(p.data)) {
        p.log('Email request detected!');
        p.write(p.options.email);
        p.emit('emailRequest');
        p.setStatus('logging in');
        p.setState({
            running: true,
            loggedIn: false
        });
        if (p.options.debug)
            console.log('Enter email');
    }
    // |>  "Die Young" by "Kesha" on "Warrior (Deluxe Version)" @ Today's Hits
    else if (/\|\>  "(.+)" by "(.+)" on "(.+)" @ (.+)/.test(p.data)) {
        p.log('Song change detected!');
        var m = p.data.match(/\|\>  "(.+)" by "(.+)" on "(.+)" @ (.+)/);
        var song = {
            name: m[1],
            artist: m[2],
            album: m[3],
            playlist: m[4]
        };
        p.log('Song: ' + m[1] + ', Artist: ' + m[2] + ', Album: ' + m[3] + ', Playlist: ' + m[4]);
        p.emit('songChange', song);
        if (p.options.debug)
            console.log('Song change');
    }
    // |>  Station "QuickMix" (1057370371552570017)
    else if (/\|\>  Station "(.+)" \((.+)\)/.test(p.data)) {
        p.log('Station change detected!');
        var m = p.data.match(/\|\>  Station "(.+)" \((.+)\)/);
        var station = {
            name: m[1],
            id: m[2]
        };
        p.log('Station: ' + station.name + ', Id: ' + station.id);
        p.emit('stationChange', station);
        if (p.options.debug)
            console.log('Station Changed');
    }
    /*
     * 0) Eminem - When I'm Gone
     * 1) Ellie Goulding - Lights
     */
    // Or
    //(i) No history yet.
    else if (/\d+\) .+ \- .+[\S]+/.test(p.data) || /\(i\) No history yet\./.test(p.data)) {
        var history;

        if (/\d+\) .+ \- .+[\S]+/.test(p.data)) {
            history = p.data.match(/\d+\) .+ \- .+[\S]+/g);
        } else {
            history = [];
        }

        p.setState({
            history: history
        });
        p.setStatus('received history');
        if (p.options.debug)
            console.log('History');
    }
    // #   -04:24/04:31
    else if (/\#   \-([0-9]{2})\:([0-9]{2})\/([0-9]{2})\:([0-9]{2})/.test(p.data)) {

        var m = p.data.match(/\#   \-([0-9]{2})\:([0-9]{2})\/([0-9]{2})\:([0-9]{2})/);
        var time = {};
        time.remaining = {
            string: m[1] + ':' + m[2],
            seconds: (m[1] * 60) + m[2]
        };
        time.total = {
            string: m[3] + ':' + m[4],
            seconds: (m[3] * 60) + m[4]
        };
        time.played = {};
        time.played.seconds = time.total.seconds - time.remaining.seconds;

        if (p.pianode.timePlayed === time.played.seconds) {
            p.setStatus('paused');
            return;
        }
        ;

        time.played.string = Math.floor(time.played.seconds / 60) + ':' + (time.played.seconds % 60);
        time.string = '-' + time.remaining.string + '/' + time.total.string;
        time.percent = (time.played.seconds / (time.total.seconds / 100));

        p.pianode.timePlayed = time.played.seconds;
        p.emit('timeChange', time);
        p.setStatus('playing');
        p.setState({
            playing: true
        });
        if (p.options.debug)
            console.log('Time');
    }
    // (i) Login...
    else if (/\(i\) Login\.\.\./.test(p.data)) {
        p.setStatus('logging in');
        p.setState({
            running: true
        });
        if (p.options.debug)
            console.log('Login');
    }
    // (i) Get stations...
    else if (/\(i\) Get stations\.\.\./.test(p.data)) {
        p.setStatus('receiving stations');
        if (p.options.debug)
            console.log('Getting stations');
    }
    // (i) Receiving new playlist...
    else if (/\(i\) Receiving new playlist\.\.\./.test(p.data)) {
        p.setStatus('receiving playlist');
        if (p.options.debug)
            console.log('Getting playlist');
    }
    // (i) Receiving explanation...
    else if (/\(i\) Receiving explanation\.\.\./.test(p.data)) {
        p.setStatus('receiving explanation');
        if (p.options.debug)
            console.log('Getting explination');
    }
    /*
     * 0) q   Andrea Lindsay Radio                                                                                                                                                                                                         
     * 1) q   Audio Bullys Radio                                                                                                                                                                                                           
     * 2) q   Bingo Players Radio                                                                                                                                                                                                          
     * 3) q   Claude Debussy Radio                                                                                                                                                                                                         
     * 4) q   Coeur De Pirate Radio                                                                                                                                                                                                        
     * 5) q   Drum & Bass Radio                                                        
     * 6) q   E-Dubble Radio   
     * 7)  Q  QuickMix
     */
//    else if (/\d+\) [q ][Q ]  .+[\S]+/.test(p.data)) {
//        p.setState({
//            stations: p.data.match(/\d+\) [q ][Q ]  .+[\S]+/g)
//        });
//        p.setStatus('received stations');
//        if (p.options.debug) console.log('Got stations');
//    }
    // Network error: Timeout.
    else if (/Network error\: Timeout\./.test(p.data)) {
        p.logError('Network error: Timeout.');
        p.emit('error', {
            type: 'Network error',
            text: 'Network error: Timeout.'
        });
        p.setStatus('error');
        p.setStateOff();
    }
    // Network error: TLS handshake failed.
    else if (/Network error\: TLS handshake failed\./.test(p.data)) {
        p.logError('Network error: TLS handshake failed.');
        p.emit('error', {
            type: 'Network error',
            text: 'Network error: TLS handshake failed.'
        });
        p.setStatus('error');
        p.setStateOff();
    }
    // Network error: Read error.
    else if (/Network error\: Read error\./.test(p.data)) {
        p.logError('Network error: Read error.');
        p.emit('error', {
            type: 'Network error',
            text: 'Network error: Read error.'
        });
        p.setStatus('error');
        p.setStateOff();
    }
    // Error: Pandora is not available in your country. Set up a control proxy (see manpage).
    else if (/Error\: Pandora is not available in your country\. Set up a control proxy \(see manpage\)\./.test(p.data)) {
        p.logError('Error: Pandora is not available in your country. Set up a control proxy (see manpage).');
        p.emit('error', {
            type: 'Pianobar error',
            text: 'Error: Pandora is not available in your country. Set up a control proxy (see manpage).'
        });
        p.setStatus('error');
        p.setStateOff();
    }
    // /!\ Cannot access audio file: Forbidden.
    else if (/\/\!\\ Cannot access audio file\: Forbidden\./.test(p.data)) {
        p.logError('Error: Cannot access audio file: Forbidden.');
        p.emit('error', {
            type: 'Pianobar error',
            text: 'Cannot access audio file: Forbidden.'
        });
        p.setStatus('error');
        p.setStateOff();
    }

    if (/\d+\) [q ][Q ] .+[\S]+/.test(p.data)) {
        var list = p.data.match(/\d+\) [q ][Q ] .+[\S]+/g),
                stations = {},
                regEx = /(\d+)\) [q ][Q ] (.+[\S]+)/;
        
        for (var i = 0; i < list.length; i++) {
            var matches = regEx.exec(list[i]);
            var title = matches[0].replace(/\d+\) [q ][Q ]  /, '')
                    , id = matches[1];
            stations[id] = title;
            if (i+1 === list.length) {
                p.pianode.stations = _.extend(p.pianode.stations, stations);
            }
        }
    }

};
