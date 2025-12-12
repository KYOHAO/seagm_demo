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
         我們尊重您的個資隱私
我們使用 Cookie 保證您最佳的瀏覽體驗，Cookie 既適用於保存必要的基本資訊，也可以確保我們為您提供最合適的相關内容。若您同意接受所有的 Cookie，我們將可進一步提升您的網路體驗。請注意，部分為第三方 Cookie，您可以點擊下方按鈕，調整 Cookie 偏好設定。更多詳情，請參閱我們的 
<a href="#" class="text-info text-decoration-none">Cookie 政策</a>。
          
        </p>
      </div>
      <div class="cookie-actions d-flex gap-2">
        <button @click="acceptCookies" class="btn btn-primary btn-sm px-4 fw-bold">接受</button>
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
