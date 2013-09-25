// Pianode
// node.js script to run pianobar headless

var spawn = require('child_process').spawn;
var events = require('events');
var merge = require('deepmerge');
var fs = require('fs');


var eventEmitter = new events.EventEmitter();

var options = {
  station: 10,
  verbose: true,
//  verbose: false,
  errorLog: true
};

var status = 'not running';
var prevStatus = 'undefined';
function setStatus(newStatus) {
  if (newStatus !== status) {
    // Status changed!
    var statusChange = {
      status: newStatus,
      prevStatus: status
    };
    eventEmitter.emit('statusChange', statusChange);
    prevStatus = status;
    status = newStatus;
  }
}
function getStatus() {
  return {
    status: status,
    prevStatus: prevStatus
  };
}

function log(string) {
  if(options.verbose) process.stdout.write(string);
}
function errorLog(string) {
  if(options.errorLog) process.stdout.write(string);
}

function start() {
  var pianobar = spawn('pianobar', [], {
    //stdio: 'ignore',
    stdio: 'pipe',
    env: process.env
  });

  pianobar.stdout.on('data', function(data) {
    log('' + data);

    // [?] Select station:
    if (/\[\?\] Select station:/.test(data)) {
      log('Station selection detected!\n');
    
      pianobar.stdin.write(options.station + '\n');
      pianobar.stdin.end();
    
      eventEmitter.emit('selectStation');
    }
    // |>  "Die Young" by "Kesha" on "Warrior (Deluxe Version)" @ Today's Hits
    else if (/\|\>  "(.+)" by "(.+)" on "(.+)" @ (.+)/.test(data)) {
      log('Song change detected!\n');
      var m = (data+'').match(/\|\>  "(.+)" by "(.+)" on "(.+)" @ (.+)/);
      var song = {
        name: m[1],
        artist: m[2],
        album: m[3],
        playlist: m[4]
      };
      log('Song: '+m[1]+', Artist: '+m[2]+', Album: '+m[3]+', Playlist: '+m[4]+'\n');
    
      eventEmitter.emit('songChange', song);
    }
    // |>  Station "QuickMix" (1057370371552570017)
    else if (/\|\>  Station "(.+)" \((.+)\)/.test(data)) {
      log('Station change detected!\n');
      var m = (data+'').match(/\|\>  Station "(.+)" \((.+)\)/);
      var station = {
        name: m[1],
        id: m[2]
      }
      log('Station: '+station.name+', Id: '+station.id+'\n');
    
      eventEmitter.emit('stationChange', station);
    }
    // #   -04:24/04:31
    else if (/\#   \-([0-9][0-9])\:([0-9][0-9])\/([0-9][0-9])\:([0-9][0-9])/.test(data)) {
      var m = (data+'').match(/\#   \-([0-9][0-9])\:([0-9][0-9])\/([0-9][0-9])\:([0-9][0-9])/);
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
      
      eventEmitter.emit('timeChange', time);
      setStatus('playing');
    }
    // (i) Login...
    else if (/\(i\) Login\.\.\./.test(data)) {
      setStatus('logging in');
    }
    // (i) Get stations...
    else if (/\(i\) Get stations\.\.\./.test(data)) {
      setStatus('receiving stations');
    }
    // (i) Receiving new playlist...
    else if (/\(i\) Receiving new playlist\.\.\./.test(data)) {
      setStatus('receiving playlist');
    }
    // (i) Receiving explanation...
    else if (/\(i\) Receiving explanation\.\.\./.test(data)) {
      setStatus('receiving explanation');
    }
    // Network error: Timeout.
    else if (/Network error\: Timeout\./.test(data)) {
      errorLog('Network error: Timeout.\n');
      var err = {
        type: 'Network error',
        text: 'Network error: Timeout.'
      };
      eventEmitter.emit('error', err);
      setStatus('error');
    }
    // Network error: TLS handshake failed.
    else if (/Network error\: TLS handshake failed\./.test(data)) {
      errorLog('Network error: TLS handshake failed.\n');
      var err = {
        type: 'Network error',
        text: 'Network error: TLS handshake failed.'
      };
      eventEmitter.emit('error', err);
      setStatus('error');
    }
    // Network error: Read error.
    else if (/Network error\: Read error\./.test(data)) {
      errorLog('Network error: Read error.\n');
      var err = {
        type: 'Network error',
        text: 'Network error: Read error.'
      };
      eventEmitter.emit('error', err);
      setStatus('error');
    }
    // Error: Pandora is not available in your country. Set up a control proxy (see manpage).
    else if (/Error\: Pandora is not available in your country\. Set up a control proxy \(see manpage\)\./.test(data)) {
      errorLog('Error: Pandora is not available in your country. Set up a control proxy (see manpage).\n');
      var err = {
        type: 'Pianobar error',
        text: 'Error: Pandora is not available in your country. Set up a control proxy (see manpage).'
      };
      eventEmitter.emit('error', err);
      setStatus('error');
    }
    // /!\ Cannot access audio file: Forbidden.
    else if (/\/\!\\ Cannot access audio file\: Forbidden\./.test(data)) {
      errorLog('Error: Cannot access audio file: Forbidden.');
      var err = {
        type: 'Pianobar error',
        text: 'Cannot access audio file: Forbidden.'
      };
      eventEmitter.emit('error', err);
      setStatus('error');
    }
  });

  pianobar.stderr.on('data', function(data) {
    errorLog('stderr: ' + data);
    var err = {
      type: 'Unknown error',
      text: data+''
    };
    eventEmitter.emit('error', err);
    setStatus('error');
  });

  pianobar.on('close', function(code) {
    errorLog('Exited with code ' + code + '.');
    eventEmitter.emit('close', code);
    setStatus('not running');
  });
}

exports.start = start;
exports.events = eventEmitter;
