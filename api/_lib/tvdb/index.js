const Tvdb = require('./tvdb.class')

module.exports = new Tvdb(process.env.TVDB_API_KEY || '60ad13a9746c1a55e532cebe2e62ac62')
