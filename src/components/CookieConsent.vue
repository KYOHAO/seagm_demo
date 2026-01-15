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
         為提供會員最優質服務，本平台會於會員端電腦放置並取用Cookies；若不願接受 Cookies寫入 ，可在瀏覽器功能中將隱私權等級設定為高，但可能會導致本平台服務有部分功能無法正常執行，或是失去參與活動之權利。          
        </p>
      </div>
      <div class="cookie-actions d-flex gap-2">
        <button @click="acceptCookies" class="btn btn-primary px-5 py-2 fw-bold text-nowrap">允許</button>
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
