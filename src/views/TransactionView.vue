<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { formatNumber, parseNumber } from '../utils/format'
import { useToast } from '../composables/useToast'
import { useRoute, useRouter } from 'vue-router'
import { Modal } from 'bootstrap'
import { useUserAccounts } from '../composables/useUserAccounts'
import { apiFetch } from '../utils/api'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const txType = ref(route.query.type === 'sell' ? 'sell' : 'buy')
const isLoading = ref(true)
const isSubmitting = ref(false)
const transactionType = computed(() => txType.value === 'sell' ? 'Sell' : 'Buy')
const gameName = computed(() => route.query.game || 'Unknown Game')

const toggleTransactionType = (type) => {
  if (txType.value !== type) {
    // Navigate to new URL with updated type, keeping existing query params
    router.replace({
      query: {
        ...route.query,
        type: type === 'buy' ? 'buy' : 'sell' // 'buy' is usually default but good to be explicit
      }
    })
  }
}

// Watch for route query changes to update local state
watch(() => route.query.type, (newType) => {
    const type = newType === 'sell' ? 'sell' : 'buy'
    if (txType.value !== type) {
        txType.value = type
        // Refresh rate when type changes
        fetchStoreDetails()
        // Reset amounts on type change to avoid confusion (re-linkage)
        twdAmount.value = 0
        gameCurrencyAmount.value = 0
        showOtpSection.value = false
    }
})


// Rate from API
const exchangeRate = ref(0)
const storeDetails = ref(null)

const fetchStoreDetails = async () => {
    const storeId = route.query.storeId
    if (!storeId) return

    try {
        const response = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/stores/${storeId}`)
        const data = await response.json()

        if (response.ok && data.code === 0) {
            storeDetails.value = data.data.store
            // Assume first point type for now as per requirement context, or logic to select point?
            // Requirement just says "get buy/sell rate". I'll take the first point's rates.
            // Access rates directly from store object as verified by API pattern
            if (txType.value === 'sell') {
                 // User Sell Currency (Dealer Buy) -> Use buying_rate
                 exchangeRate.value = storeDetails.value.buying_rate
            } else {
                 // User Buy Currency (Dealer Sell) -> Use selling_rate
                 exchangeRate.value = storeDetails.value.selling_rate
            }
        }
    } catch (error) {
        console.error('取得商店設定錯誤:', error)
    }
}

const { gameAccounts, bankAccounts, fetchGameAccounts, fetchBankAccounts } = useUserAccounts()

const validBankAccounts = computed(() => {
    if (!bankAccounts.value) return []
    return bankAccounts.value.filter(acc => acc.status === 2)
})

const validGameAccounts = computed(() => {
    if (!gameAccounts.value) return []
    const currentStoreId = route.query.storeId
    return gameAccounts.value.filter(acc => acc.status === 2 && acc.store_id === currentStoreId)
})

onMounted(async () => {
    isLoading.value = true
    try {
        await Promise.all([
            fetchStoreDetails(),
            fetchGameAccounts(),
            fetchBankAccounts()
        ])
        
        // Set defaults if available
        if (validGameAccounts.value.length > 0) {
            selectedGameAccount.value = validGameAccounts.value[0].id
        }
        if (validBankAccounts.value.length > 0) {
            selectedBankAccount.value = validBankAccounts.value[0].id
        }
    } catch (error) {
        console.error('Initialization Error:', error)
    } finally {
        isLoading.value = false
    }
})

const twdAmount = ref(0)
const gameCurrencyAmount = ref(0)

const displayTwdAmount = computed({
    get: () => formatNumber(twdAmount.value),
    set: (val) => {
        twdAmount.value = parseNumber(val)
    }
})

const displayGameCurrencyAmount = computed({
    get: () => formatNumber(gameCurrencyAmount.value),
    set: (val) => {
        gameCurrencyAmount.value = parseNumber(val)
    }
})
const isUpdating = ref(false)

const promotions = ['No Promotion', 'Summer Sale - 5% Bonus', 'New User - 100 Extra Coins']
const selectedPromotion = ref(promotions[0])

// Accounts are now fetched dynamically
const selectedGameAccount = ref('')
const selectedBankAccount = ref('')

const showOtpSection = ref(false)
const termsChecked1 = ref(false)
const termsChecked2 = ref(false)
const otpCode = ref('')

// Bidirectional Conversion
watch(twdAmount, (newVal) => {
  if (isUpdating.value) return
  isUpdating.value = true
  if (exchangeRate.value === 0) return
  // Calculate game currency: twd / rate
  const calculated = newVal * exchangeRate.value 
  // Requirement: "Input finished then convert". lazy handles input finish.
  // "Do not show decimal points first". If result is integer, show integer.
  gameCurrencyAmount.value = Number.isInteger(calculated) ? calculated : Number(calculated.toFixed(2))
  isUpdating.value = false
})

watch(gameCurrencyAmount, (newVal) => {
  if (isUpdating.value) return
  isUpdating.value = true
  if (exchangeRate.value === 0) return
  // Calculate twd: game * rate
  const calculated = newVal / exchangeRate.value
  twdAmount.value = Number.isInteger(calculated) ? calculated : Number(calculated.toFixed(2))
  isUpdating.value = false
})

const sellingDraftId = ref(null)
const smsVerificationCode = ref('')

const handleConfirm = async () => {
    if (twdAmount.value < 1000) {
        toast.error('交易金額不可低於 1000 TWD')
        return
    }

    if (txType.value === 'sell') {
        await createSellingDraft()
    } else {
        showOtpSection.value = true
    }
}

const createSellingDraft = async () => {
    if (isSubmitting.value) return
    isSubmitting.value = true
    try {
        const token = localStorage.getItem('authToken')
        if (!token) {
            toast.warning('請先登入')
            router.push('/login')
            return
        }

        const payload = {
            store_id: route.query.storeId,
            price: twdAmount.value
        }

        const response = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/orders/selling/draft`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })

        const data = await response.json()

        if (response.ok && data.code === 0) {
            toast.info('簡訊驗證碼已發送至您的手機！')
            sellingDraftId.value = data.data.draft_id
            showOtpSection.value = true
        } else {
            toast.error(data.msg || '建立訂單草稿失敗')
        }
    } catch (error) {
        console.error('Create Draft Error:', error)
        toast.error('建立訂單草稿時發生錯誤')
    } finally {
        isSubmitting.value = false
    }
}

const sendOtp = () => {
  // Not used in this flow as Draft API sends it, but keeping if needed for resend later? uesr didn't ask for resend.
  toast.info('簡訊驗證碼已發送至您的手機！')
}

const submitOrder = async () => {
  if (!termsChecked1.value || !termsChecked2.value) {
    toast.warning('請接受所有條款和條件。')
    return
  }

  if (txType.value === 'sell') {
      if (!smsVerificationCode.value) {
          toast.warning('請輸入簡訊驗證碼')
          return
      }
      await confirmSellingOrder()
  } else {
      createBuyingOrder()
  }
}

const confirmSellingOrder = async () => {
    if (isSubmitting.value) return
    isSubmitting.value = true
    try {
        const token = localStorage.getItem('authToken')
        const payload = {
            draft_id: sellingDraftId.value,
            verification_code: smsVerificationCode.value
        }

        const response = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/orders/selling/confirm`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })

        const data = await response.json()

        if (response.ok && data.code === 0) {
            toast.success('銷售訂單提交成功！')
            router.push('/account?tab=transactions')
        } else {
            toast.error(data.msg || '提交訂單失敗')
        }
    } catch (error) {
        console.error('Confirm Order Error:', error)
        toast.error('提交訂單時發生錯誤')
    } finally {
        isSubmitting.value = false
    }
}

const orderResult = ref(null)
const successModalInstance = ref(null)

const createBuyingOrder = async () => {
    if (isSubmitting.value) return
    isSubmitting.value = true
    try {
        const payload = {
            store_id: route.query.storeId,
            price: twdAmount.value
        }

        const response = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/orders/buying`, {
            method: 'POST',
            body: JSON.stringify(payload)
        })

        const data = await response.json()

        if (response.ok && data.code === 0) {
            // alert('購買訂單建立成功！')
            orderResult.value = data.data.order || data.data // Adjust based on actual API response structure
            
            const modalEl = document.getElementById('orderSuccessModal')
            if (modalEl) {
                successModalInstance.value = new Modal(modalEl)
                successModalInstance.value.show()
            }
        } else {
            toast.error(data.msg || '建立訂單失敗')
        }
    } catch (error) {
        console.error('Create Order Error:', error)
        toast.error('建立訂單時發生錯誤')
    } finally {
        isSubmitting.value = false
    }
}

const closeSuccessModal = () => {
    if (successModalInstance.value) {
        successModalInstance.value.hide()
    }
    router.push('/account?tab=transactions')
}

const goBack = () => {
    router.back()
}
</script>

<template>
  <div class="container my-5">
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <div class="card shadow-lg border-0">
          <div class="card-header bg-white text-center py-3 border-bottom position-relative">
            <button class="btn btn-link text-dark position-absolute top-50 start-0 translate-middle-y ms-3 text-decoration-none" @click="goBack">
                <i class="bi bi-arrow-left fs-4"></i>
            </button>
            <h4 class="mb-3 fw-bold">{{ gameName }}</h4>
            
            <div class="btn-group w-50" role="group">
                <input type="radio" class="btn-check" name="btnradio" id="btnradio1" autocomplete="off" :checked="txType === 'buy'" @change="toggleTransactionType('buy')">
                <label class="btn btn-outline-primary" for="btnradio1">Buy (買)</label>

                <input type="radio" class="btn-check" name="btnradio" id="btnradio2" autocomplete="off" :checked="txType === 'sell'" @change="toggleTransactionType('sell')">
                <label class="btn btn-outline-danger" for="btnradio2">Sell (賣)</label>
            </div>
          </div>
          <div class="card-body p-5">
            <div v-if="isLoading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
            
            <div v-else>
            
            <!-- 1. Exchange Rate -->
            <div class="alert alert-info text-center fw-bold mb-4">
              匯率：{{ exchangeRate }} 遊戲幣 = 1 新台幣
            </div>

            <!-- 2. Promotion -->
            <!--<div class="mb-4">
              <label class="form-label fw-bold">Select Promotion (活動優惠)</label>
              <select class="form-select" v-model="selectedPromotion">
                <option v-for="promo in promotions" :key="promo" :value="promo">{{ promo }}</option>
              </select>
            </div>-->

            <!-- 3. Calculator -->
            <div class="row g-3 mb-4">
              <!-- Buy Mode: TWD Left, Game Currency Right -->
              <template v-if="txType === 'buy'">
                  <div class="col-md-5">
                    <label class="form-label fw-bold">新台幣 (TWD Amount)</label>
                    <div class="input-group">
                      <span class="input-group-text">NT$</span>
                      <input type="text" class="form-control" v-model.lazy="displayTwdAmount">
                    </div>
                    <div class="form-text text-muted">最低金額: 1,000 TWD</div>
                    <div v-if="twdAmount > 0 && twdAmount < 1000" class="text-danger small mt-1">
                      <i class="bi bi-exclamation-circle me-1"></i>交易金額不可低於 1,000 TWD
                    </div>
                  </div>
                  <div class="col-md-2 text-center text-muted pt-4">
                    <i class="bi bi-arrow-left-right fs-4"></i>
                  </div>
                  <div class="col-md-5">
                    <label class="form-label fw-bold">遊戲幣 (Game Currency)</label>
                    <div class="input-group">
                      <input type="text" class="form-control" v-model.lazy="displayGameCurrencyAmount" disabled>
                      <span class="input-group-text">Coins</span>
                    </div>
                  </div>
              </template>

              <!-- Sell Mode: Game Currency Left, TWD Right -->
              <template v-else>
                   <div class="col-md-5">
                    <label class="form-label fw-bold">遊戲幣 (Game Currency)</label>
                    <div class="input-group">
                      <input type="text" class="form-control" v-model.lazy="displayGameCurrencyAmount" disabled>
                      <span class="input-group-text">Coins</span>
                    </div>
                  </div>
                  <div class="col-md-2 text-center text-muted pt-4">
                    <i class="bi bi-arrow-left-right fs-4"></i>
                  </div>
                  <div class="col-md-5">
                    <label class="form-label fw-bold">台幣 (TWD Amount)</label>
                    <div class="input-group">
                      <span class="input-group-text">NT$</span>
                      <input type="text" class="form-control" v-model.lazy="displayTwdAmount">
                    </div>
                    <div class="form-text text-muted">最低金額: 1,000 TWD</div>
                     <div v-if="twdAmount > 0 && twdAmount < 1000" class="text-danger small mt-1">
                      <i class="bi bi-exclamation-circle me-1"></i>交易金額不可低於 1,000 TWD
                    </div>
                  </div>
              </template>
            </div>

            <!-- 4. Game Account -->
            <div class="mb-4">
              <label class="form-label fw-bold">遊戲帳號</label>
              <select v-if="validGameAccounts.length > 0" class="form-select" v-model="selectedGameAccount">
                <option value="" disabled>請選擇遊戲帳號</option>
                <option v-for="acc in validGameAccounts" :key="acc.id" :value="acc.id">
                  {{ acc.store_name }} - {{ acc.account_name }}
                </option>
              </select>
               <div v-else class="alert alert-warning mb-0 d-flex justify-content-between align-items-center" role="alert">
                  <span>請新增或確認遊戲帳號狀態</span>
                  <button class="btn btn-sm btn-outline-dark" @click="router.push('/account?tab=game')">前往查看</button>
              </div>
            </div>

            <!-- 5. Bank Account -->
            <div class="mb-4">
              <label class="form-label fw-bold">銀行帳號</label>
              <select v-if="validBankAccounts.length > 0" class="form-select" v-model="selectedBankAccount">
                 <option value="" disabled>請選擇銀行帳號</option>
                 <option v-for="bank in validBankAccounts" :key="bank.id" :value="bank.id">
                   ({{ bank.bank_code }}) {{ bank.account_number }}
                 </option>
              </select>
              <div v-else class="alert alert-warning mb-0 d-flex justify-content-between align-items-center" role="alert">
                  <span>請新增或確認銀行帳號</span>
                  <button class="btn btn-sm btn-outline-dark" @click="router.push('/account?tab=bank')">前往查看</button>
              </div>
            </div>

            <!-- 6. Confirmation & OTP -->
            <div v-if="!showOtpSection && selectedGameAccount && selectedBankAccount" class="d-grid">
              <button class="btn btn-primary btn-lg fw-bold" @click="handleConfirm" :disabled="isSubmitting">
                <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                <span v-else>確認交易</span>
              </button>
            </div>

            <div v-else-if="showOtpSection && selectedGameAccount && selectedBankAccount" class="border-top pt-4 mt-4 animate-fade-in">
              <h5 class="fw-bold mb-3">安全性驗證</h5>
              
              <div class="form-check mb-2">
                <input class="form-check-input" type="checkbox" id="term1" v-model="termsChecked1">
                <label class="form-check-label" for="term1">
                  我已閱讀並同意 <a href="#">服務條款</a>。
                </label>
              </div>
              <div class="form-check mb-4">
                <input class="form-check-input" type="checkbox" id="term2" v-model="termsChecked2">
                <label class="form-check-label" for="term2">
                  我確認交易細節正確。
                </label>
              </div>

               <div v-if="txType === 'sell'" class="mb-4">
                <label class="form-label fw-bold">簡訊驗證碼</label>
                <div class="input-group">
                  <input type="text" class="form-control" placeholder="輸入簡訊驗證碼" v-model="smsVerificationCode">
                  <!-- <button class="btn btn-outline-primary" type="button" @click="sendOtp">發送驗證碼</button> -->
                </div>
                <div class="form-text text-muted">驗證碼已發送至您的手機</div>
              </div>

              <div class="d-grid">
                <button class="btn btn-success btn-lg fw-bold" @click="submitOrder" :disabled="isSubmitting">
                    <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    <span v-else>提交訂單</span>
                </button>
              </div>
            </div>

            <!-- Success Modal -->
            <div class="modal fade" id="orderSuccessModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
              <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content">
                  <div class="modal-header border-0 bg-success text-white">
                    <h5 class="modal-title fw-bold"><i class="bi bi-check-circle-fill me-2"></i>訂單建立成功</h5>
                    <button type="button" class="btn-close btn-close-white" @click="closeSuccessModal"></button>
                  </div>
                  <div class="modal-body p-4">
                    <div v-if="orderResult" class="table-responsive">
                      <table class="table table-bordered table-striped">
                        <tbody>
                          <tr><th width="30%">商戶 ID (Store ID)</th><td>{{ orderResult.store_id }}</td></tr>
                          <tr><th>點數類型 ID (Point ID)</th><td>{{ orderResult.point_id }}</td></tr>
                          <tr><th>數量 (Quantity)</th><td>{{ orderResult.quantity }}</td></tr>
                          <tr><th>單價 (Unit Price)</th><td>{{ orderResult.unit_price }}</td></tr>
                          <tr><th>總價 (Total Price)</th><td>{{ formatNumber(orderResult.total_price) }}</td></tr>
                          <!--<tr><th>付款方式 (Payment)</th><td>{{ orderResult.payments_label }} ({{ orderResult.payments }})</td></tr>-->
                          <!--<tr><th>付款子類型 (Sub)</th><td>{{ orderResult.payments_sub || '-' }}</td></tr>-->
                          
                          <!-- Customer Info -->
                          <!--<tr><th>付款人銀行代碼</th><td>{{ orderResult.payer_bank_code || '-' }}</td></tr>
                          <tr><th>付款人帳號</th><td>{{ orderResult.payer_card_no || '-' }}</td></tr>-->

                          <!-- Payee Info -->
                          <tr><th>收款人銀行代碼 (Payee Bank)</th><td>{{ orderResult.payee_bank_code }}</td></tr>
                          <tr><th>收款人帳號 (Payee Account)</th><td>{{ orderResult.payee_card_no }}</td></tr>
                          <tr><th>收款遊戲帳號 (Game Account)</th><td>{{ orderResult.payee_game_account }}</td></tr>
                          
                          <tr><th>狀態 (Status)</th><td>{{ orderResult.status_label }} ({{ orderResult.status }})</td></tr>
                          <tr><th>建立時間 (Created At)</th><td>{{ new Date(orderResult.created_at).toLocaleString() }}</td></tr>
                        </tbody>
                      </table>
                      <div class="alert alert-warning mt-3">
                          <i class="bi bi-info-circle me-2"></i>請盡快完成付款轉帳，以利訂單處理。
                      </div>
                    </div>
                  </div>
                  <div class="modal-footer border-0 justify-content-center">
                     <button type="button" class="btn btn-primary px-5" @click="closeSuccessModal">確定 (前往訂單列表)</button>
                  </div>
                </div>
              </div>
            </div>
           </div>
          </div>
          <div class="card-footer bg-light text-muted small p-4">
            <h6 class="fw-bold text-danger"><i class="bi bi-exclamation-triangle-fill me-2"></i>買賣警語</h6>
            <p class="mb-0">
              請注意潛在詐騙風險。請勿向任何人透露您的 OTP 或密碼。 
              請確保您在官方 SEAGM 平台上交易。 
              交易一旦完成即為最終決議。
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
