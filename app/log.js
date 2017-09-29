var logger = require('winston');

logger.addColors({
    debug: 'green',
    info:  'cyan',
    silly: 'magenta',
    verbose: 'magenta',
    warn:  'yellow',
    error: 'red'
});

logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, { level: 'error', colorize:true });

module.exports = logger;
