<script setup>
import { ref, onMounted } from 'vue'

const showBanner = ref(false)

onMounted(() => {
  const consent = localStorage.getItem('seagm_cookie_consent')
  if (!consent) {
    showBanner.value = true
  }
})

const acceptCookies = () => {
  localStorage.setItem('seagm_cookie_consent', 'true')
  showBanner.value = false
}
</script>

<template>
  <div v-if="showBanner" class="cookie-banner fixed-bottom bg-dark text-white p-4 shadow-lg">
    <div class="container d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
      <div class="cookie-text">
        <p class="mb-0 small">
          We use cookies to improve your experience on our website. By continuing to browse the site, you agree to our use of cookies.
          <a href="#" class="text-info text-decoration-none">Privacy Policy</a>
        </p>
      </div>
      <div class="cookie-actions d-flex gap-2">
        <button @click="acceptCookies" class="btn btn-primary btn-sm px-4 fw-bold">Allow All</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cookie-banner {
  z-index: 1050; /* Above most things, but maybe below some modals */
  border-top: 1px solid #444;
}
</style>
