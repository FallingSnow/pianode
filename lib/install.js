var childProcess = require('child_process')
        , fs = require('fs')
        , lifecycle = process.env.npm_lifecycle_event
        , installRoot = __dirname + '/../'
        , os = require('os')
        , ghdownload = require('github-download')
        , readline = require('readline')
        , path = require("path");

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

var rmdir = function (dir) {
    var list = fs.readdirSync(dir);
    for (var i = 0; i < list.length; i++) {
        var filename = path.join(dir, list[i]);
        var stat = fs.statSync(filename);

        if (filename == "." || filename == "..") {
            // pass these files
        } else if (stat.isDirectory()) {
            // rmdir recursively
            rmdir(filename);
        } else {
            // rm fiilename
            fs.unlinkSync(filename);
        }
    }
    fs.rmdirSync(dir);
};

if (lifecycle === 'preinstall') {
    // ...
    process.exit(0);
} else if (lifecycle === 'install') {

    function postMake(code) {
        // Copying pianode config
        var wr = fs.createWriteStream(installRoot + 'pianobar/config');
        fs.createReadStream(installRoot + 'lib/config').pipe(wr);
        wr.on("close", function () {
            var appends = '\nevent_command = ' + installRoot + 'lib/event_converter.sh\n\
fifo = ' + installRoot + 'pianobar/ctrl';
            fs.appendFile(installRoot + 'pianobar/config', appends, function (err) {
                if (err)
                    throw err;
                rl.question('Would you like to make a FIFO pipe to control pianobar (Optional) [y/N]: ', function (answer) {
                    if (answer.toLowerCase() === 'y') {
                        childProcess.exec('mkfifo', [installRoot + 'pianobar/ctrl'], function (err) {
                            if (err)
                                throw err;
                            console.log('Done.');
                            process.exit(code);
                        });
                    } else {
                        console.log('Done.');
                        process.exit(code);
                    }
                });
            });
        });
    }

    function makePianobar() {
        console.log('Making Pianobar...');
        // Make Pianobar (Parallel make)
        var cpus = os.cpus().length;
        var make = childProcess.spawn('make', ['-j', cpus - 1, '-C', installRoot + 'pianobar'], {
            stdio: 'inherit',
            env: process.env
        });

        make.on('close', function (code) {
            postMake(code);
        });
    }

    // Download latest source
    function downloadPianobar() {
        console.log('Downloading lastest pianobar at: ');
        ghdownload('https://github.com/PromyLOPh/pianobar.git', installRoot + 'pianobar')
                .on('dir', function (dir) {
                    console.log(dir);
                })
                .on('file', function (file) {
                    console.log(file);
                })
                .on('zip', function (zipUrl) { //only emitted if Github API limit is reached and the zip file is downloaded
                    console.log(zipUrl);
                })
                .on('error', function (err) {
                    console.error(err);
                    process.exit(1);
                })
                .on('end', function () {
                    makePianobar();
                });
    }

    if (fs.existsSync(installRoot + 'pianobar')) {
        rl.question(installRoot + 'pianobar already exists. Would you like to remove/replace this directory? (ALL FILES IN THE DIRECTORY WILL BE REMOVED) [y/N]: ', function (answer) {
            if (answer.toLowerCase() === 'y') {
                rmdir(installRoot + 'pianobar');
            } else {
                console.error(installRoot + 'pianobar must be an empty directory.');
                process.exit(1);
            }

            downloadPianobar();
        });
    } else {
        downloadPianobar();
    }

} else if (lifecycle === 'uninstall') {
    // ...
    process.exit(0);
} else {
    process.exit(1);
}