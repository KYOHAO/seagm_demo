<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const formData = ref({
  name: '',
  idNumber: '',
  email: '',
  password: '',
  confirmPassword: '',
  birthday: '',
  phone: '',
  gender: '',
  address: ''
})

const handleRegister = () => {
  if (formData.value.password !== formData.value.confirmPassword) {
    alert('Passwords do not match!')
    return
  }
  // Mock registration success
  alert('Registration successful! Please login.')
  router.push('/login')
}
</script>

<template>
  <div class="container my-5">
    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-6">
        <div class="card shadow-lg border-0 rounded-3">
          <div class="card-body p-5">
            <h3 class="text-center fw-bold text-primary mb-4">Create Account</h3>
            
            <form @submit.prevent="handleRegister">
              <!-- Name -->
              <div class="mb-3">
                <label class="form-label">Full Name (姓名)</label>
                <input type="text" class="form-control" v-model="formData.name" required>
              </div>

              <!-- ID Number -->
              <div class="mb-3">
                <label class="form-label">ID Number (身分證字號)</label>
                <input type="text" class="form-control" v-model="formData.idNumber" required>
              </div>

              <!-- Email -->
              <div class="mb-3">
                <label class="form-label">Email Address (信箱)</label>
                <input type="email" class="form-control" v-model="formData.email" required>
              </div>

              <!-- Password -->
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Password (密碼)</label>
                  <input type="password" class="form-control" v-model="formData.password" required>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Confirm Password (確認密碼)</label>
                  <input type="password" class="form-control" v-model="formData.confirmPassword" required>
                </div>
              </div>

              <!-- Birthday & Gender -->
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Birthday (生日)</label>
                  <input type="date" class="form-control" v-model="formData.birthday" required>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Gender (性別)</label>
                  <select class="form-select" v-model="formData.gender" required>
                    <option value="" disabled selected>Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <!-- Phone -->
              <div class="mb-3">
                <label class="form-label">Mobile Phone (行動電話)</label>
                <input type="tel" class="form-control" v-model="formData.phone" required>
              </div>

              <!-- Address -->
              <div class="mb-4">
                <label class="form-label">Address (地址)</label>
                <textarea class="form-control" rows="2" v-model="formData.address"></textarea>
              </div>

              <!-- Buttons -->
              <div class="d-grid gap-2">
                <button type="submit" class="btn btn-primary btn-lg fw-bold">Register</button>
                <button type="button" class="btn btn-outline-secondary" @click="$router.push('/login')">Already have an account? Login</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
