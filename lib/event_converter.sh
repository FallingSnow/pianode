#!/bin/bash

fold=$(dirname $0)
interpreter="$fold/../pianobar/interpreter.sock"
while read L; do
        k="`echo "$L" | cut -d '=' -f 1`"
        v="`echo "$L" | cut -d '=' -f 2`"
        export "$k=$v"
done < <(grep -e '^\(title\|artist\|album\|stationName\|pRet\|pRetStr\|wRet\|wRetStr\|songDuration\|songPlayed\|rating\|songDuration\|songPlayed\|coverArt\|stationCount\|station[0-9]\+\)=' /dev/stdin)

EVENT='{"artist":"'$artist'", "title":"'$title'", "station":"'$stationName'", "rating":"'$rating'", "art":"'$coverArt'", "album":"'$album'"}'

case "$1" in
        songstart)
        echo -e $EVENT'\r\n' | socat unix-connect:"$interpreter" STDIO
;;
        songlove)
        echo -e $EVENT'\r\n' | socat unix-connect:"$interpreter" STDIO
;;
esac