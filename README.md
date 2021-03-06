# Pianode

[Node.js](http://nodejs.org/) package to run [pianobar](https://github.com/PromyLOPh/pianobar) (a [pandora.com](http://www.pandora.com/) console client) headless, install it and manage all settings.

## Table Of Contents
1. [Installation](#installation)
1. [Events](#events)
1. [Status values](#status-values)
1. [Functions](#functions)
1. [Objects](#objects)
1. [Error Types](#error-types)
1. [Options](#options)
1. [ToDo](#todo)

## Installation

To use this package within your own application, just add it to your application's dependencies (package.json) and run `npm install` in your application's directory.

You can also install it seperately in your current directory with `npm install https://github.com/FallingSnow/pianode/archive/master.tar.gz`

The only thing you have to make sure additionally is that the listed lib dependencies are installed:

- libao-dev
- libmad0-dev
- libfaad-dev
- libgnutls-dev
- libjson0-dev
- libgcrypt11-dev
- socat

Socat is used for interproccess unix socket communication between pianobar and pianode.

If your distribution uses `apt` just run this command, if not find and install the above listed packages in the available package manager. They are available for a lot of other distributions under the same name.

``` bash
sudo apt-get install libao-dev libmad0-dev libfaad-dev libgnutls-dev libjson0-dev libgcrypt11-dev socat
```

Next run this installation script for pianobar using `node lib/install.js`

All other dependencies (including pianobar itself) will be installed automatically with `npm`.
Pianode won't mess with your local pianobar installation (if you have one), it builds a totally new one and won't touch your configuration files at all, it loads the configuration from inside the pianode packagefiles (pianode/pianobar/config).

## Events
Form: `'eventName'` (parameterType **additionalParameter**)

- `'statusChange'` [(object **statusChange**)](#statuschange)
    - see [*Status Values*](#status-values)
- `'selectStation'` ()
    - automatically switching to `options.station`
- `'error'` [(object **error**)](#error)
    - see [*Error Types*](#error-types)
- `'close'` (int **code**)
- `'exit'` ()
- `'songChange'` [(object **song**)](#song)
- `'stationChange'` [(object **station**)](#station)
- `'timeChange'` [(object **time**)](#time)
- `'emailRequest'`
- `'passwordRequest'`

## Status Values
- `'not running'`
- `'error'`
- `'undefined'`
- `'logging in'`
- `'playing'`
- `'paused'`
- `'receiving stations'`
- `'receiving playlist'`
- `'receiving explanation'`


## Functions

- `start()`
    - Starts the pianobar client as child process
- `getStatus()`
    - returns [(object **statusChange**)](#statuschange)
- `getState()`
    - returns (object **state**)
- `on(event, callback)`
    - The callback is called with a specific object as parameter when the given event occurrs
    
    
## Objects

### `error`
``` javascript
var error = {
  type: 'errorType',
  text: 'errorMessage'
};
```
see [*Error Types*](#error-types)

### `song`
``` javascript
var song = {
  name: '',
  artist: '',
  album: '',
  playlist: ''
};
```

### `station`
``` javascript
var station = {
  name: '',
  id: ''
};
```

### `time`
``` javascript
var time = {
  string: '',
  percent: 0,
  remaining: {
    string: '',
    seconds: 0
  },
  total: {
    string: '',
    seconds: 0
  },
  played: {
    string: '',
    seconds: 0
  }
};
```

### `statusChange`
``` javascript
var statusChange = {
  status: '',
  prevStatus: ''
};
```
see [*Status Values*](#status-values)

### `currentInfo`
``` javascript
var currentInfo = {
  album: "...",
  art: "...",
  artist: "...",
  rating: "0-10",
  station: "...",
  title: "..."
};
```

### `stationsList`
``` javascript
var stationsList = {
  0: "... Radio"
  1: "... Radio",
  2: "... Radio",
  3: "... Radio",
  4: "QuickMix"
};
```

## Error Types
Possible values of `error.type`:

- `'Pianobar error'`
- `'Network error'`
- `'Unknown error'`

## Options
``` javascript
var options = {
  station: Q, (integer or Q for quickmix)
  verbose: true,
  errorLog: true,
  startPaused: false,
};
```

## ToDo

**Problems:**
- pianobarConfig.js
- Swap proxys
- How do upvoted songs appear?
    - in Songlist
    - when playing
- Windows support with [thedmd/pianobar-windows](https://github.com/thedmd/pianobar-windows)?
    - neccessary to build on target maschine every time or are binarys enough
    - config named pianobar.cfg
    - executable?

**Pianobar statusmessage coverage**

Status  |  Message
:------:|:----------
ok      | /!\ Cannot access audio file: Forbidden.
ok      | (i) Login...
ok      | (i) Get stations...
ok      | (i) Receiving new playlist...
ok      | (i) Receiving explanation...
        | (i) No history yet.
ok      | [?] Select station:
        | [?] Select song:
        | [?] What to do with this song?
ok      | [?] Password:
ok      | [?] Email:
ok      | &#124;>  Station "QuickMix" (1057370371552570017)
ok      | &#124;>  "Ice Ice Baby" by "Vanilla Ice" on "To The Extreme" @ 90s Pop Radio
ok      | #   -04:24/04:31
ok      | 0) q   90s Pop Radio
ok      | 0) Q   90s Pop Radio
ok      | 0)     90s Pop Radio
        | 0) Aerosmith - I Don't Want To Miss A Thing
        | 0) Aphrodite - Return To Jedda
ok      | Network error: Read error.
ok      | Network error: Timeout.
ok      | Network error: TLS handshake failed.
ok      | Error: Pandora is not available in your country. Set up a control proxy (see manpage).

**Functions:**

- Standalone
    - ~~playPause()~~
    - ~~play()~~
    - ~~pause()~~
    - ~~next()~~
    - ~~love()~~
    - ~~ban()~~
    - volumeUp()
    - volumeDown()
    - volumeReset()
    - tired()
    - selectQuickMix() *???*
    - quit()
    - bookmark() *???*
    - stationCreateFromSong() *???*
- Emitting events
    - history()
        - how to differ from upcoming?
        - *"no history yet"* possible!
    - upcoming()
        - how to differ from history?
    - songExplain()
    - songInfo()
- Requesting input
    - changeStation(identifier)
    - songMove(newStation) *???*
    - stationCreate() *???*
    - stationDelete() *???*
    - stationRename() *???*
    - manageStation() *???*
    - stationAddMusic() *???*
    - stationAddByGenre() *???*
