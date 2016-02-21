var childProcess = require('child_process')
        , fs = require('fs')
        , path = require('path')
        , lifecycle = process.env.npm_lifecycle_event
        , installRoot = path.resolve(__dirname, '../')
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


    function postMake() {
        // Copying pianode config
        var wr = fs.createWriteStream(path.resolve(installRoot, 'pianobar/config'));
        fs.createReadStream(path.resolve(installRoot, 'lib/config')).pipe(wr);
        wr.on("close", function () {
            var appends = '\nevent_command = ' + path.resolve(installRoot, 'lib/event_converter.sh') + '\n\
fifo = ' + path.resolve(path.resolve(installRoot, 'pianobar/ctrl'));
            fs.appendFile(path.resolve(installRoot, 'pianobar/config'), appends, function (err) {
                if (err)
                    throw err;
                rl.question('Would you like to make a FIFO pipe to control pianobar (Optional) [y/N]: ', function (answer) {
                    if (answer.toLowerCase() === 'y') {
                        childProcess.exec('mkfifo ctrl',{
                            cwd: path.resolve(installRoot, 'pianobar')
                        }, function (err) {
                            if (err)
                                throw err;
                            console.log('Done.');
                            process.exit(0);
                        });
                    } else {
                        console.log('Done.');
                        process.exit(0);
                    }
                });
            });
        });
    }

    function makePianobar() {
        console.log('Making Pianobar...');
        // Make Pianobar (Parallel make)
        var cpus = os.cpus().length;
        fs.createReadStream(path.resolve(installRoot, 'pianobar-binding.gyp')).pipe(fs.createWriteStream(path.resolve(installRoot, 'pianobar/binding.gyp')));
//            var make = childProcess.spawn('node', ['node_modules/node-gyp/bin/node-gyp.js', 'rebuild', '-j', cpus - 1], {
//                stdio: 'inherit',
//                env: process.env,
//                cwd: path.resolve(installRoot, 'pianobar')
//            });
        var make = childProcess.spawn('make', ['-j', cpus - 1], {
            stdio: 'inherit',
            env: process.env,
            cwd: path.resolve(installRoot, 'pianobar')
        });

        make.on('close', function (code) {
            if (code) {
                console.error('Make exited with error code:', code);
                process.exit(0);
            }
            postMake();
        });
    }

    // Download latest source
    function downloadPianobar() {
        console.log('Downloading lastest pianobar at: ');
        ghdownload('https://github.com/PromyLOPh/pianobar.git', path.resolve(installRoot, 'pianobar'))
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

    if (fs.existsSync(path.resolve(installRoot, 'pianobar'))) {
        rl.question(path.resolve(installRoot, 'pianobar') + ' already exists. Would you like to remove/replace this directory? (ALL FILES IN THE DIRECTORY WILL BE REMOVED) [y/N]: ', function (answer) {
            if (answer.toLowerCase() === 'y') {
                rmdir(path.resolve(installRoot, 'pianobar'));
            } else {
                console.error(installRoot + 'pianobar must be an empty directory.');
                process.exit(1);
            }

            downloadPianobar();
        });
    } else {
        downloadPianobar();
    }

} else if (lifecycle === 'postinstall') {


} else if (lifecycle === 'uninstall') {
    // ...
    process.exit(0);
} else {
    process.exit(1);
}