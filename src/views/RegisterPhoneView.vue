<script setup>
import { ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { handleApiError } from '../utils/apiError'

const router = useRouter()
const phoneNumber = ref('')
const otpCode = ref('')
const step = ref(1) // 1: Phone Input, 2: OTP Input, 3: Password
const isLoading = ref(false)
const errorMessage = ref('')
const countdown = ref(0)
let timer = null

const startCountdown = () => {
    countdown.value = 600
    if (timer) clearInterval(timer)
    timer = setInterval(() => {
        if (countdown.value > 0) {
            countdown.value--
        } else {
            clearInterval(timer)
        }
    }, 1000)
}

onUnmounted(() => {
    if (timer) clearInterval(timer)
})

const handlePhoneSubmit = async () => {
  errorMessage.value = ''
  if (!phoneNumber.value) {
    errorMessage.value = '請輸入您的手機號碼。'
    return
  }

  // Basic validation for Taiwan phone number (09xxxxxxxx)
  const phoneRegex = /^09\d{8}$/
  if (!phoneRegex.test(phoneNumber.value)) {
    errorMessage.value = '手機號碼格式錯誤。 格式為09xxxxxxxx'
    return
  }

  isLoading.value = true
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/register/phone`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone_number: phoneNumber.value
      })
    })

    const data = await response.json()

    if (response.ok && data.code === 0) {
      step.value = 2
      startCountdown()
      //alert(data.msg || '驗證碼已發送成功。')
      alert('驗證碼已發送成功。')
    } else {
      //errorMessage.value = handleApiError(data) || '驗證碼發送失敗。'
      errorMessage.value = handleApiError(data)
    }
  } catch (error) {
    console.error('API Error:', error)
    errorMessage.value = '發生錯誤，請稍後再試。'
  } finally {
    isLoading.value = false
  }
}

const handleResendCode = async () => {
    if (countdown.value > 0) return
    
    isLoading.value = true
    errorMessage.value = ''
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/register/resend-verification`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                phone_number: phoneNumber.value
            })
        })

        const data = await response.json()

        if (response.ok && data.code === 0) {
            //alert(data.msg || '驗證碼已重新發送成功。')
            alert('驗證碼已重新發送成功。')
            startCountdown()
        } else {
            //errorMessage.value = handleApiError(data) || '驗證碼發送失敗。'
            errorMessage.value = handleApiError(data)
        }
    } catch (error) {
        console.error('API Error:', error)
        errorMessage.value = '發生錯誤，請稍後再試。'
    } finally {
        isLoading.value = false
    }
}

const handleOtpSubmit = async () => {
  if (otpCode.value.length !== 6) {
    alert('請輸入6位數的驗證碼。')
    return
  }
  
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/register/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone_number: phoneNumber.value,
        verification_code: otpCode.value
      })
    })

    const data = await response.json()

    if (response.ok && data.code === 0) {
      alert('驗證成功。')
      step.value = 3
    } else {
      alert('驗證失敗，請檢查驗證碼。')
      //errorMessage.value = handleApiError(data) || '驗證失敗，請檢查驗證碼。'
      errorMessage.value = handleApiError(data)
    }
  } catch (error) {
    console.error('API Error:', error)
    errorMessage.value = '發生錯誤，請稍後再試。'
  } finally {
    isLoading.value = false
  }
}

const password = ref('')
const confirmPassword = ref('')
const handlePasswordSubmit = async () => {
  errorMessage.value = ''
  if (password.value !== confirmPassword.value) {
    errorMessage.value = '密碼不一致。'
    return
  }
  if (password.value.length < 8) {
    errorMessage.value = '密碼至少需要8位數。'
    return
  }

  isLoading.value = true
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/register/password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone_number: phoneNumber.value,
        password: password.value,
        password_confirmation: confirmPassword.value
      })
    })

    const data = await response.json()

    if (response.ok && data.code === 0) {
       alert('註冊成功！請登入。')
       router.push('/login')
    } else {
      //errorMessage.value = handleApiError(data) || '註冊失敗。'
      errorMessage.value = handleApiError(data)
    }
  } catch (error) {
    console.error('API Error:', error)
    errorMessage.value = '發生錯誤，請稍後再試。'
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
              {{ step === 1 ? '註冊 - 第一步' : (step === 2 ? '驗證手機' : '設定密碼') }}
            </h3>

            <!-- Step 1: Phone Number -->
            <form v-if="step === 1" @submit.prevent="handlePhoneSubmit">
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
                <div class="form-text text-muted">格式: 0912345678</div>
              </div>

              <div v-if="errorMessage" class="alert alert-danger py-2 small">
                {{ errorMessage }}
              </div>

              <div class="d-grid">
                <button type="submit" class="btn btn-primary btn-lg fw-bold" :disabled="isLoading">
                  <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {{ isLoading ? '發送中...' : '發送驗證碼' }}
                </button>
              </div>
            </form>

            <!-- Step 2: OTP Input -->
            <form v-else-if="step === 2" @submit.prevent="handleOtpSubmit">
              <div class="mb-4">
                <label class="form-label fw-bold">請輸入驗證碼</label>
                <div class="text-center mb-3">
                  <span class="badge bg-light text-dark border">已發送至: {{ phoneNumber }}</span>
                </div>
                <input 
                  type="text" 
                  class="form-control text-center fs-4 letter-spacing-2" 
                  placeholder="------" 
                  v-model="otpCode" 
                  maxlength="6"
                  required
                >
              </div>

              <div class="text-center mb-4">
                  <button 
                      type="button" 
                      class="btn btn-outline-secondary btn-sm" 
                      @click="handleResendCode" 
                      :disabled="countdown > 0 || isLoading"
                  >
                      {{ countdown > 0 ? `重新發送 (${countdown}s)` : '重新發送驗證碼' }}
                  </button>
              </div>

              <div class="d-grid gap-3">
                <button type="submit" class="btn btn-success btn-lg fw-bold">驗證 & 繼續</button>
                <button type="button" class="btn btn-link text-decoration-none text-muted" @click="step = 1">
                  更改手機號碼
                </button>
              </div>
            </form>

            <!-- Step 3: Set Password -->
            <form v-else @submit.prevent="handlePasswordSubmit">
              <div class="mb-3">
                <label class="form-label fw-bold">設定密碼</label>
                <input type="password" class="form-control" v-model="password" required placeholder="至少8位數">
              </div>
              <div class="mb-4">
                <label class="form-label fw-bold">確認密碼</label>
                <input type="password" class="form-control" v-model="confirmPassword" required placeholder="再次輸入密碼">
              </div>

              <div v-if="errorMessage" class="alert alert-danger py-2 small">
                {{ errorMessage }}
              </div>

              <div class="d-grid">
                <button type="submit" class="btn btn-primary btn-lg fw-bold" :disabled="isLoading">
                  <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {{ isLoading ? '註冊中...' : '完成註冊' }}
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
