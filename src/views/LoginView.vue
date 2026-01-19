<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useToast } from '../composables/useToast'
import { handleApiError } from '../utils/apiError'
import { apiFetch } from '../utils/api'
import { ERROR_MESSAGES } from '../utils/errorMessages'

const router = useRouter()
const { login } = useAuth()
const toast = useToast()
const loginInput = ref('')
const password = ref('')
const captchaInput = ref('')
const captchaCode = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

onMounted(() => {
  generateCaptcha()
})

//隨機生成驗證碼
const generateCaptcha = () => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let result = ''
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  captchaCode.value = result
}

const handleLogin = async () => {
  errorMessage.value = ''
  if (captchaInput.value.toUpperCase() !== captchaCode.value) {
    errorMessage.value = '驗證碼錯誤！'
    generateCaptcha()
    captchaInput.value = ''
    return
  }

  isLoading.value = true
  try {
    const response = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/login`, {
      method: 'POST',
      body: JSON.stringify({
        login: loginInput.value,
        password: password.value
      })
    })

    const data = await response.json()

    if (response.ok && data.code === 0) {
      // Use useAuth to login
      login(data.data.token, data.data.user)
      
      //alert('登入成功！')
      toast.success('登入成功！')
      router.push('/account')
    } else {
      errorMessage.value = handleApiError(data) || '登入失敗。請檢查您的帳號密碼。'
      //errorMessage.value = '登入失敗。請檢查您的帳號密碼。'
    }
  } catch (error) {
    console.error('Login Error:', error)
    errorMessage.value = ERROR_MESSAGES.GENERAL_ERROR_CONTACT
  } finally {
    isLoading.value = false
  }
}

const handleRegister = () => {
  router.push('/register-phone')
}
</script>

<template>
  <div class="container my-5">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-5">
        <div class="card shadow-lg border-0 rounded-3">
          <div class="card-body p-5">
            <h3 class="text-center fw-bold text-primary mb-4">歡迎回來</h3>
            
            <div v-if="errorMessage" class="alert alert-danger py-2 small mb-3">
              {{ errorMessage }}
            </div>

            <form @submit.prevent="handleLogin">
              <!-- Account -->
              <div class="form-floating mb-3">
                <input type="text" class="form-control" id="floatingInput" placeholder="Phone or Email" v-model="loginInput" required>
                <label for="floatingInput">手機號碼 / 信箱</label>
              </div>

              <!-- Password -->
              <div class="form-floating mb-3">
                <input type="password" class="form-control" id="floatingPassword" placeholder="Password" v-model="password" required>
                <label for="floatingPassword">密碼</label>
              </div>

              <!-- CAPTCHA -->
              <div class="mb-4">
                <label class="form-label text-muted small">驗證碼</label>
                <div class="d-flex gap-2">
                  <input type="text" class="form-control" placeholder="請輸入驗證碼" v-model="captchaInput" required>
                  <div 
                    class="captcha-box d-flex align-items-center justify-content-center bg-light border rounded user-select-none" 
                    @click="generateCaptcha"
                    title="Click to refresh"
                  >
                    <span class="fw-bold fs-4 text-secondary letter-spacing-2">{{ captchaCode }}</span>
                  </div>
                </div>
              </div>

              <!-- Buttons -->
              <div class="d-grid gap-2">
                <button type="submit" class="btn btn-primary btn-lg fw-bold" :disabled="isLoading">
                  <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {{ isLoading ? '登入中...' : '登入' }}
                </button>
                <button type="button" class="btn btn-outline-secondary" @click="handleRegister">註冊帳號</button>
              </div>

              <div class="text-center mt-3">
                <router-link to="/forgot-password" class="text-decoration-none small text-muted">忘記密碼?</router-link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.captcha-box {
  width: 120px;
  cursor: pointer;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40" viewBox="0 0 100 40"><path d="M0 0h100v40H0z" fill="none"/><path d="M10 10l80 20M10 30l80-20" stroke="%23ccc" stroke-width="2"/></svg>');
}
.letter-spacing-2 {
  letter-spacing: 5px;
  font-family: 'Courier New', Courier, monospace;
}
</style>
