<script setup>
import { useAuth } from '../composables/useAuth'
import { useRouter } from 'vue-router'

const { isLoggedIn, logout } = useAuth()
const router = useRouter()

const handleNavClick = (e) => {
  e.preventDefault()
  if (!isLoggedIn.value) {
    router.push('/login')
  } else {
    // For now, just show an alert or do nothing as these pages don't exist
    alert('Feature coming soon!')
  }
}
</script>

<template>
  <header class="sticky-top bg-white">
    <!-- Top Bar -->
    <div class="bg-light py-1 border-bottom d-none d-lg-block">
      <div class="container d-flex justify-content-end align-items-center">
        <!--<div class="d-flex gap-3">
          <div class="dropdown">
            <a class="text-decoration-none text-secondary dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
              <i class="bi bi-globe me-1"></i> English
            </a>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" href="#">English</a></li>
              <li><a class="dropdown-item" href="#">中文 (繁體)</a></li>
            </ul>
          </div>
          <div class="dropdown">
            <a class="text-decoration-none text-secondary dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
              TWD
            </a>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" href="#">TWD</a></li>
              <li><a class="dropdown-item" href="#">USD</a></li>
            </ul>
          </div>
        </div>-->
        <div class="d-flex gap-3 align-items-center">
          <router-link to="/help" class="text-decoration-none text-secondary">幫助中心</router-link>
          <template v-if="!isLoggedIn">
            <router-link to="/register-phone" class="text-decoration-none text-secondary">註冊</router-link>
            <router-link to="/login" class="text-decoration-none text-secondary">登入</router-link>
          </template>
          <template v-else>
            <router-link to="/account" class="text-decoration-none text-secondary">會員中心</router-link>
            <a href="#" @click.prevent="logout" class="text-decoration-none text-secondary">登出</a>
          </template>
        </div>
      </div>
    </div>

    <!-- Main Navbar -->
    <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
      <div class="container">
        <router-link to="/" class="navbar-brand fw-bold text-primary fs-3">幣商</router-link>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="mainNavbar">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0 fw-semibold">
            <li class="nav-item">
              <a class="nav-link active" href="/">首頁</a>
            </li>
            <!--<li class="nav-item">
              <a class="nav-link active" href="#" @click="handleNavClick">Card</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#" @click="handleNavClick">Direct Top-Up</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#" @click="handleNavClick">Mobile Reload</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#" @click="handleNavClick">Gift Card</a>
            </li>-->
          </ul>
          
          <form class="d-flex w-50 mx-lg-4" role="search">
            <div class="input-group">
              <input class="form-control border-end-0" type="search" placeholder="搜尋遊戲" aria-label="Search">
              <span class="input-group-text bg-white border-start-0">
                <i class="bi bi-search"></i>
              </span>
            </div>
          </form>

          <div class="d-flex align-items-center gap-3 mt-3 mt-lg-0">
             <a href="#" class="text-dark fs-5 position-relative">
               <i class="bi bi-cart"></i>
               <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style="font-size: 0.6rem;">
                 0
               </span>
             </a>
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>

<style scoped>
.navbar-brand {
  color: #007bff; /* SEAGM Blue-ish */
}
.nav-link {
  font-size: 0.95rem;
}
.nav-link:hover {
  color: #007bff;
}
</style>
