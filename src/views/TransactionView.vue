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
        const response = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/stores/${storeId}`)
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

        const response = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/orders/selling/draft`, {
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

        const response = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/orders/selling/confirm`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })

        const data = await response.json()

        if (response.ok && data.code === 0) {
            // toast.success('銷售訂單提交成功！') // Optional, modal is enough
            orderResult.value = data.data.order || data.data
            
            const modalEl = document.getElementById('orderSuccessModal')
            if (modalEl) {
                successModalInstance.value = new Modal(modalEl)
                successModalInstance.value.show()
            }
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

        const response = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/orders/buying`, {
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
    const subTab = txType.value === 'sell' ? 'selling' : 'buying'
    router.push(`/account?tab=transactions&sub=${subTab}`)
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
                  <div class="alert alert-danger text-center fw-bold mb-4">
                      賣單完成後將收取3%搓和手續費
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
              <div v-if="txType === 'buy'" class="mt-2 text-danger fw-bold small">
                ※請務必確認遊戲帳號是否正確，帳號錯誤不予賠償。
              </div>
              <div v-else class="mt-2 text-danger fw-bold small">
                ※請務必用綁定之遊戲帳號轉幣，用非綁定之帳號轉幣將會拒收。
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
              <div v-if="txType === 'buy'" class="mt-2 text-danger fw-bold small">
                  <div>※請務必用綁定之銀行帳號付款，用非綁定銀行帳號轉帳將會拒收。</div>
                  <div>※轉帳時請勿做奇怪的備註。</div>
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
                  我已閱讀並同意 <router-link to="/help?topic=user-terms" class="text-decoration-none text-secondary">服務條款</router-link>。
                </label>
              </div>
              <div class="form-check mb-4">
                <input class="form-check-input" type="checkbox" id="term2" v-model="termsChecked2">
                <label class="form-check-label" for="term2">
                  我已充分瞭解交易細節，轉幣完成後將不可取消訂單。
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
                      <div v-if="txType === 'buy'">
                          <table class="table table-bordered table-striped">
                            <tbody>
                              <tr><th width="30%">遊戲名稱</th><td>{{ gameName }}</td></tr>
                              <tr><th>金幣數量</th><td>{{ orderResult.quantity }}</td></tr>
                              <!--<tr><th>比率</th><td>1 : {{ orderResult.unit_price }}</td></tr>-->
                              <tr><th>總價</th><td>{{ formatNumber(orderResult.total_price) }}</td></tr>
                              
                              <tr><th>收款銀行代碼</th><td>{{ orderResult.payee_bank_code }}</td></tr>
                              <tr><th>收款帳號</th><td>{{ orderResult.payee_card_no }}</td></tr>
                              <tr><th>會員遊戲帳號</th><td>{{ orderResult.payee_game_account }}</td></tr>
                              
                              <tr><th>狀態</th><td>{{ orderResult.status_label }} ({{ orderResult.status }})</td></tr>
                              <tr><th>建立時間</th><td>{{ new Date(orderResult.created_at).toLocaleString() }}</td></tr>
                            </tbody>
                          </table>
                           <div class="alert alert-warning mt-3">
                              <i class="bi bi-info-circle me-2"></i>此付款帳號僅供當日與當次使用，付款後才完成買單掛單，付款後不可取消訂單。
                          </div>
                      </div>
                      <div v-else>
                           <table class="table table-bordered table-striped">
                            <tbody>
                              <tr><th width="30%">遊戲名稱</th><td>{{ gameName }}</td></tr>
                              <tr><th>訂單 ID</th><td>{{ orderResult.id }}</td></tr>
                              <tr><th>金幣數量</th><td>{{ formatNumber(orderResult.quantity) }}</td></tr>
                              <!--<tr><th>已交付</th><td>{{ formatNumber(orderResult.delivered_quantity || 0) }}</td></tr>-->
                              <!--<tr><th>比率</th><td>1 : {{ formatNumber(orderResult.unit_price) }}</td></tr>-->
                              <tr><th>總價</th><td class="fw-bold text-primary">{{ formatNumber(orderResult.total_price) }}</td></tr>
                              <tr><th>手續費</th><td class="text-danger">{{ formatNumber(orderResult.fee) }}</td></tr>

                              <tr><th>會員遊戲帳號</th><td>{{ orderResult.payer_game_account }}</td></tr>
                              <tr><th>收款遊戲帳號</th><td>{{ orderResult.payee_game_account }}</td></tr>
                              
                              <tr v-if="orderResult.bank_code"><th>銀行代碼</th><td>{{ orderResult.bank_code }}</td></tr>
                              <tr v-if="orderResult.branch_code"><th>分行代碼</th><td>{{ orderResult.branch_code }}</td></tr>
                              <tr v-if="orderResult.account_number"><th>銀行帳號</th><td>{{ orderResult.account_number }}</td></tr>
                              <tr v-if="orderResult.account_name"><th>帳戶名稱</th><td>{{ orderResult.account_name }}</td></tr>

                              <tr><th>狀態</th><td>{{ orderResult.status_label }} ({{ orderResult.status }})</td></tr>
                              <tr><th>建立時間</th><td>{{ new Date(orderResult.created_at).toLocaleString() }}</td></tr>
                            </tbody>
                          </table>
                          <div class="alert alert-info mt-3">
                              <i class="bi bi-info-circle me-2"></i>賣單已建立，請等待買家配對。
                          </div>
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

          <!-- Card Footer with Warning -->
          <div class="card-footer bg-light text-muted small p-4">
            <h6 class="fw-bold text-danger"><i class="bi bi-exclamation-triangle-fill me-2"></i>買賣警語</h6>
            <div v-if="txType === 'buy'">
                 <p class="mb-0 text-danger">
                  <div>※若您為限制行為能力者或無行為能力者請勿下單。</div>
                  <div>※請勿將會員帳號借予他人使用。</div>
                  <div>※買單通常2~12分鐘可以收到遊戲金幣。</div>
                </p>
            </div>
            <div v-else>
                 <p class="mb-1 text-danger">
                  <div>※轉點後才完成掛單，掛賣單通常3~110分鐘可以收到款項；當日到款之最後下單時間為22:30，逾時下單若未能於23:15前配對完成，將會於翌日上午 09:00開始陸續出款。</div>
                  <div>※為維持會員體驗，本平台有權以掛賣價格97%之金額強制收購會員訂單，強制收購之部位不收取搓和手續費。</div>
                </p>
            </div>
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
