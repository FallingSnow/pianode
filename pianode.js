// Pianode
// node.js script to run pianobar headless

var spawn = require('child_process').spawn
        , events = require('events')
        , _ = require('underscore')
        , fs = require('fs')
        , processIo = require('./lib/processIo.js')
        , pianodeRoot = __dirname
        , functions = require('./lib/functions.js')
        , net = require('net')
        , sock
        , sockPath = pianodeRoot + '/pianobar/interpreter.sock';

function Pianode(userOptions) {
    var pianode = this;

    pianode.currentInfo = {};
    pianode.stations = {};

    // Create socket file for events
    pianode.socket = net.createServer(function(c) { //'connection' listener
        console.log('Socket: Created');
        c.on('data', function(data) {
            options = _.extend(options, userOptions);
            pianode.currentInfo = _.extend(pianode.currentInfo, JSON.parse(data.toString()));
        }).on('error', function(err) {
            console.error('Socket error:', err);
        }).end('end', function() {
            console.log('Socket: End of data');
        });
    });

    pianode.socket.socketConnections = [];
    pianode.socket.on('connection', function(socket) {
        pianode.socket.socketConnections.push(socket);
    });

    pianode.socket.on('error', function(e) {
        if (e.code === 'EADDRINUSE') {
            var clientSocket = new net.Socket();
            clientSocket.on('error', function(e) { // handle error trying to talk to server
                if (e.code === 'ECONNREFUSED') {  // No other server listening
                    fs.unlinkSync(sockPath);
                    pianode.socket.listen(sockPath, function() { //'listening' listener
                        console.log('Socket: Server recovered');
                    });
                }
                clientSocket.connect({path: sockPath}, function() {
                    throw 'Socket: Running, giving up...';
                });
            });
        }
    });

    pianode.socket.listen(sockPath, function() {
        console.log('Socket: Listening!');
    });

    events.EventEmitter.call(pianode);

    // Check if userOptions hold all neccessary fields
    if (!(userOptions.password && userOptions.email)) {
        throw 'Pianode error: You have to specify pandora.com credentials.';
    }

    var options = {
        station: 'Q',
        verbose: false,
        logErrors: true,
        password: '',
        email: ''
    };
    if (userOptions) {
        options = _.extend(options, userOptions);
    }

    var state = {};
    var setState = function(newState) {
        state = _.extend(state, newState);
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
            prevStatus = status;
            status = newStatus;
            pianode.emit('statusChange', {
                status: newStatus,
                prevStatus: status
            });
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
        if (options.verbose)
            console.log(message);
    };
    var logError = function(message) {
        if (options.logErrors)
            console.log(message);
    };

    var pianobar = null
            , pianobarPath = pianodeRoot + '/pianobar/pianobar';

    // Functions
    pianode.playPause = functions.playPause;
    pianode.play = functions.play;
    pianode.pause = functions.pause;
    pianode.next = functions.next;
    pianode.love = functions.love;
    pianode.ban = functions.ban;
    pianode.history = functions.history;
    //pianode.upcoming = functions.upcoming;
    pianode.explain = functions.explain;
    pianode.createStation = functions.createStation;
    pianode.createStationFrom = functions.createStationFrom;
    pianode.addMusicToStation = functions.addMusicToStation;
    pianode.getStationList = functions.getStationList;
    pianode.changeStation = functions.changeStation;


    pianode.start = function() {

        pianobar = spawn(pianobarPath, [], {
            stdio: 'pipe',
            env: _.extend(process.env, {
                XDG_CONFIG_HOME: pianodeRoot // results in [pianodeRoot]/pianobar/config
            })
        });

        functions.setUp({
            write: function(data) {
                pianobar.stdin.write(data + '\n');
                //pianobar.stdin.end();
            },
            setStatus: setStatus,
            getStatus: function() {
                return status;
            },
            setState: setState
        });

        pianobar.stdout.on('data', function(data) {
            log(data.toString());

            // Call routes
            processIo({
                data: data.toString(),
                write: function(data) {
                    pianobar.stdin.write(data + '\n');
                    //pianobar.stdin.end();
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
                setStateOff: setStateOff,
                pianode: pianode
            });
        });

        pianobar.stderr.on('data', function(data) {
            logError('Pianobar error: ' + data);
            pianode.emit('error', {
                type: 'Unknown error',
                text: data + ''
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

    pianode.stop = function() {
        if (pianode.stopping)
            return;
        pianode.stopping = true;
        if (pianobar) {
            log('Pianode closing. Killing pianobar.');
            pianobar.kill();
        }
        setStatus('not running');
        setStateOff();
        pianode.emit('exit');

        pianode.socket.close();

        setTimeout(function() {
            process.exit();
        }, 300);
    };

    process.on('exit', pianode.stop);
    process.on('SIGINT', pianode.stop);

}
Pianode.prototype.__proto__ = events.EventEmitter.prototype;
module.exports = Pianode;
