const Tvdb = require('./tvdb.class')

module.exports = new Tvdb(process.env.TVDB_API_KEY)
