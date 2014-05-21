#!/bin/bash

fold=$(dirname $0)
interpreter="$fold/interpreter.sock"
while read L; do
        k="`echo "$L" | cut -d '=' -f 1`"
        v="`echo "$L" | cut -d '=' -f 2`"
        export "$k=$v"
done < <(grep -e '^\(title\|artist\|album\|stationName\|pRet\|pRetStr\|wRet\|wRetStr\|songDuration\|songPlayed\|rating\|songDuration\|songPlayed\|coverArt\|stationCount\|station[0-9]\+\)=' /dev/stdin)

case "$1" in
        songstart)
        echo -e '{"artist":"$artist", "title":"$title", "station":"$stationName", "rating":"$rating", "art":"$coverArt", "album":"$album"}\r\n' | socat unix-connect:"$interpreter" STDIO
;;
        songlove)
        echo -e '{"artist":"$artist", "title":"$title", "station":"$stationName", "rating":"$rating", "art":"$coverArt", "album":"$album"}\r\n' | socat unix-connect:"$interpreter" STDIO
;;
esac