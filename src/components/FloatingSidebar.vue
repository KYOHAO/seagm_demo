<script setup>
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { isLoggedIn } = useAuth()

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

const handleSidebarClick = (route) => {
  if (!isLoggedIn.value) {
    router.push('/login')
  } else if (route) {
    router.push(route)
  } else {
     alert('Feature coming soon!')
  }
}
</script>

<template>
  <div class="workbench-entrance">
    <div class="sidebar-item" @click="handleSidebarClick('/account')">
      <i class="bi bi-person"></i>
      <span>會員中心</span>
    </div>
    <div class="sidebar-item" @click="handleSidebarClick()">
      <i class="bi bi-cart"></i>
      <span>購物車</span>
      <span class="badge bg-danger rounded-pill position-absolute top-15 start-80 translate-middle" style="font-size: 0.6rem;">0</span>
    </div>
    <div class="sidebar-item" @click="handleSidebarClick()">
      <i class="bi bi-clock-history"></i>
      <span>歷史訂單</span>
    </div>
    <div class="sidebar-item" @click="handleSidebarClick()">
      <i class="bi bi-chat-dots"></i>
      <span>在線客服</span>
    </div>
    <div class="sidebar-item" @click="scrollToTop">
      <i class="bi bi-arrow-up"></i>
      <span>回頂部</span>
    </div>
  </div>
</template>

<style scoped>
.workbench-entrance {
  position: fixed;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background-color: #fff;
  box-shadow: -2px 0 8px rgba(0,0,0,0.1);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  /*border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;*/
  border-radius: 8px;
  overflow: hidden;
}

.sidebar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 10px;
  cursor: pointer;
  transition: all 0.2s;
  color: #666;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
  min-width: 60px;
}

.sidebar-item:last-child {
  border-bottom: none;
}

.sidebar-item:hover {
  background-color: #f8f9fa;
  color: #007bff;
}

.sidebar-item i {
  font-size: 1.2rem;
  margin-bottom: 4px;
}

.sidebar-item span {
  font-size: 0.75rem;
}

.start-80{
  left: 80%;
}

.top-15{
  top: 15%;
}
</style>
