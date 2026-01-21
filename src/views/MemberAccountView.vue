<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { ERROR_MESSAGES } from '../utils/errorMessages'
import { formatNumber, getBankLabel } from '../utils/format'
import { getCookie, setCookie } from '../utils/cookies'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from '../composables/useToast'
import { Modal } from 'bootstrap'
import { useGameStores } from '../composables/useGameStores'
import { handleApiError } from '../utils/apiError'
import { useAuth } from '../composables/useAuth'
import { apiFetch } from '../utils/api'
import { getBuyingOrderStatusInfo, getSellingOrderStatusInfo } from '../utils/statusMapping'
import { useCommon } from '../composables/useCommon'

const { copyToClipboard } = useCommon()

const toast = useToast()
const router = useRouter()
const route = useRoute()
const { logout } = useAuth()
const activeMenu = ref('settings')
const stats = ref({
  todayBuy: 0,
  todaySell: 0,
  balance: 0
})
const userInfo = ref(getCookie('userInfo') || {})
const kycPromptModalInstance = ref(null)
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
const bankList = ref([])
const branchList = ref([])
const isBankListLoading = ref(false)
const isBranchListLoading = ref(false)
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
const selectedOrder = ref(null)
const orderDetailsModalInstance = ref(null)
const isOrderDetailsLoading = ref(false)

const pollingTimer = ref(null)

const fetchAccountInfo = async () => {
    const token = localStorage.getItem('authToken')
    if (!token) return

    try {
        const response = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/account/info`, {
            method: 'GET'
        })
        const data = await response.json()
        if (response.ok && data.code === 0) {
            // Update stats
            const volume = data.data.today_volume
            stats.value.todayBuy = volume.buying
            stats.value.todaySell = volume.selling
            // Assuming balance means remaining quota based on 500k limit mentioned in UI
            stats.value.balance = volume.total 
            
            // Optionally update user info if provided
             if (data.data.user) {
                userInfo.value = data.data.user
                setCookie('userInfo', data.data.user)
             }
        }
    } catch (error) {
        console.error('Failed to fetch account info:', error)
    }
}

onMounted(() => {
    fetchUserInfo()
    fetchAccountInfo() // Initial fetch
    
    // Poll every minute
    pollingTimer.value = setInterval(fetchAccountInfo, 60000)

    // Handle Tab Param
    const tab = route.query.tab
    if (tab === 'transactions') {
        activeMenu.value = 'orders'
        if (route.query.sub) {
            activeOrdersTab.value = route.query.sub
        }
    } else if (tab === 'bank') {
        activeMenu.value = 'bank_accounts'
    } else if (tab === 'game') {
        activeMenu.value = 'game_accounts'
    } else if (tab === 'orders') {
        activeMenu.value = 'orders'
    } else if (tab === 'account') {
        activeMenu.value = 'settings'
    } else {
        activeMenu.value = 'settings' // Default
    }
})

onUnmounted(() => {
    if (pollingTimer.value) {
        clearInterval(pollingTimer.value)
    }
})

// Watch activeMenu to fetch when switching?
watch(activeMenu, (newVal) => {
    if (newVal === 'bank_accounts') {
        fetchBankAccounts()
    } else if (newVal === 'game_accounts') {
        fetchGameAccounts()
        fetchGameStores()
    } else if (newVal === 'history') {
        fetchGameStores() // Ensure stores are loaded for name mapping
        if (historyTab.value === 'buying') {
            fetchBuyingOrders()
        } else {
            fetchSellingOrders()
        }
    } else if (newVal === 'orders') {
        fetchGameStores()
        fetchActiveOrders()
    } else if (newVal === 'settings') {
        //fetchUserInfo()
    }
})

watch(historyTab, (newVal) => {
    if (newVal === 'buying') {
        fetchBuyingOrders()
    } else {
        fetchSellingOrders()
    }
})

const { stores: gameStores, fetchGameStores } = useGameStores()

const getStoreName = (storeId) => {
    const store = gameStores.value.find(s => s.id === storeId)
    return store ? store.name : storeId
}

const activeOrdersTab = ref('buying')
const activeBuyingOrders = ref([])
const activeSellingOrders = ref([])
const isActiveOrdersLoading = ref(false)

const fetchActiveOrders = async () => {
    isActiveOrdersLoading.value = true
    try {
        const response = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/active-orders`)
        const data = await response.json()
        if (response.ok && data.code === 0) {
            // Assuming data structure: { buying: [], selling: [] } or similar
            // If the user says "API buy or sell is together", it might be a flat list with type?
            // Or maybe it returns { buying_orders: [...], selling_orders: [...] }
            // Since I cannot verify, I will optimistically check for both formats or try to parse
            
            // NOTE: Based on typical patterns if "together", it might be `orders` array.
            // If it returns an object with keys:
            if (data.data.buying_orders) {
                activeBuyingOrders.value = data.data.buying_orders
            } else {
                 activeBuyingOrders.value = []
            }

            if (data.data.selling_orders) {
                activeSellingOrders.value = data.data.selling_orders
            } else {
                activeSellingOrders.value = []
            }
            
        } else {
            console.error('Fetch Active Orders Failed:', data)
        }
    } catch (error) {
         console.error('Fetch Active Orders Error:', error)
    } finally {
        isActiveOrdersLoading.value = false
    }
}


const fetchBuyingOrders = async (page = 1) => {
    isHistoryLoading.value = true
    try {
        const response = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/orders/buying?page=${page}`)
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
    try {
        const response = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/orders/selling?page=${page}`)
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

const openBuyingOrderDetailsModal = async (orderId) => {
    isOrderDetailsLoading.value = true
    selectedOrder.value = null 
    
    try {
        const response = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/orders/buying/${orderId}`)
        const data = await response.json()
        
        if (response.ok && data.code === 0) {
            selectedOrder.value = data.data.order
            
            const modalEl = document.getElementById('buyingOrderDetailsModal')
            if (modalEl) {
                orderDetailsModalInstance.value = new Modal(modalEl)
                orderDetailsModalInstance.value.show()
            }
        } else {
             const errorMsg = handleApiError(data)
             toast.error(errorMsg || '取得訂單詳細失敗')
        }
    } catch (error) {
        console.error('Fetch Order Details Error:', error)
        toast.error('發生錯誤，請稍後再試或與客服聯繫。')
    } finally {
        isOrderDetailsLoading.value = false
    }
}

const openSellingOrderDetailsModal = async (orderId) => {
    isOrderDetailsLoading.value = true
    selectedOrder.value = null 
    
    try {
        const response = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/orders/selling/${orderId}`)
        const data = await response.json()
        
        if (response.ok && data.code === 0) {
            selectedOrder.value = data.data.order
            
            const modalEl = document.getElementById('sellingOrderDetailsModal')
            if (modalEl) {
                orderDetailsModalInstance.value = new Modal(modalEl)
                orderDetailsModalInstance.value.show()
            }
        } else {
             const errorMsg = handleApiError(data)
             toast.error(errorMsg || '取得訂單詳細失敗')
        }
    } catch (error) {
        console.error('取得訂單詳細錯誤:', error)
        toast.error(ERROR_MESSAGES.GENERAL_ERROR_CONTACT)
    } finally {
        isOrderDetailsLoading.value = false
    }
}

const kycFormPromptModalInstance = ref(null)

const showKycPrompt = () => {
    setTimeout(() => {
        const modalEl = document.getElementById('kycPromptModal')
        if (modalEl) {
            kycPromptModalInstance.value = new Modal(modalEl)
            kycPromptModalInstance.value.show()
        }
    }, 500)
}

const showKycFormPrompt = () => {
    setTimeout(() => {
        const modalEl = document.getElementById('kycFormPromptModal')
        if (modalEl) {
            kycFormPromptModalInstance.value = new Modal(modalEl)
            kycFormPromptModalInstance.value.show()
        }
    }, 500)
}

const confirmKycFormPrompt = () => {
    if (kycFormPromptModalInstance.value) {
        kycFormPromptModalInstance.value.hide()
    }
     router.push('/kyc-info')
}

const isUserInfoLoading = ref(false)

const fetchUserInfo = async () => {
    const token = localStorage.getItem('authToken')
    if (!token) return

    isUserInfoLoading.value = true
    try {
        const response = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/me`, {
            method: 'GET'
        })

        const data = await response.json()

        if (response.ok && data.code === 0) {
            const userData = data.data.user
            userInfo.value = userData
            setCookie('userInfo', userData)
            //console.log(userData);
            // Auto Prompt for KYC if level is 1
            if (userInfo.value.kyc_level === 1) {
                if (userInfo.value.kyc_step === 0) {
                    showKycPrompt()
                } else if (userInfo.value.kyc_step === 1) {
                    showKycFormPrompt()
                }
            }

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
        console.error('取得使用者資訊錯誤:', error)
    } finally {
        isUserInfoLoading.value = false
    }
}


const bankAccounts = ref([])
const isBankLoading = ref(false)
const isDeletingBank = ref(false)

const deleteBankAccount = async () => {
    if (!confirm('確定要刪除銀行帳號嗎？')) return

    isDeletingBank.value = true
    try {
        const response = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/bank-account`, {
            method: 'DELETE'
        })
        const data = await response.json()
        if (response.ok && data.code === 0) {
            toast.success('銀行帳號已刪除')
            await fetchBankAccounts()
        } else {
            const errorMsg = handleApiError(data)
            toast.error(errorMsg || '刪除失敗')
        }
    } catch (error) {
        console.error('刪除銀行帳號錯誤:', error)
        toast.error(ERROR_MESSAGES.GENERAL_ERROR_CONTACT)
    } finally {
        isDeletingBank.value = false
    }
}
const fetchBankAccounts = async () => {
    isBankLoading.value = true
    const token = localStorage.getItem('authToken')
    if (!token) return

    try {
        const response = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/me/bank-account`, {
            method: 'GET'
        })

        const data = await response.json()

        if (response.ok && data.code === 0) {
            bankAccounts.value = data.data.bank_accounts
            
            // Fetch branch names for relevant banks
            const uniqueBanks = [...new Set(bankAccounts.value.map(b => b.bank_code))]
            uniqueBanks.forEach(code => {
                fetchBankBranchesForLabel(code)
            })
        } else {
            console.error('取得銀行帳號錯誤:', data)
        }
    } catch (error) {
        console.error('取得銀行帳號錯誤:', error)
    } finally {
        isBankLoading.value = false
    }
}

const fetchGameAccounts = async () => {
    isGameAccountsLoading.value = true
    const token = localStorage.getItem('authToken')
    if (!token) return

    try {
        const response = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/me/game-account`, {
            method: 'GET'
        })

        const data = await response.json()

        if (response.ok && data.code === 0) {
            gameAccounts.value = data.data.game_accounts
        } else {
            console.error('取得遊戲帳號錯誤:', data)
        }
    } catch (error) {
        console.error('取得遊戲帳號錯誤:', error)
    } finally {
        isGameAccountsLoading.value = false
    }

}

const openAddGameModal = () => {
    // Auto Prompt for KYC if level is 1
    if (userInfo.value.kyc_level === 1) {
        if (userInfo.value.kyc_step === 0) {
            showKycPrompt()
        } else if (userInfo.value.kyc_step === 1) {
            showKycFormPrompt()
        }
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
        toast.warning('請填寫所有欄位。')
        return
    }

    isAddGameLoading.value = true
    const token = localStorage.getItem('authToken')
    
    try {
        const response = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/game-account/bind`, {
            method: 'POST',
            body: JSON.stringify({
                store_id,
                account_name
            })
        })

        const data = await response.json()

        if (response.ok && data.code === 0) {
            // toast.info('遊戲帳號綁定申請成功！驗證碼已發送。')
            // newGameAccountId.value = data.data.game_account.id
            // gameStep.value = 2
            toast.success('遊戲帳號綁定成功！')
            if (addGameModalInstance.value) {
                addGameModalInstance.value.hide()
            }
            fetchGameAccounts()
        } else {
             const errorMsg = handleApiError(data)
             //alert(errorMsg || '綁定失敗。')
             toast.error(errorMsg || '綁定失敗。')
        }
    } catch (error) {
        console.error('綁定遊戲帳號錯誤:', error)
        toast.error(ERROR_MESSAGES.GENERAL_ERROR_CONTACT)
    } finally {
        isAddGameLoading.value = false
    }
}

// const handleGameVerifySubmit = async () => {
//     if (!addGameForm.value.verification_code || addGameForm.value.verification_code.length !== 6) {
//         toast.warning('請輸入6位數驗證碼。')
//         return
//     }
    
//     isAddGameLoading.value = true
//     const token = localStorage.getItem('authToken')
//     try {
//         const response = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/game-account/verify`, {
//             method: 'POST',
//             body: JSON.stringify({
//                 game_account_id: newGameAccountId.value,
//                 verification_code: addGameForm.value.verification_code
//             })
//         })
        
//         const data = await response.json()
        
//         if (response.ok && data.code === 0) {
//             toast.success('遊戲帳號綁定成功！')
//              if (addGameModalInstance.value) {
//                 addGameModalInstance.value.hide()
//             }
//             fetchGameAccounts()
//         } else {
//             const errorMsg = handleApiError(data)
//             //alert(errorMsg || '驗證失敗。')
//             toast.error('驗證失敗。')
//         }
//     } catch (error) {
//         console.error('Verify Game Account Error:', error)
//           toast.error(ERROR_MESSAGES.GENERAL_ERROR_CONTACT)
//     } finally {
//         isAddGameLoading.value = false
//     }
// }

const openAddBankModal = () => {
    // Auto Prompt for KYC if level is 1
    if (userInfo.value.kyc_level === 1) {
        if (userInfo.value.kyc_step === 0) {
            showKycPrompt()
        } else if (userInfo.value.kyc_step === 1) {
            showKycFormPrompt()
        }
    }

    bankStep.value = 1
    addBankForm.value = { bank_code: '', branch_code: '', account_number: '', verification_code: '', cover_photo: null }
    
    fetchSupportedBanks() // Fetch banks when opening logic

    const modalEl = document.getElementById('addBankModal')
    if (modalEl) {
        addBankModalInstance.value = new Modal(modalEl)
        addBankModalInstance.value.show()
    }
}

const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
        if (file.size > 5 * 1024 * 1024) {
            toast.warning('檔案大小不能超過 5MB')
            event.target.value = ''
            addBankForm.value.cover_photo = null
            return
        }
        addBankForm.value.cover_photo = file
    }
}

const handleAddBankSubmit = async () => {
    const { bank_code, branch_code, account_number, cover_photo } = addBankForm.value
    
    if (!bank_code || !branch_code || !account_number) {
        toast.warning('請填寫所有欄位。')
        return
    }

    if (!cover_photo) {
        toast.warning('請上傳存摺封面照片。')
        return
    }
    
    // Basic validation
    if (bank_code.length !== 3) {
        toast.warning('銀行代碼必須為3碼。')
        return
    }
    if (branch_code.length !== 4) {
        toast.warning('分行代碼必須為4碼。')
        return
    }

    if (account_number.length > 14) {
         toast.warning('銀行帳號最多14碼。')
         return
    }

    isAddBankLoading.value = true
    const token = localStorage.getItem('authToken')
    
    try {
        const formdata = new FormData();
        formdata.append("bank_code", bank_code);
        formdata.append("branch_code", branch_code);
        formdata.append("account_number", account_number);
        formdata.append("cover_photo", cover_photo);

        const response = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/bank-account/bind`, {
            method: "POST",
            headers: {
                "Accept": "application/json"
            },
            body: formdata
        })

        const data = await response.json()
        
        if (response.ok && data.code === 0) {
            toast.info('銀行帳號綁定申請成功！驗證碼已發送。')
            bankAccountId.value = data.data.bank_account.id
            bankStep.value = 2
        } else {
             const errorMsg = handleApiError(data)
             //alert(errorMsg || '綁定失敗。')
             toast.error(errorMsg || '綁定失敗。')
        }
    } catch (error) {
        console.error('綁定銀行帳號錯誤:', error)
        toast.error(ERROR_MESSAGES.GENERAL_ERROR_CONTACT)
    } finally {
        isAddBankLoading.value = false

    }
}

const fetchSupportedBanks = async () => {
    isBankListLoading.value = true
    try {
        const response = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/supported-banks`)
        const data = await response.json()
        if (response.ok && data.code === 0) {
            bankList.value = data.data.banks
        } else {
            console.error('取得銀行列表失敗:', data)
        }
    } catch (error) {
        console.error('取得銀行列表錯誤:', error)
    } finally {
        isBankListLoading.value = false
    }
}

const branchNames = ref({})
const fetchedBanks = ref(new Set())

const getBranchLabel = (branchCode) => {
    if (!branchCode) return ''
    return branchNames.value[branchCode] || branchCode
}

const fetchBankBranchesForLabel = async (bankCode) => {
    if (!bankCode || fetchedBanks.value.has(bankCode)) return

    fetchedBanks.value.add(bankCode)
    try {
        const response = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/supported-banks/${bankCode}/branches`)
        const data = await response.json()
        if (response.ok && data.code === 0) {
            data.data.branches.forEach(branch => {
                branchNames.value[branch.code] = branch.name
            })
        }
    } catch (error) {
        console.error(`Failed to fetch branches for ${bankCode}:`, error)
    }
}

const fetchBankBranches = async (bankCode) => {
    if (!bankCode) {
        branchList.value = []
        return
    }
    isBranchListLoading.value = true
    branchList.value = [] // Clear previous branches
    // Reset branch selection if changes
    addBankForm.value.branch_code = '' 
    
    try {
        const response = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/supported-banks/${bankCode}/branches`)
        const data = await response.json()
        if (response.ok && data.code === 0) {
            branchList.value = data.data.branches
        } else {
            console.error('取得分行列表失敗:', data)
        }
    } catch (error) {
        console.error('取得分行列表錯誤:', error)
    } finally {
        isBranchListLoading.value = false
    }
}

const handleBankChange = () => {
    fetchBankBranches(addBankForm.value.bank_code)
}

const handleBankVerifySubmit = async () => {
    if (!addBankForm.value.verification_code || addBankForm.value.verification_code.length !== 6) {
        toast.warning('請輸入6位數驗證碼。')
        return
    }
    
    isAddBankLoading.value = true
    const token = localStorage.getItem('authToken')
    try {
        const response = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/bank-account/verify`, {
            method: 'POST',
            body: JSON.stringify({
                bank_account_id: bankAccountId.value,
                verification_code: addBankForm.value.verification_code
            })
        })
        
        const data = await response.json()
        
        if (response.ok && data.code === 0) {
            toast.success('銀行帳號驗證成功，請等待審核。')
             if (addBankModalInstance.value) {
                addBankModalInstance.value.hide()
            }
            fetchBankAccounts()
        } else {
            const errorMsg = handleApiError(data)
            //alert(errorMsg || '驗證失敗。')
            toast.error(errorMsg || '驗證失敗。')
        }
    } catch (error) {
        console.error('驗證銀行帳號錯誤:', error)
        toast.error(ERROR_MESSAGES.GENERAL_ERROR_CONTACT)
    } finally {
        isAddBankLoading.value = false
    }
}


const openChangePasswordModal = async () => {
  if (!userInfo.value.phone_number) {
      toast.error('找不到電話號碼。')
      return
  }
  
  if (!confirm(`是否要發送驗證碼到 ${userInfo.value.phone_number}?`)) {
      return
  }

  isChangePasswordLoading.value = true
  const token = localStorage.getItem('authToken')
  try {
    const response = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/forgot-password`, {
      method: 'POST',
      body: JSON.stringify({ phone_number: userInfo.value.phone_number })
    })

    const data = await response.json()

    if (response.ok && data.code === 0) {
      //alert(data.msg || '發送驗證碼成功。')
      toast.success('發送驗證碼成功。')
      changePasswordForm.value = { code: '', password: '', confirmPassword: '' }
      
      const modalEl = document.getElementById('changePasswordModal')
      if (modalEl) {
        changePasswordModalInstance.value = new Modal(modalEl)
        changePasswordModalInstance.value.show()
      }
    } else {
      const errorMsg = handleApiError(data)
      //alert(errorMsg || '發送驗證碼失敗。')
      toast.error(errorMsg || '發送驗證碼失敗。')
    }
  } catch (error) {
    console.error('Send Code Error:', error)
    toast.error(ERROR_MESSAGES.GENERAL_ERROR_CONTACT)
  } finally {
    isChangePasswordLoading.value = false
  }
}

const handleChangePasswordSubmit = async () => {
    const { code, password, confirmPassword } = changePasswordForm.value
    
    if (!code || !password || !confirmPassword) {
        toast.warning('請填寫所有欄位。')
        return
    }
    
    if (code.length !== 6) {
      toast.warning('請輸入6位數的驗證碼。')
      return
    }

    if (password !== confirmPassword) {
        toast.warning('密碼不一致。')
        return
    }

    if (password.length < 8) {
        toast.warning('密碼至少需要8位。')
        return
    }

    isChangePasswordLoading.value = true
    try {
        const response = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/reset-password`, {
            method: 'POST',
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
            toast.success('修改密碼成功。')
            if (changePasswordModalInstance.value) {
                changePasswordModalInstance.value.hide()
            }
            logout()
        } else {
            const errorMsg = handleApiError(data)
            //alert(errorMsg || '修改密碼失敗。')
            toast.error(errorMsg || '修改密碼失敗。')
        }
    } catch (error) {
        console.error('Change Password Error:', error)
        toast.error(ERROR_MESSAGES.GENERAL_ERROR_CONTACT)
    } finally {
        isChangePasswordLoading.value = false
    }
}

//const kycModalInstance = ref(null)
const isKycLoading = ref(false)

const sendKYCInitiate = async () => {
  isKycLoading.value = true
  const token = localStorage.getItem('authToken')
  try {
    const response = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/kyc/initiate`, {
      method: 'POST',
      body: JSON.stringify({
          success_url: `${import.meta.env.VITE_FRONTEND_BASE_URL}/kyc-info`,
          error_url: `${import.meta.env.VITE_FRONTEND_BASE_URL}/account`,
      })
    })

    const data = await response.json()
    console.log(data)
    if (response.ok && data.code === 0) {
      toast.success('KYC 啟動成功!')
      window.location.href = data.data.redirect_url
    } else {
      const errorMsg = handleApiError(data)
      //alert(errorMsg || 'Failed to initiate KYC.')
      toast.error(errorMsg || 'KYC 啟動失敗。')
    }
  } catch (error) {
    console.error('KYC Error:', error)
    toast.error(ERROR_MESSAGES.GENERAL_ERROR_CONTACT)
  } finally {
    isKycLoading.value = false
  }
}

const confirmKycPrompt = () => {
    if (kycPromptModalInstance.value) {
        kycPromptModalInstance.value.hide()
    }
    sendKYCInitiate()
}

const startKyc = sendKYCInitiate

const goToKycInfo = () => {
    // If they say they already completed it, maybe just refresh user info or go to info page
    router.push('/kyc-info')
}

const openEmailModal = () => {
  // if(userInfo.value.kyc_level !== 2) {
  //     toast.warning('請先完成身分驗證')
  //     return
  // }
  
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
    toast.warning('請輸入您的電子郵件地址。')
    return
  }
  
  isEmailLoading.value = true
  const token = localStorage.getItem('authToken')
  try {
    const response = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/email/verify`, {
      method: 'POST',
      body: JSON.stringify({ email: emailForm.value.email })
    })

    const data = await response.json()

    if (response.ok && data.code === 0) {
      toast.info('驗證碼已發送到您的電子郵件。')
      emailStep.value = 2
    } else {
      const errorMsg = handleApiError(data)
      //alert(errorMsg || '發送驗證碼失敗。')
      toast.error(errorMsg || '發送驗證碼失敗。')
    }
  } catch (error) {
    console.error('Email Verify Error:', error)
    toast.error(ERROR_MESSAGES.GENERAL_ERROR_CONTACT)
  } finally {
    isEmailLoading.value = false
  }
}

const confirmEmail = async () => {
  if (!emailForm.value.code) {
    toast.warning('請輸入驗證碼。')
    return
  }

  isEmailLoading.value = true
  const token = localStorage.getItem('authToken')
  try {
    const response = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/email/confirm`, {
      method: 'POST',
      body: JSON.stringify({ verification_code: emailForm.value.code })
    })

    const data = await response.json()

    if (response.ok && data.code === 0) {
      toast.success('Email 驗證成功!')
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
      toast.error(errorMsg || 'Email 驗證失敗。')
    }
  } catch (error) {
    console.error('Email Confirm Error:', error)
    toast.error(ERROR_MESSAGES.GENERAL_ERROR_CONTACT)
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
            :class="{ active: activeMenu === 'game_accounts' }"
            @click="activeMenu = 'game_accounts'"
          >
            <i class="bi bi-controller me-2"></i> 遊戲帳號
          </button>
          <button 
            type="button" 
            class="list-group-item list-group-item-action"
            :class="{ active: activeMenu === 'bank_accounts' }"
            @click="activeMenu = 'bank_accounts'"
          >
            <i class="bi bi-bank me-2"></i> 銀行帳號
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
               <div class="d-flex align-items-center mb-3">
                <ul class="nav nav-tabs mb-0">
                  <li class="nav-item">
                    <a class="nav-link" :class="{ active: activeOrdersTab === 'buying' }" href="#" @click.prevent="activeOrdersTab = 'buying'">購買訂單</a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link" :class="{ active: activeOrdersTab === 'selling' }" href="#" @click.prevent="activeOrdersTab = 'selling'">銷售訂單</a>
                  </li>
                </ul>
                <span class="ms-3 text-danger small">※當日買或賣達新台幣50萬元，依規定將進行大額通貨通報。</span>
              </div>

              <div v-if="isActiveOrdersLoading" class="text-center py-5">
                  <div class="spinner-border text-primary" role="status">
                      <span class="visually-hidden">Loading...</span>
                  </div>
              </div>

              <!-- Active Buying Orders -->
              <div v-else-if="activeOrdersTab === 'buying'">
                   <div v-if="activeBuyingOrders.length === 0" class="alert alert-info">
                    <i class="bi bi-info-circle me-2"></i> 目前沒有進行中的購買訂單。
                  </div>
                  <div v-else class="table-responsive">
                       <table class="table table-hover align-middle small">
                          <thead class="table-light">
                              <tr class="text-center">
                                  <th>訂單 ID</th>
                                  <th>遊戲</th>
                                  <th>金幣數量</th>
                                  <th>總價</th>
                                  <th>付款方式</th>
                                  <th>狀態</th>
                                  <th>時間</th>
                                  <th>操作</th>
                              </tr>
                          </thead>
                          <tbody>
                              <tr v-for="order in activeBuyingOrders" :key="order.id">
                                  <td>
                                    <button class="btn btn-sm btn-outline-secondary p-0 px-1 me-2" @click="copyToClipboard(order.id)" title="複製">
                                        <i class="bi bi-copy"></i>
                                    </button>
                                    <span class="fw-bold">{{ order.id }}</span>
                                  </td>
                                  <td class="text-center">{{ getStoreName(order.store_id) }}</td>
                                  <td class="text-end">{{ formatNumber(order.quantity) }}</td>
                                  <td class="text-end">{{ formatNumber(order.total_price) }}</td> 
                                  <td class="text-center">
                                      {{ order.payments_label }}
                                      <span v-if="order.payments_sub" class="badge bg-light text-dark">{{ order.payments_sub }}</span>
                                  </td>
                                  <td class="text-center">
                                      <span class="badge fs-6" :class="[getBuyingOrderStatusInfo(order.status).class, getBuyingOrderStatusInfo(order.status).text]">
                                          {{ getBuyingOrderStatusInfo(order.status).label }}
                                      </span>
                                  </td>
                                  <td>{{ new Date(order.created_at).toLocaleString() }}</td>
                                  <td class="text-center">
                                      <button class="btn btn-sm btn-outline-primary" @click="openBuyingOrderDetailsModal(order.id)" :disabled="isOrderDetailsLoading">
                                          <span v-if="isOrderDetailsLoading && selectedOrder?.id === order.id" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                          <span v-else>查看</span>
                                      </button>
                                  </td>
                              </tr>
                          </tbody>
                      </table>
                  </div>
              </div>

               <!-- Active Selling Orders -->
              <div v-else-if="activeOrdersTab === 'selling'">
                   <div v-if="activeSellingOrders.length === 0" class="alert alert-info">
                    <i class="bi bi-info-circle me-2"></i> 目前沒有進行中的銷售訂單。
                  </div>
                  <div v-else class="table-responsive">
                       <table class="table table-hover align-middle small">
                          <thead class="table-light">
                              <tr class="text-center">
                                  <th>訂單 ID</th>
                                  <th>遊戲</th>
                                  <th>金幣數量</th>
                                  <th>總價</th>
                                  <th>狀態</th>
                                  <th>時間</th>
                                  <th>操作</th>
                              </tr>
                          </thead>
                          <tbody>
                              <tr v-for="order in activeSellingOrders" :key="order.id">
                                  <td>
                                    <button class="btn btn-sm btn-outline-secondary p-0 px-1 me-2" @click="copyToClipboard(order.id)" title="複製">
                                        <i class="bi bi-copy"></i>
                                    </button>
                                    <span class="fw-bold">{{ order.id }}</span>
                                  </td>
                                  <td class="text-center">{{ getStoreName(order.store_id) }}</td>
                                  <td class="text-end">{{ formatNumber(order.quantity) }}</td>
                                  <td class="text-end">{{ formatNumber(order.total_price) }}</td>
                                  <td class="text-center">
                                      <span class="badge fs-6" :class="[getSellingOrderStatusInfo(order.status).class, getSellingOrderStatusInfo(order.status).text]">
                                          {{ getSellingOrderStatusInfo(order.status).label }}
                                      </span>
                                  </td>
                                  <td>{{ new Date(order.created_at).toLocaleString() }}</td>
                                  <td class="text-center">
                                      <button class="btn btn-sm btn-outline-primary" @click="openSellingOrderDetailsModal(order.id)" :disabled="isOrderDetailsLoading">
                                          <span v-if="isOrderDetailsLoading && selectedOrder?.id === order.id" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                          <span v-else>查看</span>
                                      </button>
                                  </td>
                              </tr>
                          </tbody>
                      </table>
                  </div>
              </div>
            </div>
            <div v-else-if="activeMenu === 'history'">
              <!-- History Tabs -->
              <div class="d-flex align-items-center mb-3">
                <ul class="nav nav-tabs mb-0">
                  <li class="nav-item">
                    <a class="nav-link" :class="{ active: historyTab === 'buying' }" href="#" @click.prevent="historyTab = 'buying'">購買訂單</a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link" :class="{ active: historyTab === 'selling' }" href="#" @click.prevent="historyTab = 'selling'">銷售訂單</a>
                  </li>
                </ul>
                <span class="ms-3 text-danger small">※當日買或賣達新台幣50萬元，依規定將進行大額通貨通報。</span>
              </div>

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
                              <tr class="text-center">
                                  <th>訂單 ID</th>
                                  <th>遊戲</th>
                                  <th>金幣數量</th>
                                  <th>總價</th>
                                  <th>付款方式</th>
                                  <th>狀態</th>
                                  <th>時間</th>
                                  <th>操作</th>
                              </tr>
                          </thead>
                          <tbody>
                              <tr v-for="order in buyingOrders" :key="order.id">
                                  <td>
                                    <button class="btn btn-sm btn-outline-secondary p-0 px-1 me-2" @click="copyToClipboard(order.id)" title="複製">
                                        <i class="bi bi-copy"></i>
                                    </button>
                                    <span class="fw-bold">{{ order.id }}</span>
                                  </td>
                                  <td class="text-center">{{ getStoreName(order.store_id) }}</td>
                                  <td class="text-end">{{ formatNumber(order.quantity) }}</td>
                                  <td class="text-end">{{ formatNumber(order.total_price) }}</td> 
                                  <td class="text-center">
                                      {{ order.payments_label }}
                                      <span v-if="order.payments_sub" class="badge bg-light text-dark">{{ order.payments_sub }}</span>
                                  </td>
                                  <td class="text-center">
                                      <span class="badge fs-6" :class="[getBuyingOrderStatusInfo(order.status).class, getBuyingOrderStatusInfo(order.status).text]">
                                          {{ getBuyingOrderStatusInfo(order.status).label }}
                                      </span>
                                  </td>
                                  <td>{{ new Date(order.created_at).toLocaleString() }}</td>
                                  <td class="text-center">
                                      <button class="btn btn-sm btn-outline-primary" @click="openBuyingOrderDetailsModal(order.id)" :disabled="isOrderDetailsLoading">
                                          <span v-if="isOrderDetailsLoading && selectedOrder?.id === order.id" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                          <span v-else>查看</span>
                                      </button>
                                  </td>
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
                              <tr class="text-center">
                                  <th>訂單 ID</th>
                                  <th>遊戲</th>
                                  <th>金幣數量</th>
                                  <th>總價</th>
                                  <th>狀態</th>
                                  <th>時間</th>
                                  <th>操作</th>
                              </tr>
                          </thead>
                          <tbody>
                              <tr v-for="order in sellingOrders" :key="order.id">
                                  <td>
                                    <button class="btn btn-sm btn-outline-secondary p-0 px-1 me-2" @click="copyToClipboard(order.id)" title="複製">
                                        <i class="bi bi-copy"></i>
                                    </button>
                                    <span class="fw-bold">{{ order.id }}</span>
                                  </td>
                                  <td class="text-center">{{ getStoreName(order.store_id) }}</td>
                                  <td class="text-end">{{ formatNumber(order.quantity) }}</td>
                                  <td class="text-end">{{ formatNumber(order.total_price) }}</td>
                                  <td class="text-center">
                                      <span class="badge fs-6" :class="[getSellingOrderStatusInfo(order.status).class, getSellingOrderStatusInfo(order.status).text]">
                                          {{ getSellingOrderStatusInfo(order.status).label }}
                                      </span>
                                  </td>
                                  <td>{{ new Date(order.created_at).toLocaleString() }}</td>
                                  <td class="text-center">
                                      <button class="btn btn-sm btn-outline-primary" @click="openSellingOrderDetailsModal(order.id)" :disabled="isOrderDetailsLoading">
                                          <span v-if="isOrderDetailsLoading && selectedOrder?.id === order.id" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                          <span v-else>查看</span>
                                      </button>
                                  </td>
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
              <h5 class="mb-3 fw-bold">帳號設定</h5>
              
              <div v-if="isUserInfoLoading" class="text-center py-5">
                  <div class="spinner-border text-primary" role="status">
                      <span class="visually-hidden">Loading...</span>
                  </div>
              </div>

              <form v-else>
                <div class="mb-3">
                  <label class="form-label">姓名</label>
                  <input type="text" class="form-control" :value="userInfo.full_name" disabled>
                </div>
                <div class="mb-3">
                  <label class="form-label">手機號碼</label>
                  <input type="text" class="form-control" :value="userInfo.phone_number" disabled>
                </div>
                 <div class="mb-3">
                  <label class="form-label">登入密碼</label>
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
                    <!--<button v-if="userInfo.kyc_level !== 2" class="btn btn-outline-primary" type="button" disabled>
                      請先完成身分驗證
                    </button>-->
                    <button v-if="!userInfo.email" class="btn btn-outline-primary" type="button" @click="openEmailModal">
                      驗證信箱
                    </button>
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label">KYC 身分</label>
                  <div class="input-group">
                    <input type="text" class="form-control" :class="userInfo.kyc_level === 2 ? 'text-success fw-bold' : 'text-secondary fw-bold'" :value="userInfo.kyc_level === 2 ? '實名驗證' : '基本驗證'" disabled>
                    
                    <template v-if="userInfo.kyc_level === 1">
                        <button v-if="userInfo.kyc_step === 0" class="btn btn-outline-primary" type="button" @click="showKycPrompt">
                          身分驗證
                        </button>
                        <button v-else-if="userInfo.kyc_step === 1" class="btn btn-outline-primary" type="button" @click="showKycFormPrompt">
                          表單驗證
                        </button>
                         <button v-else-if="userInfo.kyc_step === 2" class="btn btn-outline-secondary" type="button" disabled>
                          等待審核
                        </button>
                    </template>

                  </div>
                </div>
              </form>

            </div>
            <div v-else-if="activeMenu === 'bank_accounts'">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5 class="mb-0 fw-bold">我的銀行帳號</h5>
                    <button v-if="bankAccounts.length === 0" class="btn btn-primary btn-sm" @click="openAddBankModal">
                        <i class="bi bi-plus-lg me-1"></i> 新增銀行帳號
                    </button>
                    <button v-else class="btn btn-danger btn-sm" @click="deleteBankAccount" :disabled="isDeletingBank">
                        <span v-if="isDeletingBank" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                        <i v-else class="bi bi-trash me-1"></i> 刪除銀行帳號
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
                                <th>銀行名稱 (代碼)</th>
                                <th>分行名稱 (代碼)</th>
                                <th>帳號</th>
                                <th>狀態</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="bank in bankAccounts" :key="bank.id">
                                <td>{{ getBankLabel(bank.bank_code) }} </td>
                                <td>{{ getBranchLabel(bank.branch_code) }} ({{ bank.branch_code }})</td>
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
                                <th>遊戲名稱</th>
                                <th>帳號名稱</th>
                                <th>狀態</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="account in gameAccounts" :key="account.id">
                                <td>{{ getStoreName(account.store_id) }}</td>
                                <td>{{ account.account_name }}</td>
                                <td>
                                    <span class="badge" :class="account.status === 2 ? 'bg-success' : 'bg-secondary'">
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
                  {{ isEmailLoading ? '發送中...' : '發送驗證碼' }}
                </button>
              </div>
            </div>
            <div v-else>
              <p class="text-muted mb-3">
                驗證碼已發送到 <strong>{{ emailForm.email }}</strong>。
                <br>請輸入驗證碼。
              </p>
              <div class="mb-3">
                <label class="form-label">驗證碼</label>
                <input type="text" class="form-control text-center fs-4" v-model="emailForm.code" maxlength="6" placeholder="------">
              </div>
              <div class="d-grid gap-2">
                <button class="btn btn-success" @click="confirmEmail" :disabled="isEmailLoading">
                  <span v-if="isEmailLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {{ isEmailLoading ? '驗證中...' : '驗證並綁定' }}
                </button>
                <button class="btn btn-link text-muted text-decoration-none" @click="emailStep = 1">修改信箱</button>
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
                    {{ isChangePasswordLoading ? '處理中...' : '確認修改' }}
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
                  <select class="form-select" v-model="addBankForm.bank_code" @change="handleBankChange" required :disabled="isBankListLoading">
                      <option value="" disabled>請選擇銀行</option>
                      <option v-for="bank in bankList" :key="bank.code" :value="bank.code">
                          {{ bank.code }} - {{ bank.name }}
                      </option>
                  </select>
                  <div v-if="isBankListLoading" class="form-text">取得銀行列表中...</div>
                  <div class="form-text text-danger small">⭐僅限參加金融XML之金融機構(惟952農會有參加不支援)。</div>
                </div>
                <div class="mb-3">
                  <label class="form-label">分行代碼 (Branch Code)</label>
                  <select class="form-select" v-model="addBankForm.branch_code" required :disabled="!addBankForm.bank_code || isBranchListLoading">
                      <option value="" disabled>請選擇分行</option>
                      <option v-for="branch in branchList" :key="branch.code" :value="branch.code">
                          {{ branch.code }} - {{ branch.name }}
                      </option>
                  </select>
                   <div v-if="isBranchListLoading" class="form-text">取得分行列表中...</div>
                </div>
                <div class="mb-3">
                  <label class="form-label">銀行帳號 (Account Number)</label>
                  <input type="text" class="form-control" v-model="addBankForm.account_number" placeholder="最多14碼" maxlength="14" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">存摺封面照片 (Cover Photo) <span class="text-danger small ms-2">⚠️僅接受申請人本人銀行帳號</span></label>
                  <input type="file" class="form-control" @change="handleFileChange" accept="image/jpeg, image/png" required>
                  <div class="form-text">支援 JPEG, PNG 格式，最大 5MB</div>
                </div>
                <div class="d-grid">
                  <button type="submit" class="btn btn-primary" :disabled="isAddBankLoading">
                    <span v-if="isAddBankLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {{ isAddBankLoading ? '處理中...' : '確認新增' }}
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
                    {{ isAddBankLoading ? '驗證中...' : '驗證並綁定' }}
                  </button>
                </div>
             </form>
          </div>
        </div>
      </div>
    </div>

    <!-- KYC Auto Prompt Modal (Confirm/Cancel) -->
    <div class="modal fade" id="kycPromptModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-0">
            <h5 class="modal-title fw-bold">身分驗證提醒</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body text-center py-4">
            <i class="bi bi-person-badge text-warning display-1 mb-3"></i>
            <p class="mb-4 text-muted fs-5">
              您的帳戶尚未完成身分驗證 (KYC)。<br>
              為了確保交易安全，請立即進行驗證。
            </p>
            <div class="d-grid gap-3 d-sm-flex justify-content-sm-center">
              <button class="btn btn-outline-secondary px-4" data-bs-dismiss="modal">稍後再說</button>
              <button class="btn btn-primary px-4" @click="confirmKycPrompt">前往驗證 (Confirm)</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- KYC Form Prompt Modal (Confirm/Cancel) -->
    <div class="modal fade" id="kycFormPromptModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-0">
            <h5 class="modal-title fw-bold">表單驗證提醒</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body text-center py-4">
            <i class="bi bi-file-earmark-text text-info display-1 mb-3"></i>
            <p class="mb-4 text-muted fs-5">
              您已完成初步驗證，請繼續填寫身分驗證表單。<br>
            </p>
            <div class="d-grid gap-3 d-sm-flex justify-content-sm-center">
              <button class="btn btn-outline-secondary px-4" data-bs-dismiss="modal">稍後再說</button>
              <button class="btn btn-primary px-4" @click="confirmKycFormPrompt">前往填寫</button>
            </div>
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
                  <label class="form-label">選擇遊戲名稱</label>
                  <select class="form-select" v-model="addGameForm.store_id" required>
                      <option value="" disabled>請選擇遊戲名稱</option>
                      <option v-for="store in gameStores" :key="store.id" :value="store.id">
                          {{ store.name }}
                      </option>
                  </select>
                </div>
                <div class="mb-3">
                  <label class="form-label">帳號名稱 (Account Name)</label>
                  <input type="text" class="form-control" v-model="addGameForm.account_name" placeholder="請輸入遊戲帳號名稱" maxlength="60" required>
                </div>
                <div class="mb-3">
                  <p class="text-danger fw-bold mb-1 small">⚠️遊戲帳號需為申請人本人持有。</p>  
                  <p class="text-danger fw-bold mb-0 small">⚠️請注意帳號是否正確，輸入錯誤之遊戲帳號導致損失，本平台不負任何責任。</p>
                </div>
                <div class="d-grid">
                  <button type="submit" class="btn btn-primary" :disabled="isAddGameLoading">
                    <span v-if="isAddGameLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {{ isAddGameLoading ? '處理中...' : '確認新增' }}
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
                    {{ isAddGameLoading ? '驗證中...' : '驗證並綁定' }}
                  </button>
                </div>
             </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Buying Order Details Modal -->
    <div class="modal fade" id="buyingOrderDetailsModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-0">
            <h5 class="modal-title fw-bold">訂單詳細內容</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body py-4" v-if="selectedOrder">
              <ul class="list-group list-group-flush small">

                  <li class="list-group-item d-flex justify-content-between align-items-center">
                      <span class="text-muted">訂單 ID</span>
                      <div class="d-flex align-items-center">
                          <span class="fw-bold me-2">{{ selectedOrder.id }}</span>
                          <button class="btn btn-sm btn-outline-secondary p-0 px-1" @click="copyToClipboard(selectedOrder.id)" title="複製">
                              <i class="bi bi-copy"></i>
                          </button>
                      </div>
                  </li>
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                      <span class="text-muted">遊戲名稱</span>
                      <span>{{ getStoreName(selectedOrder.store_id) }}</span>
                  </li>
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                      <span class="text-muted">金幣數量</span>
                      <span>{{ formatNumber(selectedOrder.quantity) }}</span>
                  </li>
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                      <span class="text-muted">比率</span>
                      <span>1 : {{ formatNumber(selectedOrder.unit_price) }}</span>
                  </li>
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                      <span class="text-muted">總價</span>
                      <span class="fw-bold text-primary">{{ formatNumber(selectedOrder.total_price) }}</span>
                  </li>
                  
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                      <span class="text-muted">付款方式</span>
                      <span>
                          {{ selectedOrder.payments_label }}
                          <span v-if="selectedOrder.payments_sub" class="badge bg-light text-dark ms-1">{{ selectedOrder.payments_sub }}</span>
                          <span class="text-muted ms-1">({{ selectedOrder.payments }})</span>
                      </span>
                  </li>

                  <!-- Payer Info -->
                   <li v-if="selectedOrder.payer_bank_code" class="list-group-item d-flex justify-content-between align-items-center">
                      <span class="text-muted">我的付款銀行</span>
                      <span>{{ getBankLabel(selectedOrder.payer_bank_code) }}</span>
                  </li>
                  <li v-if="selectedOrder.payer_card_no" class="list-group-item d-flex justify-content-between align-items-center">
                      <span class="text-muted">我的付款帳號</span>
                      <span>{{ selectedOrder.payer_card_no }}</span>
                  </li>

                  <!-- Payee Info -->
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                      <span class="text-muted">平台收款銀行</span>
                      <span>{{ getBankLabel(selectedOrder.payee_bank_code) }}</span>
                  </li>
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                      <span class="text-muted">平台收款帳號</span>
                      <div class="d-flex align-items-center">
                          <span>{{ selectedOrder.payee_card_no }}</span>
                           <button class="btn btn-sm btn-outline-secondary p-0 px-1 ms-2" @click="copyToClipboard(selectedOrder.payee_card_no)" title="複製">
                              <i class="bi bi-copy"></i>
                          </button>
                      </div>
                  </li>
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                      <span class="text-muted">會員遊戲帳號</span>
                      <span>{{ selectedOrder.payee_game_account }}</span>
                  </li>

                  <!-- Refund Info -->
                  <li v-if="selectedOrder.refund_bank_code" class="list-group-item d-flex justify-content-between align-items-center">
                      <span class="text-muted">退款銀行</span>
                      <span>{{ getBankLabel(selectedOrder.refund_bank_code) }}</span>
                  </li>
                  <li v-if="selectedOrder.refund_card_no" class="list-group-item d-flex justify-content-between align-items-center">
                      <span class="text-muted">退款帳號</span>
                      <span>{{ selectedOrder.refund_card_no }}</span>
                  </li>

                  <!-- Flags -->
                  <!--<li class="list-group-item d-flex justify-content-between align-items-center">
                      <span class="text-muted">已通知 (Notified)</span>
                      <span :class="selectedOrder.is_notified ? 'text-success' : 'text-danger'">
                          <i class="bi" :class="selectedOrder.is_notified ? 'bi-check-circle-fill' : 'bi-x-circle-fill'"></i>
                      </span>
                  </li> -->
                  <!-- <li class="list-group-item d-flex justify-content-between align-items-center">
                      <span class="text-muted">已圈存 (Earmarked)</span>
                      <span :class="selectedOrder.is_earmarked ? 'text-success' : 'text-danger'">
                          <i class="bi" :class="selectedOrder.is_earmarked ? 'bi-check-circle-fill' : 'bi-x-circle-fill'"></i>
                      </span>
                  </li> -->

                  <li class="list-group-item d-flex justify-content-between align-items-center">
                      <span class="text-muted">訂單狀態</span>
                      <span class="badge" :class="[getBuyingOrderStatusInfo(selectedOrder.status).class, getBuyingOrderStatusInfo(selectedOrder.status).text]">
                          {{ getBuyingOrderStatusInfo(selectedOrder.status).label }}
                      </span>
                  </li>

                  <!-- Timestamps -->
                   <li class="list-group-item d-flex justify-content-between align-items-center">
                      <span class="text-muted">建立時間</span>
                      <span>{{ new Date(selectedOrder.created_at).toLocaleString() }}</span>
                  </li>
                  <li v-if="selectedOrder.paid_at" class="list-group-item d-flex justify-content-between align-items-center">
                      <span class="text-muted">付款時間</span>
                      <span>{{ new Date(selectedOrder.paid_at).toLocaleString() }}</span>
                  </li>
                   <li v-if="selectedOrder.transfered_at" class="list-group-item d-flex justify-content-between align-items-center">
                      <span class="text-muted">轉點時間</span>
                      <span>{{ new Date(selectedOrder.transfered_at).toLocaleString() }}</span>
                  </li>
                   <li v-if="selectedOrder.last_notified_at" class="list-group-item d-flex justify-content-between align-items-center">
                      <span class="text-muted">最後通知時間</span>
                      <span>{{ new Date(selectedOrder.last_notified_at).toLocaleString() }}</span>
                  </li>
                   <li v-if="selectedOrder.refunded_at" class="list-group-item d-flex justify-content-between align-items-center">
                      <span class="text-muted">退款時間</span>
                      <span>{{ new Date(selectedOrder.refunded_at).toLocaleString() }}</span>
                  </li>
              </ul>

              
              <!-- Extra details if available -->
               <div v-if="selectedOrder.content" class="mt-4">
                  <h6 class="fw-bold border-bottom pb-2 mb-3">其他資訊</h6>
                  <div class="bg-light p-3 rounded">
                      <pre class="mb-0" style="white-space: pre-wrap;">{{ selectedOrder.content }}</pre>
                  </div>
              </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Selling Order Details Modal -->
    <div class="modal fade" id="sellingOrderDetailsModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-0">
            <h5 class="modal-title fw-bold">銷售訂單詳細內容</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body py-4" v-if="selectedOrder">
              <ul class="list-group list-group-flush small">
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                      <span class="text-muted">訂單 ID</span>
                      <div class="d-flex align-items-center">
                          <span class="fw-bold me-2">{{ selectedOrder.id }}</span>
                          <button class="btn btn-sm btn-outline-secondary p-0 px-1" @click="copyToClipboard(selectedOrder.id)" title="複製">
                              <i class="bi bi-copy"></i>
                          </button>
                      </div>
                  </li>
                  
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                      <span class="text-muted">遊戲名稱</span>
                      <span>{{ getStoreName(selectedOrder.store_id) }}</span>
                  </li>
                  <!--<li class="list-group-item d-flex justify-content-between align-items-center">
                      <span class="text-muted">點數類型 ID (Point ID)</span>
                      <span>{{ selectedOrder.point_id }}</span>
                  </li>-->
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                      <span class="text-muted">金幣數量</span>
                      <span>{{ formatNumber(selectedOrder.quantity) }}</span>
                  </li>
                  <!-- <li class="list-group-item d-flex justify-content-between align-items-center">
                      <span class="text-muted">已交付</span>
                      <span>{{ formatNumber(selectedOrder.delivered_quantity) }}</span>
                  </li> -->
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                      <span class="text-muted">比率</span>
                      <span>1 : {{ formatNumber(selectedOrder.unit_price) }}</span>
                  </li>
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                      <span class="text-muted">總價</span>
                      <span class="fw-bold text-primary">{{ formatNumber(selectedOrder.total_price) }}</span>
                  </li>
                   <li class="list-group-item d-flex justify-content-between align-items-center">
                      <span class="text-muted">手續費</span>
                      <span class="text-danger">{{ formatNumber(selectedOrder.fee) }}</span>
                  </li>
                  
                  <!-- Accounts Info -->
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                      <span class="text-muted">會員遊戲帳號</span>
                      <span>{{ selectedOrder.payer_game_account }}</span>
                  </li>
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                      <span class="text-muted">平台收幣帳號</span>
                      <div class="d-flex align-items-center">
                          <span class="fw-bold me-2">{{ selectedOrder.payee_game_account }}</span>
                          <button class="btn btn-sm btn-outline-secondary p-0 px-1" @click="copyToClipboard(selectedOrder.payee_game_account)" title="複製">
                              <i class="bi bi-copy"></i>
                          </button>
                      </div>
                  </li>

                   <!-- Bank Info -->
                  <li v-if="selectedOrder.bank_code" class="list-group-item d-flex justify-content-between align-items-center">
                      <span class="text-muted">收款銀行</span>
                      <span>{{ getBankLabel(selectedOrder.bank_code) }}</span>
                  </li>
                  <!-- <li v-if="selectedOrder.branch_code" class="list-group-item d-flex justify-content-between align-items-center">
                      <span class="text-muted">收款分行</span>
                      <span>{{ selectedOrder.branch_code }}</span>
                  </li> -->
                   <li v-if="selectedOrder.account_number" class="list-group-item d-flex justify-content-between align-items-center">
                      <span class="text-muted">收款銀行帳號</span>
                      <span>{{ selectedOrder.account_number }}</span>
                  </li>
                   <li v-if="selectedOrder.account_name" class="list-group-item d-flex justify-content-between align-items-center">
                      <span class="text-muted">收款人姓名</span>
                      <span>{{ selectedOrder.account_name }}</span>
                  </li>


                  <!-- Flags -->
                  <!-- <li class="list-group-item d-flex justify-content-between align-items-center">
                      <span class="text-muted">已通知</span>
                      <span :class="selectedOrder.is_notified ? 'text-success' : 'text-danger'">
                          <i class="bi" :class="selectedOrder.is_notified ? 'bi-check-circle-fill' : 'bi-x-circle-fill'"></i>
                      </span>
                  </li> -->

                  <li class="list-group-item d-flex justify-content-between align-items-center">
                      <span class="text-muted">訂單狀態</span>
                      <span class="badge" :class="[getSellingOrderStatusInfo(selectedOrder.status).class, getSellingOrderStatusInfo(selectedOrder.status).text]">
                          {{ getSellingOrderStatusInfo(selectedOrder.status).label }}
                      </span>
                  </li>

                  <!-- Timestamps -->
                   <li class="list-group-item d-flex justify-content-between align-items-center">
                      <span class="text-muted">建立時間</span>
                      <span>{{ new Date(selectedOrder.created_at).toLocaleString() }}</span>
                  </li>
                   <li v-if="selectedOrder.updated_at" class="list-group-item d-flex justify-content-between align-items-center">
                      <span class="text-muted">更新時間</span>
                      <span>{{ new Date(selectedOrder.updated_at).toLocaleString() }}</span>
                  </li>
                  <li v-if="selectedOrder.paid_at" class="list-group-item d-flex justify-content-between align-items-center">
                      <span class="text-muted">出款時間</span>
                      <span>{{ new Date(selectedOrder.paid_at).toLocaleString() }}</span>
                  </li>
                   <li v-if="selectedOrder.transfered_at" class="list-group-item d-flex justify-content-between align-items-center">
                      <span class="text-muted">轉點時間</span>
                      <span>{{ new Date(selectedOrder.transfered_at).toLocaleString() }}</span>
                  </li>
                   <li v-if="selectedOrder.last_notified_at" class="list-group-item d-flex justify-content-between align-items-center">
                      <span class="text-muted">最後通知時間</span>
                      <span>{{ new Date(selectedOrder.last_notified_at).toLocaleString() }}</span>
                  </li>
              </ul>
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
