import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import HelpCenterView from '../views/HelpCenterView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView
        },
        {
            path: '/help',
            name: 'help',
            component: HelpCenterView
        },
        {
            path: '/account',
            name: 'account',
            component: () => import('../views/MemberAccountView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/login',
            name: 'login',
            component: () => import('../views/LoginView.vue')
        },
        {
            path: '/register',
            name: 'register',
            component: () => import('../views/RegisterView.vue')
        },
        {
            path: '/games',
            name: 'games',
            component: () => import('../views/GameSelectionView.vue')
        },
        {
            path: '/transaction',
            name: 'transaction',
            component: () => import('../views/TransactionView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/register-phone',
            name: 'register-phone',
            component: () => import('../views/RegisterPhoneView.vue')
        },
        {
            path: '/forgot-password',
            name: 'forgot-password',
            component: () => import('../views/ForgotPasswordView.vue')
        },
        {
            path: '/kyc-info',
            name: 'kyc-info',
            component: () => import('../views/KycInfoView.vue'),
            meta: { requiresAuth: true }
        }
    ],
    scrollBehavior(to, from, savedPosition) {
        return { top: 0 }
    }
})

router.beforeEach((to, from, next) => {
    const isAuthenticated = !!localStorage.getItem('authToken')

    if (to.meta.requiresAuth && !isAuthenticated) {
        next('/login')
    } else {
        next()
    }
})

export default router
