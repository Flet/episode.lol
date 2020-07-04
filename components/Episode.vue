<template>
  <div
    v-if="searching"
    class="w-100 content-center items-center pt5"
    style="justify-content: center"
  >
    <spinner />
  </div>
  <div v-else class="flex justify-center">
    <div class="ma3 w-80 ba b--mid-gray pa3">
      <div class="tc">
        <img
          :src="epData.filename ? `https://thetvdb.com/banners/${epData.filename}`: ''"
        >
      </div>
      <div class="tc f2">
        {{ epData.episodeName }}
      </div>
      <div class="f4 tc">Season {{ epData.airedSeason }}, Episode {{ epData.airedEpisodeNumber }}</div>

      <dl class="lh-title pa4 mt0">
        <dt class="f6 b">Overview</dt>
        <dd class="ml0 pb2">{{ epData.overview }}</dd>
        <dt class="f6 b mt2">First Aired</dt>
        <dd class="ml0 pb2">{{ epData.firstAired }}</dd>
        <dt class="f6 b mt2">Directed By</dt>
        <dd class="ml0 pb2">
          <span v-for="(person, index) in epData.directors" :key="person">
            <a :href="`https://www.imdb.com/find?q=${person}`">{{person}}</a><span v-if="index < (epData.directors.length-1)">, </span>
          </span>
        </dd>
         <dt class="f6 b mt2">Written By</dt>
        <dd class="ml0 pb2">
          <span v-for="(person, index) in epData.writers" :key="person">
            <a :href="`https://www.imdb.com/find?q=${person}`">{{person}}</a><span v-if="index < (epData.writers.length-1)">, </span>
          </span>
        </dd>
        <dt class="f6 b mt2">Guest Stars</dt>
        <dd class="ml0 pb2">
          <span v-for="(person, index) in epData.guestStars" :key="person">
            <a target="_blank" :href="`https://www.imdb.com/find?q=${person}`">{{person}}</a><span v-if="index < (epData.guestStars.length-1)">, </span>
          </span>
        </dd>
      </dl>

    </div>
  </div>
</template>
<script>
import axios from 'axios'
import Spinner from './Spinner'

export default {
  components: { Spinner },
  props: { episode: { type: Object, default: () => {} } },
  data () {
    return {
      searching: true,
      epData: null
    }
  },
  computed: {
    epId () {
      return this.episode.id
    }
  },
  watch: {
    episode: async function (newVal, oldVal) { // watch it
      if (newVal) {
        this.fetchEpisode()
      }
    }
  },
  created () {
    this.fetchEpisode()
  },
  methods: {
    people (names) {
      if (!names || names.length < 1) return ''
      return names
        .map(n => `${n} (<a taget="_blank" href="https://www.imdb.com/find?q=${n}">imdb</a>)`)
        .join(', ')
    },
    async fetchEpisode () {
      this.searching = true
      this.results = null
      try {
        const resp = await axios.get(`/api/episode/${this.episode.id}`)
        this.epData = resp.data
      } finally {
        this.searching = false
      }
    }
  }
}
</script>
<style scoped>

</style>
