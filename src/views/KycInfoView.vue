<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { handleApiError } from '../utils/apiError'
import { useToast } from '../composables/useToast'
import { apiFetch } from '../utils/api'

const router = useRouter()
const toast = useToast()
const isLoading = ref(false)
const errorMessage = ref('')
const formData = ref({
  id_number: '',
  first_name: '',
  last_name: '',
  gender: 1, // 1: Male, 0: Female
  birth_date: ''
})

const handleSubmit = async () => {
  errorMessage.value = ''
  isLoading.value = true
  
  const token = localStorage.getItem('authToken')
  if (!token) {
    router.push('/login')
    return
  }

  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/kyc/info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData.value)
    })

    const data = await response.json()

    if (response.ok && data.code === 0) {
      //alert('KYC 資訊已驗證並儲存成功!')
      toast.success('KYC 資訊已驗證並儲存成功!')
      router.push('/account')
    } else {
      //errorMessage.value = handleApiError(data) || '驗證失敗，請檢查您的資訊。'
      errorMessage.value = '驗證失敗，請檢查您的資訊。'
      if (data.data && data.data.mismatches) {
        errorMessage.value += ` Mismatches: ${data.data.mismatches.join(', ')}`
      }
    }
  } catch (error) {
    //console.error('API Error:', error)
    errorMessage.value = '發生錯誤，請稍後再試。'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="container my-5">
    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-6">
        <div class="card shadow-lg border-0 rounded-3">
          <div class="card-body p-5">
            <h3 class="text-center fw-bold text-primary mb-4">請完成驗證</h3>
            <p class="text-muted text-center mb-4">
              請輸入您的個人信息，與您的身份證件上顯示的內容完全一致。
            </p>

            <div v-if="errorMessage" class="alert alert-danger py-2 small mb-3">
              {{ errorMessage }}
            </div>

            <form @submit.prevent="handleSubmit">
              <div class="mb-3">
                <label class="form-label fw-bold">身分證號</label>
                <input type="text" class="form-control" v-model="formData.id_number" required placeholder="A123456789">
              </div>

              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label fw-bold">姓氏</label>
                  <input type="text" class="form-control" v-model="formData.last_name" required placeholder="e.g. 王">
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold">名字</label>
                  <input type="text" class="form-control" v-model="formData.first_name" placeholder="e.g. Da-Ming">
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label fw-bold">性別</label>
                <div class="d-flex gap-4">
                  <div class="form-check">
                    <input class="form-check-input" type="radio" :value="1" v-model="formData.gender" id="genderMale">
                    <label class="form-check-label" for="genderMale">男</label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="radio" :value="0" v-model="formData.gender" id="genderFemale">
                    <label class="form-check-label" for="genderFemale">女</label>
                  </div>
                </div>
              </div>

              <div class="mb-4">
                <label class="form-label fw-bold">出生日期</label>
                <input type="date" class="form-control" v-model="formData.birth_date" required>
              </div>

              <div class="d-grid gap-2">
                <button type="submit" class="btn btn-primary btn-lg fw-bold" :disabled="isLoading">
                  <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {{ isLoading ? '驗證中...' : '提交驗證' }}
                </button>
                <button type="button" class="btn btn-link text-decoration-none text-muted" @click="$router.push('/account')">
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
