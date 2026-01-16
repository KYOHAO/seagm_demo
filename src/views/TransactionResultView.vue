<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const isSuccess = computed(() => route.query.status === 'success')

const title = computed(() => isSuccess.value ? '交易成功' : '交易失敗')
const message = computed(() => isSuccess.value 
    ? '您的人臉辨識驗證已通過，系統正在處理您的訂單。' 
    : '人臉辨識驗證未通過，無法完成訂單，請稍後再試。')
const icon = computed(() => isSuccess.value ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger')

const goToOrderList = () => {
    router.push('/account?tab=transactions&sub=buying')
}
</script>

<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-5">
        <div class="card shadow-sm border-0">
          <div class="card-body text-center p-5">
            <i class="bi display-1 mb-4" :class="icon"></i>
            <h2 class="fw-bold mb-3">{{ title }}</h2>
            <p class="text-muted mb-4">{{ message }}</p>
            
            <div class="d-grid gap-2">
              <button class="btn btn-primary btn-lg" @click="goToOrderList">
                前往即時訂單
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
