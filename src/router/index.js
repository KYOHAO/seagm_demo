import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: () => import('../views/HomeView.vue'),
        },
        {
            path: '/help',
            name: 'help',
            component: () => import('../views/HelpCenterView.vue'),
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
            path: '/transaction/result',
            name: 'transaction-result',
            component: () => import('../views/TransactionResultView.vue'),
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
