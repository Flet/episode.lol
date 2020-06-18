<template>
  <div class="pa4-l">
    <form
      class="mw7 center mb5"
      @submit.prevent="onSubmit"
    >
      <fieldset class="cf bn ma0 pa0">
        <div class="cf">
          <label
            class="clip"
            for="show"
          >Search for a show</label>
          <input
            id="show"
            v-model="search"
            class="f6 f5-l input-reset bn fl black-80 bg-white pa3 lh-solid w-100 w-75-m w-80-l br2-ns br--left-ns"
            placeholder="Enter Show Name"
            type="text"
            name="show"
          >
          <input
            class="f6 f5-l button-reset fl pv3 tc bn bg-animate bg-dark-green
            hover-bg-green white pointer w-100 w-25-m w-20-l br2-ns br--right-ns mt2 mt0-ns"
            type="submit"
            value="🔎 Find Show"
          >
        </div>
      </fieldset>
    </form>

    <div v-if="searching">
      <spinner />
    </div>

    <div v-if="results">
      <article>
        <div
          v-for="item in results"
          :key="item.id"
        >
          <n-link
            :to="`/series/${item.id}`"
            class="fl w-50 w-25-l link overflow-hidden pa1 shadow"
          >
            <div class=" aspect-ratio aspect-ratio--4x6 overflow-hidden">
              <div class="f4 tc bg-black o-80 white-90 pa1 absolute bottom-0 z-max w-100">
                {{ item.seriesName }}
              </div>
              <div
                role="img"
                :aria-label="`${item.seriesName} series`"
                class="aspect-ratio--object cover grow"
                :style="`background:url(https://thetvdb.com${item.image}) center;`"
              />
            </div>
          </n-link>
        </div>
      </article>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import Spinner from '../components/Spinner'

export default {
  components: { Spinner },
  data: () => {
    return {
      search: '',
      searching: false,
      results: null
    }
  },
  created () {
    this.search = this.$route.query.search
    if (this.search) {
      this.searchForShow()
    }
  },
  methods: {
    onSubmit (e) {
      this.$router.push({ path: '/', query: { search: this.search } })
      this.searchForShow()
    },
    async searchForShow () {
      this.searching = true
      this.results = null
      try {
        const resp = await axios.get(`/api/search?q=${this.search}`)
        this.results = resp.data
      } finally {
        this.searching = false
      }
    }
  }
}
</script>

<style scoped>
</style>
