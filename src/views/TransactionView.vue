<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserAccounts } from '../composables/useUserAccounts'

const route = useRoute()
const txType = ref(route.query.type === 'sell' ? 'sell' : 'buy')
const transactionType = computed(() => txType.value === 'sell' ? 'Sell' : 'Buy')
const gameName = computed(() => route.query.game || 'Unknown Game')

const toggleTransactionType = (type) => {
  if (txType.value !== type) {
    txType.value = type
    // Refresh rate when type changes
    fetchStoreDetails()
  }
}


// Rate from API
const exchangeRate = ref(0)
const storeDetails = ref(null)

const fetchStoreDetails = async () => {
    const storeId = route.query.storeId
    if (!storeId) return

    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/stores/${storeId}`)
        const data = await response.json()

        if (response.ok && data.code === 0) {
            storeDetails.value = data.data.store
            // Assume first point type for now as per requirement context, or logic to select point?
            // Requirement just says "get buy/sell rate". I'll take the first point's rates.
            if (storeDetails.value.points && storeDetails.value.points.length > 0) {
                const point = storeDetails.value.points[0]
                if (txType.value === 'sell') {
                     // Selling: User sells Game Currency -> Gets TWD?
                     // Rate definition: "buying_rate": 10.0 (Dealer buys?), "selling_rate": 10.0 (Dealer sells?)
                     // Usually "Buying Rate" = Dealer buys from User. "Selling Rate" = Dealer sells to User.
                     // Let's assume:
                     // User Buy Currency (Dealer Sell) -> Use selling_rate
                     // User Sell Currency (Dealer Buy) -> Use buying_rate
                     exchangeRate.value = point.buying_rate // Dealer's buying rate
                } else {
                     exchangeRate.value = point.selling_rate // Dealer's selling rate
                }
            }
        }
    } catch (error) {
        console.error('Fetch Store Details Error:', error)
    }
}

const { gameAccounts, bankAccounts, fetchGameAccounts, fetchBankAccounts } = useUserAccounts()

const validBankAccounts = computed(() => {
    if (!bankAccounts.value) return []
    return bankAccounts.value //暫時通過
    //return bankAccounts.value.filter(acc => acc.status === 2)
})

const validGameAccounts = computed(() => {
    if (!gameAccounts.value) return []
    return gameAccounts.value.filter(acc => acc.status === 1)
})

onMounted(async () => {
    fetchStoreDetails()
    await Promise.all([fetchGameAccounts(), fetchBankAccounts()])
    
    // Set defaults if available
    if (validGameAccounts.value.length > 0) {
        selectedGameAccount.value = validGameAccounts.value[0].id
    }
    if (validBankAccounts.value.length > 0) {
        selectedBankAccount.value = validBankAccounts.value[0].id
    }
})

const twdAmount = ref(0)
const gameCurrencyAmount = ref(0)
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
// Bidirectional Conversion
watch(twdAmount, (newVal) => {
  if (isUpdating.value) return
  isUpdating.value = true
  if (exchangeRate.value === 0) return
  // Calculate game currency
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
  const calculated = newVal / exchangeRate.value
  twdAmount.value = Number.isInteger(calculated) ? calculated : Number(calculated.toFixed(2))
  isUpdating.value = false
})

const handleConfirm = () => {
  showOtpSection.value = true
}

const sendOtp = () => {
  alert('OTP sent to your mobile phone!')
}

const submitOrder = () => {
  if (!termsChecked1.value || !termsChecked2.value) {
    alert('Please accept all terms and conditions.')
    return
  }
  if (!otpCode.value) {
    alert('Please enter the OTP code.')
    return
  }
  alert('Order submitted successfully!')
}
</script>

<template>
  <div class="container my-5">
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <div class="card shadow-lg border-0">
          <div class="card-header bg-white text-center py-3 border-bottom">
            <h4 class="mb-3 fw-bold">{{ gameName }} Currency</h4>
            
            <div class="btn-group w-50" role="group">
                <input type="radio" class="btn-check" name="btnradio" id="btnradio1" autocomplete="off" :checked="txType === 'buy'" @change="toggleTransactionType('buy')">
                <label class="btn btn-outline-primary" for="btnradio1">Buy (買)</label>

                <input type="radio" class="btn-check" name="btnradio" id="btnradio2" autocomplete="off" :checked="txType === 'sell'" @change="toggleTransactionType('sell')">
                <label class="btn btn-outline-danger" for="btnradio2">Sell (賣)</label>
            </div>
          </div>
          <div class="card-body p-5">
            
            <!-- 1. Exchange Rate -->
            <div class="alert alert-info text-center fw-bold mb-4">
              Exchange Rate: 1 TWD = {{ exchangeRate }} Game Currency
            </div>

            <!-- 2. Promotion -->
            <div class="mb-4">
              <label class="form-label fw-bold">Select Promotion (活動優惠)</label>
              <select class="form-select" v-model="selectedPromotion">
                <option v-for="promo in promotions" :key="promo" :value="promo">{{ promo }}</option>
              </select>
            </div>

            <!-- 3. Calculator -->
            <div class="row g-3 mb-4 align-items-end">
              <div class="col-md-5">
                <label class="form-label fw-bold">TWD Amount (台幣)</label>
                <div class="input-group">
                  <span class="input-group-text">NT$</span>
                  <input type="number" class="form-control" v-model.lazy="twdAmount" min="0">
                </div>
              </div>
              <div class="col-md-2 text-center text-muted">
                <i class="bi bi-arrow-left-right fs-4"></i>
              </div>
              <div class="col-md-5">
                <label class="form-label fw-bold">Game Currency (遊戲幣)</label>
                <div class="input-group">
                  <input type="number" class="form-control" v-model.lazy="gameCurrencyAmount" min="0">
                  <span class="input-group-text">Coins</span>
                </div>
              </div>
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
               <div v-else class="alert alert-warning mb-0" role="alert">
                  請新增或確認遊戲帳號
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
              <div v-else class="alert alert-warning mb-0" role="alert">
                  請新增或確認銀行帳號
              </div>
            </div>

            <!-- 6. Confirmation & OTP -->
            <div v-if="!showOtpSection" class="d-grid">
              <button class="btn btn-primary btn-lg fw-bold" @click="handleConfirm">Confirm Transaction</button>
            </div>

            <div v-else class="border-top pt-4 mt-4 animate-fade-in">
              <h5 class="fw-bold mb-3">Security Verification</h5>
              
              <div class="form-check mb-2">
                <input class="form-check-input" type="checkbox" id="term1" v-model="termsChecked1">
                <label class="form-check-label" for="term1">
                  I have read and agree to the <a href="#">Terms of Service</a>.
                </label>
              </div>
              <div class="form-check mb-4">
                <input class="form-check-input" type="checkbox" id="term2" v-model="termsChecked2">
                <label class="form-check-label" for="term2">
                  I confirm that the transaction details are correct.
                </label>
              </div>

              <div class="mb-4">
                <label class="form-label fw-bold">SMS OTP</label>
                <div class="input-group">
                  <input type="text" class="form-control" placeholder="Enter OTP code" v-model="otpCode">
                  <button class="btn btn-outline-primary" type="button" @click="sendOtp">Send OTP</button>
                </div>
              </div>

              <div class="d-grid">
                <button class="btn btn-success btn-lg fw-bold" @click="submitOrder">Submit Order</button>
              </div>
            </div>

          </div>
          <div class="card-footer bg-light text-muted small p-4">
            <h6 class="fw-bold text-danger"><i class="bi bi-exclamation-triangle-fill me-2"></i> Trading Warning (買賣警語)</h6>
            <p class="mb-0">
              Please be aware of potential fraud. Do not share your OTP or password with anyone. 
              Ensure you are trading on the official SEAGM platform. 
              Transactions are final once completed.
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
