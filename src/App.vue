<script setup>
import { RouterView } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import FloatingSidebar from './components/FloatingSidebar.vue'
import CookieConsent from './components/CookieConsent.vue'
import GlobalToast from './components/GlobalToast.vue'
import AppFooter from './components/AppFooter.vue'
</script>

<template>
  <AppHeader />
  <FloatingSidebar />
  <CookieConsent />
  <GlobalToast />
  <main>
    <RouterView />
  </main>
  <AppFooter />
</template>

<style>
</style>
