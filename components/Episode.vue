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
      <h2>
        {{ epData.episodeName }}
      </h2>
      <h3>Season {{ epData.airedSeason }}, Episode {{ epData.airedEpisodeNumber }}</h3>
      {{ epData.overview }}
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
