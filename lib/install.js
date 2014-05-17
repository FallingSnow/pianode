var childProcess = require('child_process')
        , fs = require('fs')
        , lifecycle = process.env.npm_lifecycle_event
        , installRoot = __dirname + '';

if (lifecycle === 'preinstall') {
    // ...
    process.exit(0);
} else if (lifecycle === 'install') {

    var makeFile = fs.readFileSync(installRoot + '/../pianobar/Makefile', {encoding: 'utf-8'});
    makeFile = makeFile.replace(/\nLIBAV:=/g, '\n#LIBAV:=');
    
    ask("Supported libav implimentations are: \n" + makeFile.match(/#LIBAV:=.*/g).toString().replace(/#LIBAV:=/g, '').replace(/,/g, '\n') + '\nEnter your libav implementation', /.+/, function(selection) {

        makeFile = makeFile.replace('#LIBAV:=' + selection, 'LIBAV:=' + selection);
        fs.writeFileSync(installRoot + '/../pianobar/Makefile', makeFile);
        console.log('Implimentation saved to Makefile!');

        var make = childProcess.spawn('make', ['-C', installRoot + '/../pianobar'], {
            stdio: 'inherit',
            env: process.env
        });

        make.on('close', function(code) {
            console.log('Done.');
            process.exit(code);
        });
    });


} else if (lifecycle === 'uninstall') {
    // ...
    process.exit(0);
} else {
    process.exit(1);
}

function ask(question, format, callback) {
    var stdin = process.stdin, stdout = process.stdout;

    stdin.resume();
    stdout.write(question + ": ");

    stdin.once('data', function(data) {
        data = data.toString().trim();

        if (format.test(data)) {
            callback(data);
        } else {
            stdout.write("It should match: " + format + "\n");
            ask(question, format, callback);
        }
    });
}