<script setup>
import { ref } from 'vue'
import { ERROR_MESSAGES } from '../utils/errorMessages'
import { useRouter } from 'vue-router'
import { useToast } from '../composables/useToast'
import { handleApiError } from '../utils/apiError'
import { apiFetch } from '../utils/api'

const router = useRouter()
const toast = useToast()
const step = ref(1) // 1: Phone Input, 2: Reset Password
const phoneNumber = ref('')
const verificationCode = ref('')
const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const handlePhoneSubmit = async () => {
  errorMessage.value = ''
  if (!phoneNumber.value) {
    errorMessage.value = '請輸入您的手機號碼。'
    return
  }

  // Basic validation for Taiwan phone number (09xxxxxxxx)
  const phoneRegex = /^09\d{8}$/
  if (!phoneRegex.test(phoneNumber.value)) {
    errorMessage.value = '請輸入有效的手機號碼。 格式為 09xxxxxxxx'
    return
  }

  isLoading.value = true
  try {
    const response = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/forgot-password`, {
      method: 'POST',
      body: JSON.stringify({
        phone_number: phoneNumber.value
      })
    })

    const data = await response.json()

    if (response.ok && data.code === 0) {
      step.value = 2
      //alert(data.msg || '驗證碼已發送成功。')
      toast.success(data.msg || '驗證碼已發送成功。')
    } else {
      errorMessage.value = handleApiError(data) || '驗證碼發送失敗。'
    }
  } catch (error) {
    console.error('API Error:', error)
    errorMessage.value = ERROR_MESSAGES.GENERAL_ERROR_CONTACT
  } finally {
    isLoading.value = false
  }
}

const handleResetSubmit = async () => {
  errorMessage.value = ''
  if (password.value !== confirmPassword.value) {
    errorMessage.value = '密碼不一致。'
    return
  }
  if (password.value.length < 8) {
    errorMessage.value = '密碼至少需要8位。'
    return
  }
  if (!verificationCode.value) {
    errorMessage.value = '請輸入驗證碼。'
    return
  }

  isLoading.value = true
  try {
    const response = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({
        phone_number: phoneNumber.value,
        verification_code: verificationCode.value,
        password: password.value,
        password_confirmation: confirmPassword.value
      })
    })

    const data = await response.json()

    if (response.ok && data.code === 0) {
      //alert(data.msg || '密碼重置成功。請登入。')
      toast.success('密碼重置成功。請登入。')
      router.push('/login')
    } else {
      errorMessage.value = handleApiError(data) || '密碼重置失敗。'
    }
  } catch (error) {
    console.error('API Error:', error)
    errorMessage.value = ERROR_MESSAGES.GENERAL_ERROR_CONTACT
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="container my-5">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-5">
        <div class="card shadow-lg border-0 rounded-3">
          <div class="card-body p-5">
            <h3 class="text-center fw-bold text-primary mb-4">
              {{ step === 1 ? '忘記密碼' : '重置密碼' }}
            </h3>

            <!-- Step 1: Phone Number -->
            <form v-if="step === 1" @submit.prevent="handlePhoneSubmit">
              <p class="text-muted text-center mb-4">
                請輸入您的手機號碼，以接收重置驗證碼。
              </p>
              <div class="mb-4">
                <label class="form-label fw-bold">手機號碼</label>
                <div class="input-group">
                  <span class="input-group-text bg-light border-end-0">
                    <i class="bi bi-phone"></i>
                  </span>
                  <input 
                    type="tel" 
                    class="form-control border-start-0 ps-0" 
                    placeholder="09xxxxxxxx" 
                    v-model="phoneNumber" 
                    required
                  >
                </div>
              </div>

              <div v-if="errorMessage" class="alert alert-danger py-2 small">
                {{ errorMessage }}
              </div>

              <div class="d-grid gap-2">
                <button type="submit" class="btn btn-primary btn-lg fw-bold" :disabled="isLoading">
                  <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {{ isLoading ? '發送中...' : '發送驗證碼' }}
                </button>
                <button type="button" class="btn btn-link text-decoration-none text-muted" @click="$router.push('/login')">
                  返回登入
                </button>
              </div>
            </form>

            <!-- Step 2: Reset Password -->
            <form v-else @submit.prevent="handleResetSubmit">
              <div class="mb-3">
                <label class="form-label fw-bold">驗證碼</label>
                <input 
                  type="text" 
                  class="form-control text-center fs-5 letter-spacing-2" 
                  placeholder="------" 
                  v-model="verificationCode" 
                  maxlength="6"
                  required
                >
              </div>

              <div class="mb-3">
                <label class="form-label fw-bold">新密碼</label>
                <input type="password" class="form-control" v-model="password" required placeholder="至少8位">
              </div>

              <div class="mb-4">
                <label class="form-label fw-bold">確認新密碼</label>
                <input type="password" class="form-control" v-model="confirmPassword" required placeholder="再輸入一次密碼">
              </div>

              <div v-if="errorMessage" class="alert alert-danger py-2 small">
                {{ errorMessage }}
              </div>

              <div class="d-grid gap-2">
                <button type="submit" class="btn btn-success btn-lg fw-bold" :disabled="isLoading">
                  <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {{ isLoading ? '重置中...' : '重置密碼' }}
                </button>
                <button type="button" class="btn btn-link text-decoration-none text-muted" @click="step = 1">
                  返回手機號碼
                </button>
              </div>
            </form>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.letter-spacing-2 {
  letter-spacing: 0.5rem;
}
</style>
