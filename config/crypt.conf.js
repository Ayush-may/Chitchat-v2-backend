const Cryptr = require('cryptr')

const cryptr = new Cryptr(process.env.ENCRYPT_SECRET);

module.exports = cryptr