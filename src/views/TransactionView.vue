<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const transactionType = computed(() => route.query.type === 'sell' ? 'Sell' : 'Buy')
const gameName = computed(() => route.query.game || 'Unknown Game')

// Mock Exchange Rate: 1 TWD = 100 Game Currency
const exchangeRate = 100

const twdAmount = ref(0)
const gameCurrencyAmount = ref(0)
const isUpdating = ref(false)

const promotions = ['No Promotion', 'Summer Sale - 5% Bonus', 'New User - 100 Extra Coins']
const selectedPromotion = ref(promotions[0])

const gameAccounts = ['User123 (Server A)', 'User456 (Server B)']
const selectedGameAccount = ref(gameAccounts[0])

const bankAccounts = ['Bank A - **** 1234', 'Bank B - **** 5678']
const selectedBankAccount = ref(bankAccounts[0])

const showOtpSection = ref(false)
const termsChecked1 = ref(false)
const termsChecked2 = ref(false)
const otpCode = ref('')

// Bidirectional Conversion
watch(twdAmount, (newVal) => {
  if (isUpdating.value) return
  isUpdating.value = true
  gameCurrencyAmount.value = newVal * exchangeRate
  isUpdating.value = false
})

watch(gameCurrencyAmount, (newVal) => {
  if (isUpdating.value) return
  isUpdating.value = true
  twdAmount.value = newVal / exchangeRate
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
          <div class="card-header bg-primary text-white text-center py-3">
            <h4 class="mb-0 fw-bold">{{ transactionType }} {{ gameName }} Currency</h4>
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
                  <input type="number" class="form-control" v-model="twdAmount" min="0">
                </div>
              </div>
              <div class="col-md-2 text-center text-muted">
                <i class="bi bi-arrow-left-right fs-4"></i>
              </div>
              <div class="col-md-5">
                <label class="form-label fw-bold">Game Currency (遊戲幣)</label>
                <div class="input-group">
                  <input type="number" class="form-control" v-model="gameCurrencyAmount" min="0">
                  <span class="input-group-text">Coins</span>
                </div>
              </div>
            </div>

            <!-- 4. Game Account -->
            <div class="mb-4">
              <label class="form-label fw-bold">Game Account (綁定遊戲帳號)</label>
              <select class="form-select" v-model="selectedGameAccount">
                <option v-for="acc in gameAccounts" :key="acc" :value="acc">{{ acc }}</option>
              </select>
            </div>

            <!-- 5. Bank Account -->
            <div class="mb-4">
              <label class="form-label fw-bold">Bank Account (選擇銀行帳號)</label>
              <select class="form-select" v-model="selectedBankAccount">
                <option v-for="bank in bankAccounts" :key="bank" :value="bank">{{ bank }}</option>
              </select>
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
