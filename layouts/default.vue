<template>
  <div class="sans-serif pa3 white-80 mw9 center boom">
    <div class="maincontent">
      <site-header />
      <nuxt />
    </div>
    <div class="pt6 pv3 f7 tc gray flex-shrink-0">
      <p >
        <a href="https://github.com/flet/episode.lol">github</a>
        <a href="https://twitter.com/flettre">twitter</a>
      </p>
      <p>TV information and images are provided by <a href="https://TheTVDB.com">TheTVDB.com</a>, but we are not endorsed or certified by TheTVDB.com or its affiliates.</p>
    </div>
  </div>
</template>

<script>
import SiteHeader from '../components/SiteHeader'

export default {
  components: { SiteHeader }
}
</script>
<style>
html, body {
  background: #14181c;
  color: #fff;
  height: 100%;
}
.boom {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.maincontent {
  flex: 1 0 auto;
}
</style>
