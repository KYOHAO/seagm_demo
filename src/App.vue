<script setup>
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import FloatingSidebar from './components/FloatingSidebar.vue'
import CookieConsent from './components/CookieConsent.vue'
import { RouterView } from 'vue-router'
</script>

<template>
  <AppHeader />
  <FloatingSidebar />
  <CookieConsent />
  <main>
    <RouterView />
  </main>
  <AppFooter />
</template>

<style>
</style>
