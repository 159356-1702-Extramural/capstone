/**
 * Global logging Config
 */

var Winston = require('winston');
var logger = new Winston.Logger({
  level: 'verbose',
  transports: [
    new Winston.transports.Console({
      timestamp: true
    }),
    // new Winston.transports.File({
    //   filename: 'logs/logfile.log',
    //   timestamp: true
    // })
  ]
});

module.exports = logger;