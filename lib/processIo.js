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
  // |>  "Die Young" by "Kesha" on "Warrior (Deluxe Version)" @ Today's Hits
  if (/\|\>  "(.+)" by "(.+)" on "(.+)" @ (.+)/.test(p.data)) {
    p.log('Song change detected!');
    var m = (p.data+'').match(/\|\>  "(.+)" by "(.+)" on "(.+)" @ (.+)/);
    var song = {
      name: m[1],
      artist: m[2],
      album: m[3],
      playlist: m[4]
    };
    p.log('Song: '+m[1]+', Artist: '+m[2]+', Album: '+m[3]+', Playlist: '+m[4]);
    p.emit('songChange', song);
    p.setState({
      running: true,
      loggedIn: true
    });
  }
  // |>  Station "QuickMix" (1057370371552570017)
  if (/\|\>  Station "(.+)" \((.+)\)/.test(p.data)) {
    p.log('Station change detected!');
    var m = (p.data+'').match(/\|\>  Station "(.+)" \((.+)\)/);
    var station = {
      name: m[1],
      id: m[2]
    };
    p.log('Station: '+station.name+', Id: '+station.id);
    p.emit('stationChange', station);
    p.setState({
      running: true,
      loggedIn: true
    });
  }
  // #   -04:24/04:31
  if (/\#   \-([0-9][0-9])\:([0-9][0-9])\/([0-9][0-9])\:([0-9][0-9])/.test(p.data)) {
    var m = (p.data+'').match(/\#   \-([0-9][0-9])\:([0-9][0-9])\/([0-9][0-9])\:([0-9][0-9])/);
    var time = {};
    time.remaining = {
      string: m[1]+':'+m[2],
      seconds: (m[1]*60) + m[2]
    };
    time.total = {
      string: m[3]+':'+m[4],
      seconds: (m[3]*60) + m[4]
    };
    time.played = {};
    time.played.seconds = time.total.seconds - time.remaining.seconds;
    time.played.string = Math.floor(time.played.seconds / 60)+':'+(time.played.seconds % 60);
    time.string = '-'+time.remaining.string+'/'+time.total.string;
    time.percent = (time.played.seconds / (time.total.seconds / 100));

    p.emit('timeChange', time);
    p.setStatus('playing');
    p.setState({
      playing: true,
      loggedIn: true,
      running: true
    });
  }
  // (i) Login...
  if (/\(i\) Login\.\.\./.test(p.data)) {
    p.setStatus('logging in');
    p.setState({
      running: true
    });
  }
  // (i) Get stations...
  if (/\(i\) Get stations\.\.\./.test(p.data)) {
    p.setStatus('receiving stations');
    p.setState({
      running: true,
      loggedIn: true
    });
  }
  // (i) Receiving new playlist...
  if (/\(i\) Receiving new playlist\.\.\./.test(p.data)) {
    p.setStatus('receiving playlist');
    p.setState({
      running: true,
      loggedIn: true
    });
  }
  // (i) Receiving explanation...
  if (/\(i\) Receiving explanation\.\.\./.test(p.data)) {
    p.setStatus('receiving explanation');
    p.setState({
      running: true,
      loggedIn: true
    });
  }
  // Network error: Timeout.
  if (/Network error\: Timeout\./.test(p.data)) {
    p.logError('Network error: Timeout.');
    p.emit('error', {
      type: 'Network error',
      text: 'Network error: Timeout.'
    });
    p.setStatus('error');
    p.setStateOff();
  }
  // Network error: TLS handshake failed.
  if (/Network error\: TLS handshake failed\./.test(p.data)) {
    p.logError('Network error: TLS handshake failed.');
    p.emit('error', {
      type: 'Network error',
      text: 'Network error: TLS handshake failed.'
    });
    p.setStatus('error');
    p.setStateOff();
  }
  // Network error: Read error.
  if (/Network error\: Read error\./.test(p.data)) {
    p.logError('Network error: Read error.');
    p.emit('error', {
      type: 'Network error',
      text: 'Network error: Read error.'
    });
    p.setStatus('error');
    p.setStateOff();
  }
  // Error: Pandora is not available in your country. Set up a control proxy (see manpage).
  if (/Error\: Pandora is not available in your country\. Set up a control proxy \(see manpage\)\./.test(p.data)) {
    p.logError('Error: Pandora is not available in your country. Set up a control proxy (see manpage).');
    p.emit('error', {
      type: 'Pianobar error',
      text: 'Error: Pandora is not available in your country. Set up a control proxy (see manpage).'
    });
    p.setStatus('error');
    p.setStateOff();
  }
  // /!\ Cannot access audio file: Forbidden.
  if (/\/\!\\ Cannot access audio file\: Forbidden\./.test(p.data)) {
    p.logError('Error: Cannot access audio file: Forbidden.');
    p.emit('error', {
      type: 'Pianobar error',
      text: 'Cannot access audio file: Forbidden.'
    });
    p.setStatus('error');
    p.setStateOff();
  }
};
