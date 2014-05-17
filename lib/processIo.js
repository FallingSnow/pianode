// processIo.js
// The part of pianode which processes the stdio of the pianobar process.

module.exports = function(p) {
    // [?] Select station:
    if (/\[\?\] Select station:/.test(p.data)) {
        p.log('Station selection detected!');
        p.write(p.options.station);
        p.emit('selectStation');
        p.setState({
            running: true,
            loggedIn: true
        });
    }
    // (i) We're playing this track because
    else if (/\(i\) We're playing this track because .+/.test(p.data)) {
        p.setState({
            lastExplination: (p.data + '').match(/\(i\) We're playing this track because .+/)
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
    }
    // |>  "Die Young" by "Kesha" on "Warrior (Deluxe Version)" @ Today's Hits
    else if (/\|\>  "(.+)" by "(.+)" on "(.+)" @ (.+)/.test(p.data)) {
        p.log('Song change detected!');
        var m = (p.data + '').match(/\|\>  "(.+)" by "(.+)" on "(.+)" @ (.+)/);
        var song = {
            name: m[1],
            artist: m[2],
            album: m[3],
            playlist: m[4]
        };
        p.log('Song: ' + m[1] + ', Artist: ' + m[2] + ', Album: ' + m[3] + ', Playlist: ' + m[4]);
        p.emit('songChange', song);
    }
    // |>  Station "QuickMix" (1057370371552570017)
    else if (/\|\>  Station "(.+)" \((.+)\)/.test(p.data)) {
        p.log('Station change detected!');
        var m = (p.data + '').match(/\|\>  Station "(.+)" \((.+)\)/);
        var station = {
            name: m[1],
            id: m[2]
        };
        p.log('Station: ' + station.name + ', Id: ' + station.id);
        p.emit('stationChange', station);
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
            history = p.data.toString().match(/\d+\) .+ \- .+[\S]+/g);
        } else {
            history = [];
        }
        
        p.setState({
            history: history
        });
        p.setStatus('received history');
    }
    // #   -04:24/04:31
    else if (/\#   \-([0-9]{2})\:([0-9]{2})\/([0-9]{2})\:([0-9]{2})/.test(p.data)) {
        var m = (p.data + '').match(/\#   \-([0-9]{2})\:([0-9]{2})\/([0-9]{2})\:([0-9]{2})/);
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
        time.played.string = Math.floor(time.played.seconds / 60) + ':' + (time.played.seconds % 60);
        time.string = '-' + time.remaining.string + '/' + time.total.string;
        time.percent = (time.played.seconds / (time.total.seconds / 100));

        p.emit('timeChange', time);
        p.setStatus('playing');
        p.setState({
            playing: true
        });
    }
    // (i) Login...
    else if (/\(i\) Login\.\.\./.test(p.data)) {
        p.setStatus('logging in');
        p.setState({
            running: true
        });
    }
    // (i) Get stations...
    else if (/\(i\) Get stations\.\.\./.test(p.data)) {
        p.setStatus('receiving stations');
    }
    // (i) Receiving new playlist...
    else if (/\(i\) Receiving new playlist\.\.\./.test(p.data)) {
        p.setStatus('receiving playlist');
    }
    // (i) Receiving explanation...
    else if (/\(i\) Receiving explanation\.\.\./.test(p.data)) {
        p.setStatus('receiving explanation');
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
    else if (/\d+\) [q ][Q ]  .+[\S]+/.test(p.data)) {
        
        p.setState({
            stations: (p.data + '').match(/\d+\) [q ][Q ]  .+[\S]+/g)
        });
        p.setStatus('received stations');
    }
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

};
