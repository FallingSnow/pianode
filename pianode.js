// Pianode
// node.js script to run pianobar headless

var spawn = require('child_process').spawn;
var events = require('events');
var deepmerge = require('deepmerge');
var fs = require('fs');
var processIo = require('./lib/processIo.js');
var pianodeRoot = __dirname+'';

function Pianode(userOptions) {
  var pianode = this;
  events.EventEmitter.call(pianode);

  var options = {
    station: 'Q',
    verbose: false,
    logErrors: true
  };
  if(userOptions) {
    options = deepmerge(options, userOptions);
  }

  var state = {};
  var setState = function(newState) {
    state = deepmerge(state, newState);
  };
  var setStateOff = function() {
    setState({
      running: false,
      loggedIn: false,
      playing: false
    });
  };
  setStateOff();
  var getState = function() {
    return state;
  };
  pianode.getState = getState;

  var status = 'not running';
  var prevStatus = 'undefined';
  var setStatus = function(newStatus) {
    if (newStatus !== status) {
      pianode.emit('statusChange', {
        status: newStatus,
        prevStatus: status
      });
      prevStatus = status;
      status = newStatus;
    }
  };
  var getStatus = function() {
    return {
      status: status,
      prevStatus: prevStatus
    };
  };
  pianode.getStatus = getStatus;

  var log = function(message) {
    if(options.verbose) console.log(message);
  };
  var logError = function(message) {
    if(options.logErrors) console.log(message);
  };

  var pianobar = null;
  var pianobarPath = pianodeRoot+'/pianobar/pianobar';
  var pianobarConfigPrefix = pianodeRoot; // resulting in [prefix]/pianobar/config

  pianode.start = function() {
    pianobar = spawn(pianobarPath, [ ], {
      stdio: 'pipe',
      env: deepmerge(process.env, {
        XDG_CONFIG_HOME: pianobarConfigPrefix
      })
    });

    pianobar.stdout.on('data', function(data) {
      log('' + data);

      // Call routes
      processIo({
        data: data,
        write: function(data) {
          pianobar.stdin.write(data + '\n');
          pianobar.stdin.end();
        },
        emit: function(event, obj) {
          pianode.emit(event, obj);
        },
        setStatus: setStatus,
        log: log,
        logError: logError,
        options: options,
        getState: getState,
        setState: setState,
        setStateOff: setStateOff
      });
    });

    pianobar.stderr.on('data', function(data) {
      logError('Pianobar error: ' + data);
      pianode.emit('error', {
        type: 'Unknown error',
        text: data+''
      });
      setStatus('error');
      setStateOff();
    });

    pianobar.on('close', function(code) {
      logError('Pianobar exited with code ' + code + '.');
      pianode.emit('close', code);
      setStatus('not running');
      setStateOff();
    });
  };

  process.on('exit', function() {
    if(pianobar) {
      log('Pianode closing. Killing pianobar.');
      pianobar.kill();
    }
    setStatus('not running');
    setStateOff();
    pianode.emit('exit');
  });
}
Pianode.prototype.__proto__ = events.EventEmitter.prototype;
module.exports = Pianode;
