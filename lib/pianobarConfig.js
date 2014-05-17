// pianobarConfig.js
// The part of pianode which handles the pianobar configuration file

//temp:
var childProcess = require('child_process');
var fs = require('fs');
var ursa = require('ursa');
var root = '~/node/pianode';


// function PianobarConfig():
//module.exports = function (root, childProcess, fs, ursa) {
//  var conf = this;
  
  var getTlsFingerprint = function(done, error) {
    childProcess.exec(root+'/lib/get-tls-fingerprint.sh', function (errCode, stdout, stderr) {
      if(errCode === null) {
        done(stdout+'');
      } else {
        error(errCode);
      }
    });
  };

//};

/* Usage:
getTlsFingerprint(function(key) {
  console.log('Key: '+key);
}, function(code) {
  console.log('Error: '+code);
});
*/
