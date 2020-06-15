const axios = require('axios')
const { JWT } = require('jose')

class Tvdb {
  constructor (key) {
    this.key = key
    this.token = null

    this.request = axios.create({
      baseURL: 'https://api.thetvdb.com',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    })
  }

  async login () {
    const resp = await this.request.post('/login', {
      apikey: this.key
    })

    this.token = resp.data.token
    this.expires = JWT.decode(this.token).exp
  }

  async ensureTokenIsGood () {
    if (this.token && this.expires < this.expires - Math.floor(Date.now() / 1000)) {

    } else {
      await this.login()
    }
  }

  async searchByName (name) {
    await this.ensureTokenIsGood()

    const resp = await this.request.get('/search/series', {
      params: { name },
      headers: {
        Authorization: `Bearer ${this.token}`
      }
    })

    return resp.data
  }

  async seriesInfo (id) {
    await this.ensureTokenIsGood()

    const resp = await this.request.get(`/series/${id}`, {
      headers: {
        Authorization: `Bearer ${this.token}`
      }
    })

    return resp.data.data
  }

  async seriesEpisodes (id) {
    let episodes = []

    let nextPage = 1
    while (nextPage !== null) {
      await this.ensureTokenIsGood()

      const resp = await this.fetchEpisodes(id, nextPage)

      episodes = episodes.concat(resp.data.map(item => {
        return {
          id: item.id,
          poster: item.filename
        }
      }))
      nextPage = resp.links.next
    }

    return episodes
  }

  async fetchEpisodes (seriesId, page = 1) {
    await this.ensureTokenIsGood()

    const resp = await this.request.get(`/series/${seriesId}/episodes?page=${page}`, {
      headers: {
        Authorization: `Bearer ${this.token}`
      }
    })

    return resp.data
  }

  async episodeById (episodeId) {
    await this.ensureTokenIsGood()

    const resp = await this.request.get(`/episodes/${episodeId}`, {
      headers: {
        Authorization: `Bearer ${this.token}`
      }
    })

    return resp.data.data
  }
}

module.exports = Tvdb
