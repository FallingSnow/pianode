var childProcess = require('child_process')
        , fs = require('fs')
        , lifecycle = process.env.npm_lifecycle_event
        , installRoot = __dirname + ''
        , readline = require('readline');

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

if (lifecycle === 'preinstall') {
    // ...
    process.exit(0);
} else if (lifecycle === 'install') {

    var makeFile = fs.readFileSync(installRoot + '/../pianobar/Makefile', {encoding: 'utf-8'});
    makeFile = makeFile.replace(/\nLIBAV:=/g, '\n#LIBAV:=');

    rl.question("Supported libav implimentations are: \n" + makeFile.match(/#LIBAV:=.*/g).toString().replace(/#LIBAV:=/g, '').replace(/,/g, '\n') + '\nEnter your libav implementation', function(selection) {

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