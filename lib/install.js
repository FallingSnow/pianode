var childProcess = require('child_process');
var lifecycle = process.env.npm_lifecycle_event;
var installRoot = __dirname+'';

if (lifecycle === 'preinstall') {
  // ...
  process.exit(0);
} else if (lifecycle === 'install') {

  var make = childProcess.spawn('make', ['-C', installRoot+'/../pianobar'], {
    stdio: 'inherit',
    env: process.env
  });

  make.on('close', function(code) {
    console.log('Done.');
    process.exit(code);
  });  
} else if (lifecycle === 'uninstall') {
  // ...
  process.exit(0);
} else {
  process.exit(1);
}
