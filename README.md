# Pianode

Node.js package to run pianobar headless, install it and manage all settings.

## Table Of Contents
1. [Events](#events)
1. [Status values](#status-values)
1. [Functions](#functions)
1. [Objects](#objects)
1. [Error Types](#error-types)
1. [Options](#options)
1. [ToDo](#todo)

## Events
Form: `'eventName'` (parameterType **additionalParameter**)

- `'statusChange'` [(object **statusChange**)](#statuschange)
    - see [*Status Values*](#status-values)
- `'selectStation'` ()
    - automatically switching to `options.station`
- `'error'` [(object **error**)](#error)
    - see [*Error Types*](#error-types)
- `'close'` (int **code**)
- `'songChange'` [(object **song**)](#song)
- `'stationChange'` [(object **station**)](#station)
- `'timeChange'` [(object **time**)](#time)

## Status Values
- `'not running'`
- `'error'`
- `'undefined'`
- `'logging in'`
- `'playing'`
- `'receiving stations'`
- `'receiving playlist'`
- `'receiving explanation'`


## Functions
- `getStatus()`
    - returns [(object **statusChange**)](#statuschange)

    
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

## Error Types
Possible values of `error.type`:

- `'Pianobar error'`
- `'Network error'`
- `'Unknown error'`

## Options
``` javascript
var options = {
  station: 10,
  verbose: true,
  errorLog: true
};
```

## ToDo

Status  |  Message
:------:|:----------
ok      | /!\ Cannot access audio file: Forbidden.
ok      | (i) Login...
ok      | (i) Get stations...
ok      | (i) Receiving new playlist...
ok      | (i) Receiving explanation...
        | (i) No history yet.
??      | [?] Select station:
        | [?] Select song:
        | [?] What to do with this song?
ok      | &#124;>  Station "QuickMix" (1057370371552570017)
ok      | &#124;>  "Ice Ice Baby" by "Vanilla Ice" on "To The Extreme" @ 90s Pop Radio
ok      | #   -04:24/04:31
        | 0) q   90s Pop Radio
        | 0) Aerosmith - I Don't Want To Miss A Thing
        | 0) Aphrodite - Return To Jedda
ok      | Network error: Read error.
ok      | Network error: Timeout.
ok      | Network error: TLS handshake failed.
ok      | Error: Pandora is not available in your country. Set up a control proxy (see manpage).

