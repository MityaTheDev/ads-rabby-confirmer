/* ========================================================================= */
const pino = require('pino');
const logger = pino({
  transport: {
    target: 'pino-pretty'
  },
  options: {
    colorize: true
  }
});

/* ========================================================================= */
const log = (message) => logger.info(message);
const error = (message) => logger.error(message);
const warn = (message) => logger.warn(message);

/* ========================================================================= */
// Logger export
exports.log = log;
exports.warn = warn;
exports.error = error;

/* ========================================================================= */
// logger test

/*
console = require('./src/logger'); 
console.log({123: "KEK", 13: [1, '2', 3]});
[14:00:22.757] INFO (20204):
    13: [
      1,
      "2",
      3
    ]
    123: "KEK"
*/