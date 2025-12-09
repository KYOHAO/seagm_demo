<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Modal } from 'bootstrap'
import { handleApiError } from '../utils/apiError'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { logout } = useAuth()
const activeMenu = ref('orders')
const stats = ref({
  todayBuy: 0,
  todaySell: 0,
  balance: 0
})
const userInfo = ref({})
const emailModalInstance = ref(null)
const emailStep = ref(1)
const emailForm = ref({
  email: '',
  code: ''
})
const isEmailLoading = ref(false)
const changePasswordModalInstance = ref(null)
const isChangePasswordLoading = ref(false)
const changePasswordForm = ref({
  code: '',
  password: '',
  confirmPassword: ''
})

const openEmailModal = () => {
  emailStep.value = 1
  emailForm.value = { email: '', code: '' }
  const modalEl = document.getElementById('emailVerificationModal')
  if (modalEl) {
    emailModalInstance.value = new Modal(modalEl)
    emailModalInstance.value.show()
  }
}

const sendEmailCode = async () => {
  if (!emailForm.value.email) {
    alert('Please enter your email address.')
    return
  }
  
  isEmailLoading.value = true
  const token = localStorage.getItem('authToken')
  try {
    const response = await fetch('https://dealer-agent.nygamedepot.com/api/v1/email/verify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: emailForm.value.email })
    })

    const data = await response.json()

    if (response.ok && data.code === 0) {
      alert('Verification code sent to your email.')
      emailStep.value = 2
    } else {
      const errorMsg = handleApiError(data)
      alert(errorMsg || 'Failed to send verification code.')
    }
  } catch (error) {
    console.error('Email Verify Error:', error)
    alert('An error occurred. Please try again.')
  } finally {
    isEmailLoading.value = false
  }
}

const confirmEmail = async () => {
  if (!emailForm.value.code) {
    alert('Please enter the verification code.')
    return
  }

  isEmailLoading.value = true
  const token = localStorage.getItem('authToken')
  try {
    const response = await fetch('https://dealer-agent.nygamedepot.com/api/v1/email/confirm', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ verification_code: emailForm.value.code })
    })

    const data = await response.json()

    if (response.ok && data.code === 0) {
      alert('Email verified successfully!')
      // Update local user info
      if (data.data && data.data.user) {
        userInfo.value = data.data.user
      } else {
        // Fallback if API doesn't return user object as expected, though doc says it does
        userInfo.value.email = emailForm.value.email
      }
      
      if (emailModalInstance.value) {
        emailModalInstance.value.hide()
      }
    } else {
      const errorMsg = handleApiError(data)
      alert(errorMsg || 'Verification failed.')
    }
  } catch (error) {
    console.error('Email Confirm Error:', error)
    alert('An error occurred. Please try again.')
  } finally {
    isEmailLoading.value = false
  }
}

//const kycModalInstance = ref(null)

const sendKYCInitiate = async () => {
  const token = localStorage.getItem('authToken')
  try {
    const response = await fetch('https://dealer-agent.nygamedepot.com/api/v1/kyc/initiate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()
    console.log(data)
    if (response.ok && data.code === 0) {
      alert('KYC initiate successfully!')
      window.location.href = data.data.redirect_url
    } else {
      const errorMsg = handleApiError(data)
      alert(errorMsg || 'Failed to initiate KYC.')
    }
  } catch (error) {
    console.error('KYC Error:', error)
    alert('An error occurred. Please try again.')
  }
}




const openChangePasswordModal = async () => {
  if (!userInfo.value.phone_number) {
      alert('找不到電話號碼。')
      return
  }
  
  if (!confirm(`是否要發送驗證碼到 ${userInfo.value.phone_number}?`)) {
      return
  }

  isChangePasswordLoading.value = true
  const token = localStorage.getItem('authToken')
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phone_number: userInfo.value.phone_number })
    })

    const data = await response.json()

    if (response.ok && data.code === 0) {
      alert(data.msg || '發送驗證碼成功。')
      changePasswordForm.value = { code: '', password: '', confirmPassword: '' }
      
      const modalEl = document.getElementById('changePasswordModal')
      if (modalEl) {
        changePasswordModalInstance.value = new Modal(modalEl)
        changePasswordModalInstance.value.show()
      }
    } else {
      const errorMsg = handleApiError(data)
      alert(errorMsg || '發送驗證碼失敗。')
    }
  } catch (error) {
    console.error('Send Code Error:', error)
    alert('An error occurred. Please try again.')
  } finally {
    isChangePasswordLoading.value = false
  }
}

const handleChangePasswordSubmit = async () => {
    const { code, password, confirmPassword } = changePasswordForm.value
    
    if (!code || !password || !confirmPassword) {
        alert('請填寫所有欄位。')
        return
    }
    
    if (password !== confirmPassword) {
        alert('密碼不一致。')
        return
    }

    if (password.length < 8) {
        alert('密碼至少需要8位。')
        return
    }

    isChangePasswordLoading.value = true
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                phone_number: userInfo.value.phone_number,
                verification_code: code,
                password: password,
                password_confirmation: confirmPassword
            })
        })

        const data = await response.json()

        if (response.ok && data.code === 0) {
            alert(data.msg || '修改密碼成功。')
            if (changePasswordModalInstance.value) {
                changePasswordModalInstance.value.hide()
            }
            logout()
        } else {
            const errorMsg = handleApiError(data)
            alert(errorMsg || '修改密碼失敗。')
        }
    } catch (error) {
        console.error('Change Password Error:', error)
        alert('發生錯誤，請稍後再試。')
    } finally {
        isChangePasswordLoading.value = false
    }
}

const fetchUserInfo = async () => {
    const token = localStorage.getItem('authToken')
    if (!token) return

    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })

        const data = await response.json()

        if (response.ok && data.code === 0) {
            userInfo.value = data.data.user
        } else {
            console.error('Failed to fetch user info:', data)
            // Optionally handle token expiration (e.g., redirect to login)
            if (data.code === -1001 || data.code === -2000) {
                 localStorage.removeItem('authToken')
                 localStorage.removeItem('userInfo')
                 router.push('/login')
            }
        }
    } catch (error) {
        console.error('Fetch User Info Error:', error)
    }
}


onMounted(() => {
    fetchUserInfo()
})
</script>

<template>
  <div class="container my-5">
    <div class="row">
      <!-- Left Sidebar -->
      <div class="col-md-3 mb-4">
        <div class="list-group shadow-sm">
          <button 
            type="button" 
            class="list-group-item list-group-item-action" 
            :class="{ active: activeMenu === 'orders' }"
            @click="activeMenu = 'orders'"
          >
            <i class="bi bi-list-check me-2"></i> 即時訂單
          </button>
          <button 
            type="button" 
            class="list-group-item list-group-item-action"
            :class="{ active: activeMenu === 'history' }"
            @click="activeMenu = 'history'"
          >
            <i class="bi bi-clock-history me-2"></i> 交易歷程
          </button>
          <button 
            type="button" 
            class="list-group-item list-group-item-action"
            :class="{ active: activeMenu === 'settings' }"
            @click="activeMenu = 'settings'"
          >
            <i class="bi bi-gear me-2"></i> 帳號設定
          </button>
        </div>
      </div>

      <!-- Right Content -->
      <div class="col-md-9">
        <div class="card shadow-sm border-0">
          <div class="card-body">
            <h4 class="card-title fw-bold mb-4 border-bottom pb-2">
              <span v-if="activeMenu === 'orders'">即時訂單</span>
              <span v-else-if="activeMenu === 'history'">交易歷程</span>
              <span v-else>帳號設定</span>
            </h4>

            <!-- Stats Row -->
            <div class="row g-3 mb-4 text-center">
              <div class="col-md-4">
                <div class="p-3 border rounded bg-light h-100">
                  <h6 class="text-muted mb-2">今日買入</h6>
                  <h4 class="fw-bold text-danger">{{ stats.todayBuy }} 元</h4>
                </div>
              </div>
              <div class="col-md-4">
                <div class="p-3 border rounded bg-light h-100">
                  <h6 class="text-muted mb-2">今日賣出</h6>
                  <h4 class="fw-bold text-success">{{ stats.todaySell }} 元</h4>
                </div>
              </div>
              <div class="col-md-4">
                <div class="p-3 border rounded bg-light h-100">
                  <h6 class="text-muted mb-2">剩餘額度</h6>
                  <h4 class="fw-bold text-primary">{{ stats.balance }} 元</h4>
                </div>
              </div>
            </div>

            <!-- Content Area -->
            <div v-if="activeMenu === 'orders'">
              <div class="alert alert-info">
                <i class="bi bi-info-circle me-2"></i> 目前沒有進行中的訂單。
              </div>
            </div>
            <div v-else-if="activeMenu === 'history'">
              <p class="text-muted text-center py-5">尚無交易紀錄</p>
            </div>
            <div v-else>
              <form>
                <div class="mb-3">
                  <label class="form-label">姓名</label>
                  <input type="text" class="form-control" :value="userInfo.full_name" disabled>
                </div>
                <div class="mb-3">
                  <label class="form-label">手機號碼</label>
                  <div class="input-group">
                    <input type="text" class="form-control" :value="userInfo.phone_number" disabled>
                    <!-- Phone is usually fixed, but if we wanted to change password we do it here? 
                         User asked to add password field UNDER phone number. -->
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label">密碼</label>
                  <div class="input-group">
                    <input type="password" class="form-control" value="********" disabled>
                    <button class="btn btn-outline-primary" type="button" @click="openChangePasswordModal">
                      修改密碼
                    </button>
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label">信箱</label>
                  <div class="input-group">
                    <input type="email" class="form-control" :value="userInfo.email" disabled placeholder="尚未驗證">
                    <button v-if="userInfo.kyc_level !== 2" class="btn btn-outline-primary" type="button" disabled>
                      請先完成身分驗證
                    </button>
                    <button v-else-if="!userInfo.email" class="btn btn-outline-primary" type="button" @click="openEmailModal">
                      驗證信箱
                    </button>
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label">KYC 身分</label>
                  <div class="input-group">
                    <input type="text" class="form-control" :value="userInfo.kyc_level === 2 ? '已驗證' : '未驗證'" disabled>
                    <button v-if="userInfo.kyc_level !== 2" class="btn btn-outline-primary" type="button" @click="sendKYCInitiate">
                      身分驗證
                    </button>
                  </div>
                </div>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- KYC Modal -->
    <div class="modal fade" id="kycModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-0">
            <h5 class="modal-title fw-bold">身分驗證</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body text-center py-4">
            <i class="bi bi-shield-check text-primary display-1 mb-3"></i>
            <p class="mb-4 text-muted">
              To ensure the security of your account and transactions, please complete the identity verification (KYC) process.
            </p>
            <div class="d-grid gap-3">
              <button class="btn btn-primary btn-lg" @click="startKyc" :disabled="isKycLoading">
                <span v-if="isKycLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {{ isKycLoading ? 'Initiating...' : 'Start Verification' }}
              </button>
              <button class="btn btn-outline-secondary" @click="goToKycInfo">
                I have already completed Jumio verification
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Email Verification Modal -->
    <div class="modal fade" id="emailVerificationModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-0">
            <h5 class="modal-title fw-bold">驗證信箱</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body py-4">
            <div v-if="emailStep === 1">
              <p class="text-muted mb-3">請輸入您的信箱以接收驗證碼。</p>
              <div class="mb-3">
                <label class="form-label">信箱</label>
                <input type="email" class="form-control" v-model="emailForm.email" placeholder="name@example.com">
              </div>
              <div class="d-grid">
                <button class="btn btn-primary" @click="sendEmailCode" :disabled="isEmailLoading">
                  <span v-if="isEmailLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {{ isEmailLoading ? 'Sending...' : 'Send Verification Code' }}
                </button>
              </div>
            </div>
            <div v-else>
              <p class="text-muted mb-3">
                A verification code has been sent to <strong>{{ emailForm.email }}</strong>.
                <br>Please enter it below.
              </p>
              <div class="mb-3">
                <label class="form-label">Verification Code</label>
                <input type="text" class="form-control text-center fs-4" v-model="emailForm.code" maxlength="6" placeholder="------">
              </div>
              <div class="d-grid gap-2">
                <button class="btn btn-success" @click="confirmEmail" :disabled="isEmailLoading">
                  <span v-if="isEmailLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {{ isEmailLoading ? 'Verifying...' : 'Verify & Bind' }}
                </button>
                <button class="btn btn-link text-muted text-decoration-none" @click="emailStep = 1">Change Email</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Change Password Modal -->
    <div class="modal fade" id="changePasswordModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-0">
            <h5 class="modal-title fw-bold">修改密碼</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body py-4">
            <form @submit.prevent="handleChangePasswordSubmit">
                <div class="mb-3">
                  <label class="form-label">驗證碼</label>
                  <input type="text" class="form-control" v-model="changePasswordForm.code" placeholder="請輸入簡訊驗證碼" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">新密碼</label>
                  <input type="password" class="form-control" v-model="changePasswordForm.password" placeholder="請輸入新密碼" required minlength="8">
                </div>
                <div class="mb-3">
                  <label class="form-label">確認新密碼</label>
                  <input type="password" class="form-control" v-model="changePasswordForm.confirmPassword" placeholder="請再次輸入新密碼" required minlength="8">
                </div>
                <div class="d-grid">
                  <button type="submit" class="btn btn-primary" :disabled="isChangePasswordLoading">
                    <span v-if="isChangePasswordLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {{ isChangePasswordLoading ? 'Processing...' : '確認修改' }}
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
.list-group-item.active {
  background-color: #007bff;
  border-color: #007bff;
}
</style>
