<script setup>
import { useToast } from '../composables/useToast'

const { toasts, removeToast } = useToast()
</script>

<template>
  <div class="toast-container position-fixed top-0 start-50 translate-middle-x p-3 mt-3" style="z-index: 1090">
    <transition-group name="toast-fade">
        <div 
        v-for="toast in toasts" 
        :key="toast.id" 
        class="toast show align-items-center border-0 mb-2 shadow-lg" 
        role="alert" 
        aria-live="assertive" 
        aria-atomic="true"
        :class="`bg-${toast.type} text-white`"
        style="min-width: 300px;"
        >
        <div class="d-flex">
            <div class="toast-body fs-5 text-center w-100">
                <i v-if="toast.type === 'success'" class="bi bi-check-circle-fill me-2"></i>
                <i v-if="toast.type === 'danger'" class="bi bi-x-circle-fill me-2"></i>
                <i v-if="toast.type === 'warning'" class="bi bi-exclamation-triangle-fill me-2"></i>
                <i v-if="toast.type === 'info'" class="bi bi-info-circle-fill me-2"></i>
                {{ toast.message }}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" @click="removeToast(toast.id)" aria-label="Close"></button>
        </div>
        </div>
    </transition-group>
  </div>
</template>

<style scoped>
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.3s ease;
}
.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
