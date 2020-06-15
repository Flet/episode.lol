<template>
  <div class="sans-serif pa3 white-80 mw9 center">
    <site-header />
    <nuxt />
  </div>
</template>

<script>
import SiteHeader from '../components/SiteHeader'

export default {
  components: { SiteHeader }
}
</script>
<style>
html {
  background: #14181c;
  color: #fff;
}
</style>
