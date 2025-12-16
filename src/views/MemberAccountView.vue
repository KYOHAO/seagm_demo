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
const addBankModalInstance = ref(null)
const isAddBankLoading = ref(false)
const addBankForm = ref({
    bank_code: '',
    branch_code: '',
    account_number: '',
    verification_code: ''
})
const bankStep = ref(1)
const bankAccountId = ref('')
const gameAccounts = ref([])
const isGameAccountsLoading = ref(false)
const addGameModalInstance = ref(null)
const isAddGameLoading = ref(false)
const addGameForm = ref({
    store_id: '',
    account_name: '',
    verification_code: ''
})
const gameStep = ref(1)
const newGameAccountId = ref('')

const historyTab = ref('buying')
const buyingOrders = ref([])
const sellingOrders = ref([])
const buyingPagination = ref({
    current_page: 1,
    per_page: 15,
    total: 0,
    last_page: 1
})
const sellingPagination = ref({
    current_page: 1,
    per_page: 15,
    total: 0,
    last_page: 1
})
const isHistoryLoading = ref(false)

onMounted(() => {
    fetchUserInfo()
    activeMenu.value = 'bank_accounts' // Optional: default to bank for testing? Or keep 'orders'
})

// Watch activeMenu to fetch when switching?
import { watch } from 'vue'
watch(activeMenu, (newVal) => {
    if (newVal === 'bank_accounts') {
        fetchBankAccounts()
    } else if (newVal === 'game_accounts') {
        fetchGameAccounts()
        fetchGameStores()
    } else if (newVal === 'history') {
        if (historyTab.value === 'buying') {
            fetchBuyingOrders()
        } else {
            fetchSellingOrders()
        }
    }
})

watch(historyTab, (newVal) => {
    if (newVal === 'buying') {
        fetchBuyingOrders()
    } else {
        fetchSellingOrders()
    }
})

const gameStores = ref([])
const fetchGameStores = async () => {
    const token = localStorage.getItem('authToken')
    if (!token) return

    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/stores`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })

        const data = await response.json()

        if (response.ok && data.code === 0) {
            gameStores.value = data.data.stores
        } else {
            console.error('Failed to fetch game stores:', data)
        }
    } catch (error) {
        console.error('Fetch Game Stores Error:', error)
    }
}

const getStoreName = (storeId) => {
    const store = gameStores.value.find(s => s.id === storeId)
    return store ? store.name : storeId
}



const fetchBuyingOrders = async (page = 1) => {
    isHistoryLoading.value = true
    const token = localStorage.getItem('authToken')
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/orders/buying?page=${page}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await response.json()
        if (response.ok && data.code === 0) {
            buyingOrders.value = data.data.orders
            buyingPagination.value = data.data.pagination
        } else {
            console.error('Fetch Buying Orders Failed:', data)
        }
    } catch (error) {
        console.error('Fetch Buying Orders Error:', error)
    } finally {
        isHistoryLoading.value = false
    }
}

const fetchSellingOrders = async (page = 1) => {
    isHistoryLoading.value = true
    const token = localStorage.getItem('authToken')
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/orders/selling?page=${page}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await response.json()
        if (response.ok && data.code === 0) {
            sellingOrders.value = data.data.orders
            sellingPagination.value = data.data.pagination
        } else {
             console.error('Fetch Selling Orders Failed:', data)
        }
    } catch (error) {
        console.error('Fetch Selling Orders Error:', error)
    } finally {
        isHistoryLoading.value = false
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

const bankAccounts = ref([])
const isBankLoading = ref(false)
const fetchBankAccounts = async () => {
    isBankLoading.value = true
    const token = localStorage.getItem('authToken')
    if (!token) return

    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/me/bank-account`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })

        const data = await response.json()

        if (response.ok && data.code === 0) {
            bankAccounts.value = data.data.bank_accounts
        } else {
            console.error('Failed to fetch bank accounts:', data)
        }
    } catch (error) {
        console.error('Fetch Bank Accounts Error:', error)
    } finally {
        isBankLoading.value = false
    }
}

const fetchGameAccounts = async () => {
    isGameAccountsLoading.value = true
    const token = localStorage.getItem('authToken')
    if (!token) return

    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/game-account`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })

        const data = await response.json()

        if (response.ok && data.code === 0) {
            gameAccounts.value = data.data.game_accounts
        } else {
            console.error('Failed to fetch game accounts:', data)
        }
    } catch (error) {
        console.error('Fetch Game Accounts Error:', error)
    } finally {
        isGameAccountsLoading.value = false
    }

}

const openAddGameModal = () => {
    if(userInfo.value.kyc_level !== 2) {
        alert('請先完成身分驗證')
        return
    }

    gameStep.value = 1
    addGameForm.value = { store_id: '', account_name: '', verification_code: '' }
    const modalEl = document.getElementById('addGameModal')
    if (modalEl) {
        addGameModalInstance.value = new Modal(modalEl)
        addGameModalInstance.value.show()
    }
}

const handleAddGameSubmit = async () => {
    const { store_id, account_name } = addGameForm.value

    if (!store_id || !account_name) {
        alert('請填寫所有欄位。')
        return
    }

    isAddGameLoading.value = true
    const token = localStorage.getItem('authToken')
    
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/game-account/bind`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                store_id,
                account_name
            })
        })

        const data = await response.json()

        if (response.ok && data.code === 0) {
            alert('遊戲帳號綁定申請成功！驗證碼已發送。')
            newGameAccountId.value = data.data.game_account.id
            gameStep.value = 2
        } else {
             const errorMsg = handleApiError(data)
             //alert(errorMsg || '綁定失敗。')
             alert('綁定失敗。')
        }
    } catch (error) {
        console.error('Bind Game Account Error:', error)
        alert('發生錯誤，請稍後再試。')
    } finally {
        isAddGameLoading.value = false
    }
}

const handleGameVerifySubmit = async () => {
    if (!addGameForm.value.verification_code || addGameForm.value.verification_code.length !== 6) {
        alert('請輸入6位數驗證碼。')
        return
    }
    
    isAddGameLoading.value = true
    const token = localStorage.getItem('authToken')
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/game-account/verify`, {
            method: 'POST',
            headers: {
                 'Authorization': `Bearer ${token}`,
                 'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                game_account_id: newGameAccountId.value,
                verification_code: addGameForm.value.verification_code
            })
        })
        
        const data = await response.json()
        
        if (response.ok && data.code === 0) {
            alert('遊戲帳號綁定成功！')
             if (addGameModalInstance.value) {
                addGameModalInstance.value.hide()
            }
            fetchGameAccounts()
        } else {
            const errorMsg = handleApiError(data)
            //alert(errorMsg || '驗證失敗。')
            alert('驗證失敗。')
        }
    } catch (error) {
        console.error('Verify Game Account Error:', error)
          alert('發生錯誤，請稍後再試。')
    } finally {
        isAddGameLoading.value = false
    }
}

const openAddBankModal = () => {
    if(userInfo.value.kyc_level !== 2) {
        alert('請先完成身分驗證')
        return
    }



    bankStep.value = 1
    addBankForm.value = { bank_code: '', branch_code: '', account_number: '', verification_code: '' }
    const modalEl = document.getElementById('addBankModal')
    if (modalEl) {
        addBankModalInstance.value = new Modal(modalEl)
        addBankModalInstance.value.show()
    }
}

const handleAddBankSubmit = async () => {
    const { bank_code, branch_code, account_number } = addBankForm.value
    
    if (!bank_code || !branch_code || !account_number) {
        alert('請填寫所有欄位。')
        return
    }
    
    // Basic validation
    if (bank_code.length !== 3) {
        alert('銀行代碼必須為3碼。')
        return
    }
    if (branch_code.length !== 4) {
        alert('分行代碼必須為4碼。')
        return
    }


    if (account_number.length > 14) {
         alert('銀行帳號最多14碼。')
         return
    }

    isAddBankLoading.value = true
    const token = localStorage.getItem('authToken')
    
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/bank-account/bind`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                bank_code,
                branch_code,
                account_number
            })
        })

        const data = await response.json()

        if (response.ok && data.code === 0) {
            alert('銀行帳號綁定申請成功！驗證碼已發送。')
            bankAccountId.value = data.data.bank_account.id
            bankStep.value = 2
        } else {
             const errorMsg = handleApiError(data)
             //alert(errorMsg || '綁定失敗。')
             alert('綁定失敗。')
        }
    } catch (error) {
        console.error('Bind Bank Account Error:', error)
        alert('發生錯誤，請稍後再試。')
    } finally {
        isAddBankLoading.value = false

    }
}

const handleBankVerifySubmit = async () => {
    if (!addBankForm.value.verification_code || addBankForm.value.verification_code.length !== 6) {
        alert('請輸入6位數驗證碼。')
        return
    }
    
    isAddBankLoading.value = true
    const token = localStorage.getItem('authToken')
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/bank-account/verify`, {
            method: 'POST',
            headers: {
                 'Authorization': `Bearer ${token}`,
                 'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                bank_account_id: bankAccountId.value,
                verification_code: addBankForm.value.verification_code
            })
        })
        
        const data = await response.json()
        
        if (response.ok && data.code === 0) {
            alert('銀行帳號驗證成功，請等待審核。')
             if (addBankModalInstance.value) {
                addBankModalInstance.value.hide()
            }
            fetchBankAccounts()
        } else {
            const errorMsg = handleApiError(data)
            //alert(errorMsg || '驗證失敗。')
            alert('驗證失敗。')
        }
    } catch (error) {
        console.error('Verify Bank Error:', error)
          alert('發生錯誤，請稍後再試。')
    } finally {
        isAddBankLoading.value = false
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
      //alert(data.msg || '發送驗證碼成功。')
      alert('發送驗證碼成功。')
      changePasswordForm.value = { code: '', password: '', confirmPassword: '' }
      
      const modalEl = document.getElementById('changePasswordModal')
      if (modalEl) {
        changePasswordModalInstance.value = new Modal(modalEl)
        changePasswordModalInstance.value.show()
      }
    } else {
      const errorMsg = handleApiError(data)
      //alert(errorMsg || '發送驗證碼失敗。')
      alert('發送驗證碼失敗。')
    }
  } catch (error) {
    console.error('Send Code Error:', error)
    alert('發生錯誤，請稍後再試。')
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
    
    if (code.length !== 6) {
      alert('請輸入6位數的驗證碼。')
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
            //alert(data.msg || '修改密碼成功。')
            alert('修改密碼成功。')
            if (changePasswordModalInstance.value) {
                changePasswordModalInstance.value.hide()
            }
            logout()
        } else {
            const errorMsg = handleApiError(data)
            //alert(errorMsg || '修改密碼失敗。')
            alert('修改密碼失敗。')
        }
    } catch (error) {
        console.error('Change Password Error:', error)
        alert('發生錯誤，請稍後再試。')
    } finally {
        isChangePasswordLoading.value = false
    }
}

//const kycModalInstance = ref(null)
const sendKYCInitiate = async () => {
  const token = localStorage.getItem('authToken')
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/kyc/initiate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          success_url: `${import.meta.env.VITE_FRONTEND_BASE_URL}/kyc-info`,
          error_url: `${import.meta.env.VITE_FRONTEND_BASE_URL}/account`,
      })
    })

    const data = await response.json()
    console.log(data)
    if (response.ok && data.code === 0) {
      alert('KYC 啟動成功!')
      window.location.href = data.data.redirect_url
    } else {
      const errorMsg = handleApiError(data)
      //alert(errorMsg || 'Failed to initiate KYC.')
      alert('KYC 啟動失敗。')
    }
  } catch (error) {
    console.error('KYC Error:', error)
    alert('發生錯誤，請稍後再試。')
  }
}

const openEmailModal = () => {
  if(userInfo.value.kyc_level !== 2) {
      alert('請先完成身分驗證')
      return
  }
  
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
    alert('請輸入您的電子郵件地址。')
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
      alert('驗證碼已發送到您的電子郵件。')
      emailStep.value = 2
    } else {
      const errorMsg = handleApiError(data)
      //alert(errorMsg || '發送驗證碼失敗。')
      alert('發送驗證碼失敗。')
    }
  } catch (error) {
    console.error('Email Verify Error:', error)
    alert('發生錯誤，請稍後再試。')
  } finally {
    isEmailLoading.value = false
  }
}

const confirmEmail = async () => {
  if (!emailForm.value.code) {
    alert('請輸入驗證碼。')
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
      alert('Email 驗證成功!')
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
      //alert(errorMsg || '驗證失敗。')
      alert('Email 驗證失敗。')
    }
  } catch (error) {
    console.error('Email Confirm Error:', error)
    alert('發生錯誤，請稍後再試。')
  } finally {
    isEmailLoading.value = false
  }
}
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
          <button 
            type="button" 
            class="list-group-item list-group-item-action"
            :class="{ active: activeMenu === 'bank_accounts' }"
            @click="activeMenu = 'bank_accounts'"
          >
            <i class="bi bi-bank me-2"></i> 銀行帳號
          </button>
          <button 
            type="button" 
            class="list-group-item list-group-item-action"
            :class="{ active: activeMenu === 'game_accounts' }"
            @click="activeMenu = 'game_accounts'"
          >
            <i class="bi bi-controller me-2"></i> 遊戲帳號
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

              <span v-else-if="activeMenu === 'bank_accounts'">銀行帳號</span>
              <span v-else-if="activeMenu === 'game_accounts'">遊戲帳號</span>
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
              <!-- History Tabs -->
              <ul class="nav nav-tabs mb-3">
                <li class="nav-item">
                  <a class="nav-link" :class="{ active: historyTab === 'buying' }" href="#" @click.prevent="historyTab = 'buying'">購買訂單</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" :class="{ active: historyTab === 'selling' }" href="#" @click.prevent="historyTab = 'selling'">銷售訂單</a>
                </li>
              </ul>

              <div v-if="isHistoryLoading" class="text-center py-5">
                  <div class="spinner-border text-primary" role="status">
                      <span class="visually-hidden">Loading...</span>
                  </div>
              </div>
              
              <!-- Buying Orders -->
              <div v-else-if="historyTab === 'buying'">
                  <div v-if="buyingOrders.length === 0" class="alert alert-secondary">尚無購買紀錄</div>
                  <div v-else class="table-responsive">
                      <table class="table table-hover align-middle small">
                          <thead class="table-light">
                              <tr>
                                  <th>訂單 ID</th>
                                  <th>商戶</th>
                                  <th>數量</th>
                                  <th>總價</th>
                                  <th>付款方式</th>
                                  <th>狀態</th>
                                  <th>時間</th>
                              </tr>
                          </thead>
                          <tbody>
                              <tr v-for="order in buyingOrders" :key="order.id">
                                  <td>{{ order.id }}</td>
                                  <td>{{ getStoreName(order.store_id) }}</td>
                                  <td>{{ order.quantity }}</td>
                                  <td>{{ order.total_price }}</td>
                                  <td>
                                      {{ order.payments_label }}
                                      <span v-if="order.payments_sub" class="badge bg-light text-dark">{{ order.payments_sub }}</span>
                                  </td>
                                  <td><span class="badge bg-secondary">{{ order.status_label }}</span></td>
                                  <td>{{ new Date(order.created_at).toLocaleString() }}</td>
                              </tr>
                          </tbody>
                      </table>
                  </div>
                  <!-- Pagination -->
                  <nav v-if="buyingPagination.last_page > 1" class="mt-3">
                      <ul class="pagination justify-content-center">
                          <li class="page-item" :class="{ disabled: buyingPagination.current_page === 1 }">
                              <button class="page-link" @click="fetchBuyingOrders(buyingPagination.current_page - 1)">上一頁</button>
                          </li>
                          <li class="page-item disabled">
                              <span class="page-link">{{ buyingPagination.current_page }} / {{ buyingPagination.last_page }}</span>
                          </li>
                          <li class="page-item" :class="{ disabled: buyingPagination.current_page === buyingPagination.last_page }">
                              <button class="page-link" @click="fetchBuyingOrders(buyingPagination.current_page + 1)">下一頁</button>
                          </li>
                      </ul>
                  </nav>
              </div>

              <!-- Selling Orders -->
              <div v-else-if="historyTab === 'selling'">
                  <div v-if="sellingOrders.length === 0" class="alert alert-secondary">尚無銷售紀錄</div>
                   <div v-else class="table-responsive">
                      <table class="table table-hover align-middle small">
                          <thead class="table-light">
                              <tr>
                                  <th>訂單 ID</th>
                                  <th>商戶</th>
                                  <th>數量</th>
                                  <th>總價</th>
                                  <th>狀態</th>
                                  <th>時間</th>
                              </tr>
                          </thead>
                          <tbody>
                              <tr v-for="order in sellingOrders" :key="order.id">
                                  <td>{{ order.id }}</td>
                                  <td>{{ getStoreName(order.store_id) }}</td>
                                  <td>{{ order.quantity }}</td>
                                  <td>{{ order.total_price }}</td>
                                  <td><span class="badge bg-secondary">{{ order.status_label }}</span></td>
                                  <td>{{ new Date(order.created_at).toLocaleString() }}</td>
                              </tr>
                          </tbody>
                      </table>
                  </div>
                  <!-- Pagination -->
                   <nav v-if="sellingPagination.last_page > 1" class="mt-3">
                      <ul class="pagination justify-content-center">
                          <li class="page-item" :class="{ disabled: sellingPagination.current_page === 1 }">
                              <button class="page-link" @click="fetchSellingOrders(sellingPagination.current_page - 1)">上一頁</button>
                          </li>
                          <li class="page-item disabled">
                              <span class="page-link">{{ sellingPagination.current_page }} / {{ sellingPagination.last_page }}</span>
                          </li>
                          <li class="page-item" :class="{ disabled: sellingPagination.current_page === sellingPagination.last_page }">
                              <button class="page-link" @click="fetchSellingOrders(sellingPagination.current_page + 1)">下一頁</button>
                          </li>
                      </ul>
                  </nav>
              </div>
            </div>
            <div v-else-if="activeMenu === 'settings'">
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
            <div v-else-if="activeMenu === 'bank_accounts'">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5 class="mb-0 fw-bold">我的銀行帳號</h5>
                    <button class="btn btn-primary btn-sm" @click="openAddBankModal">
                        <i class="bi bi-plus-lg me-1"></i> 新增銀行帳號
                    </button>
                </div>
                <div v-if="isBankLoading" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
                <div v-else-if="bankAccounts.length === 0" class="alert alert-info">
                    <i class="bi bi-info-circle me-2"></i> 目前沒有已啟用的銀行帳號。
                </div>
                <div v-else class="table-responsive">
                    <table class="table table-hover align-middle">
                        <thead class="table-light">
                            <tr>
                                <th>銀行代碼</th>
                                <th>分行代碼</th>
                                <th>帳號</th>
                                <th>狀態</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="bank in bankAccounts" :key="bank.id">
                                <td>{{ bank.bank_code }}</td>
                                <td>{{ bank.branch_code }}</td>
                                <td>{{ bank.account_number }}</td>
                                <td>
                                    <span class="badge" :class="bank.status === 2 ? 'bg-success' : 'bg-secondary'">
                                        {{ bank.status_label }}
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div v-else-if="activeMenu === 'game_accounts'">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5 class="mb-0 fw-bold">我的遊戲帳號</h5>
                    <button class="btn btn-primary btn-sm" @click="openAddGameModal">
                        <i class="bi bi-plus-lg me-1"></i> 新增遊戲帳號
                    </button>
                </div>
                <div v-if="isGameAccountsLoading" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
                <div v-else-if="gameAccounts.length === 0" class="alert alert-info">
                    <i class="bi bi-info-circle me-2"></i> 目前沒有已綁定的遊戲帳號。
                </div>
                <div v-else class="table-responsive">
                    <table class="table table-hover align-middle">
                        <thead class="table-light">
                            <tr>
                                <th>商戶名稱</th>
                                <th>帳號名稱</th>
                                <th>狀態</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="account in gameAccounts" :key="account.id">
                                <td>{{ getStoreName(account.store_id) }}</td>
                                <td>{{ account.account_name }}</td>
                                <td>
                                    <span class="badge" :class="account.status === 1 ? 'bg-success' : 'bg-secondary'">
                                        {{ account.status_label }}
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
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
              為了確保您的帳戶和交易的安全，請完成身份驗證 (KYC) 的程序。
            </p>
            <div class="d-grid gap-3">
              <button class="btn btn-primary btn-lg" @click="startKyc" :disabled="isKycLoading">
                <span v-if="isKycLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {{ isKycLoading ? 'Initiating...' : 'Start Verification' }}
              </button>
              <button class="btn btn-outline-secondary" @click="goToKycInfo">
                我已經完成 Jumio 驗證
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
                  <input type="text" class="form-control" v-model="changePasswordForm.code" placeholder="請輸入簡訊驗證碼" required length="6">
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

    <!-- Add Bank Account Modal -->
    <div class="modal fade" id="addBankModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-0">
            <h5 class="modal-title fw-bold">新增銀行帳號</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body py-4">
             <form v-if="bankStep === 1" @submit.prevent="handleAddBankSubmit">
                <div class="mb-3">
                  <label class="form-label">銀行代碼 (Bank Code)</label>
                  <input type="text" class="form-control" v-model="addBankForm.bank_code" placeholder="共3碼 (例如 013)" maxlength="3" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">分行代碼 (Branch Code)</label>
                  <input type="text" class="form-control" v-model="addBankForm.branch_code" placeholder="共4碼 (例如 1234)" maxlength="4" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">銀行帳號 (Account Number)</label>
                  <input type="text" class="form-control" v-model="addBankForm.account_number" placeholder="最多14碼" maxlength="14" required>
                </div>
                <div class="d-grid">
                  <button type="submit" class="btn btn-primary" :disabled="isAddBankLoading">
                    <span v-if="isAddBankLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {{ isAddBankLoading ? 'Processing...' : '確認新增' }}
                  </button>
                </div>
             </form>
             <form v-else @submit.prevent="handleBankVerifySubmit">
                <div class="mb-3 text-center">
                    <p class="text-muted">請輸入發送至您手機的驗證碼</p>
                    <input type="text" class="form-control text-center fs-4" v-model="addBankForm.verification_code" placeholder="------" maxlength="6" required>
                </div>
                 <div class="d-grid">
                  <button type="submit" class="btn btn-success" :disabled="isAddBankLoading">
                    <span v-if="isAddBankLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {{ isAddBankLoading ? 'Verify & Bind' : '確認綁定' }}
                  </button>
                </div>
             </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Game Account Modal -->
    <div class="modal fade" id="addGameModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-0">
            <h5 class="modal-title fw-bold">新增遊戲帳號</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body py-4">
             <form v-if="gameStep === 1" @submit.prevent="handleAddGameSubmit">
                <div class="mb-3">
                  <label class="form-label">選擇遊戲商戶</label>
                  <select class="form-select" v-model="addGameForm.store_id" required>
                      <option value="" disabled>請選擇商戶</option>
                      <option v-for="store in gameStores" :key="store.id" :value="store.id">
                          {{ store.name }}
                      </option>
                  </select>
                </div>
                <div class="mb-3">
                  <label class="form-label">帳號名稱 (Account Name)</label>
                  <input type="text" class="form-control" v-model="addGameForm.account_name" placeholder="請輸入遊戲帳號名稱" maxlength="60" required>
                </div>
                <div class="d-grid">
                  <button type="submit" class="btn btn-primary" :disabled="isAddGameLoading">
                    <span v-if="isAddGameLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {{ isAddGameLoading ? 'Processing...' : '確認新增' }}
                  </button>
                </div>
             </form>
             <form v-else @submit.prevent="handleGameVerifySubmit">
                <div class="mb-3 text-center">
                    <p class="text-muted">請輸入發送至您手機的驗證碼</p>
                    <input type="text" class="form-control text-center fs-4" v-model="addGameForm.verification_code" placeholder="------" maxlength="6" required>
                </div>
                 <div class="d-grid">
                  <button type="submit" class="btn btn-success" :disabled="isAddGameLoading">
                    <span v-if="isAddGameLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {{ isAddGameLoading ? 'Verify & Bind' : '確認綁定' }}
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
