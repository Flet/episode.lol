<template>
  <div class="tc pt3">
    <button
      class="pa2"
      @click="pickem"
    >
      Start
    </button>
    <div class="slider">
      <div :class="`slide-track ${animatit}`">
        <div
          v-for="episode in randomEpisodes"
          :key="episode.id"
          class="slide"
        >
          <img
            :src="`https://thetvdb.com/banners/${episode.poster}`"
            alt=""
          >
        </div>
        <div
          v-for="episode in randomEpisodes"
          :key="episode.id"
          class="slide"
        >
          <img
            :src="`https://thetvdb.com/banners/${episode.poster}`"
            alt=""
          >
        </div>
      </div>
    </div>
  </div>
</template>
<script>
function getRandomInt (min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min // The maximum is exclusive and the minimum is inclusive
}

export default {
  props: { episodes: { type: Array, default: () => [] } },
  data () {
    return {
      randomEpisodes: [],
      animatit: ''
    }
  },
  created () {
    this.pickRandom()
  },
  destroyed () {
    clearInterval(this.interval)
  },
  methods: {
    pickRandom () {
      this.randomEpisodes = []
      for (let i = 0; i < 14; i++) {
        this.randomEpisodes.push(this.episodes[getRandomInt(0, this.episodes.length)])
      }
    },
    pickem () {
      this.animatit = 'slide-track-animate'
      setTimeout(() => {
        this.animatit = 'slide-track-animate slide-track-stop'
      }, 5000)
    }
  }
}
</script>
<style lang="scss" scoped>

$animationSpeed: 5s;

// Animation
@keyframes scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(calc(-250px * 7))}
}

// Styling
.slider {
  height: 100px;
  margin: auto;
  overflow:hidden;
  position: relative;
  width: 960px;

  &::before,
  &::after {
    content: "";
    height: 100px;
    position: absolute;
    width: 200px;
    z-index: 2;
  }

  &::after {
    right: 0;
    top: 0;
    transform: rotateZ(180deg);
  }

  &::before {
    left: 0;
    top: 0;
  }

  .slide-track {
    display: flex;
    width: calc(250px * 14);
  }

  .slide-track-animate {
    animation: scroll $animationSpeed linear infinite;
  }

  .slide-track-stop {
    animation: scroll $animationSpeed ease-out;
    animation-fill-mode: forwards;
  }

  .slide {
    height: 100px;
    width: 250px;
  }
}
</style>
