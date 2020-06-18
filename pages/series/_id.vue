<template>
  <article>
    <div
      v-if="searching"
      class="w-100 vh-100 content-center items-center flex"
      style="height:50vh; width; 100vh; justify-content: center"
    >
      <spinner />
    </div>
    <div
      v-else
    >
      <div class="mw8 w-100 center bg-black">
        <div
          class="aspect-ratio overflow-hidden w-100"
          style="padding-bottom: 18.6%"
        >
          <div
            role="img"
            :aria-label="`${series.info.seriesName} series`"
            class="aspect-ratio--object contain"
            :style="`background:url(https://thetvdb.com/banners/${series.info.banner}) top no-repeat;`"
          />
        </div>
        <div class="f4-l f5 tc bg-black white-90 nt1 pt2 ">
          {{ series.info.seriesName }}
        </div>
        <p class="f4 tc tracked ttu pa1 ">
          {{ series.episodes.length }} Episode{{ series.episodes.length > 2 ? 's' : '' }}
        </p>
      </div>
      <div class="f4-l f5 tc ">
        <input
          class="f3 f4-l button-reset pv3 tc bn bg-animate bg-dark-green
            hover-bg-green white pointer br2  mt0-ns"
          type="button"
          value="🎲 Pick A Random Episode"
          @click="pickEpisode"
        >
      </div>
      <episode
        v-if="pickedEpisode"
        :episode="episodeToShow"
      />
    </div>
  </article>
</template>
<script>
import axios from 'axios'
import Spinner from '../../components/Spinner'
import Episode from '../../components/Episode'

function getRandomInt (min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min // The maximum is exclusive and the minimum is inclusive
}

export default {
  components: { Spinner, Episode },
  data: () => {
    return {
      search: '',
      searching: false,
      series: null,
      pickedEpisode: null,
      seriesId: null
    }
  },
  computed: {
    episodeToShow () {
      return this.pickedEpisode
    }
  },
  created () {
    this.search = this.$route.query.search
    if (this.$route.params.id) {
      this.seriesId = this.$route.params.id
      this.fetchShow()
    }

    if (this.$route.query.pickedEpisode) {
      this.pickedEpisode = { id: this.$route.query.pickedEpisode }
    }
  },

  // when route changes and this component is already rendered,
  // the logic will be slightly different.
  beforeRouteUpdate (to, from, next) {
    if (to.query.pickedEpisode) {
      this.pickedEpisode = { id: to.query.pickedEpisode }
    }

    if (this.seriesId !== to.params.id) {
      this.seriesId = to.params.id
      this.fetchShow()
    }
    next()
  },

  methods: {
    async fetchShow () {
      this.searching = true
      this.results = null
      try {
        const resp = await axios.get(`/api/series/${this.seriesId}`)
        this.series = resp.data
      } finally {
        this.searching = false
      }
    },
    pickEpisode () {
      this.pickedEpisode = this.series.episodes[getRandomInt(0, this.series.episodes.length)]
      this.$router.replace({ path: `/series/${this.seriesId}`, query: {'pickedEpisode': this.pickedEpisode.id}} )
    }
  }
}
</script>
<style scoped>

</style>
