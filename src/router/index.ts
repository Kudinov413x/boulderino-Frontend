import { createRouter, createWebHistory } from 'vue-router'

import LoginView from '@/views/LoginView.vue'
import SessionView from '@/views/SessionView.vue'
import ProgressView from '@/views/ProgressView.vue'
import HomeView from '@/views/HomeView.vue'
import BoulderView from '@/views/BoulderView.vue'
import DashboardView from '@/views/DashboardView.vue'
import AboutMeView from '@/views/AboutMeView.vue'
import ImpressumView from '@/views/ImpressumView2.vue'
import DatenschutzView from '@/views/DatenschutzView.vue'


const router = createRouter({

    history: createWebHistory(import.meta.env.BASE_URL),

    routes: [

        {
            path: '/',
            name: 'home',
            component: HomeView
        },

        {
            path: '/login',
            name: 'login',
            component: LoginView
        },

        {
            path: '/sessions',
            name: 'sessions',
            component: SessionView
        },

        {
            path: '/progress',
            name: 'progress',
            component: ProgressView
        },

        {
            path: '/sessions/:id',
            name: 'session-details',
            component: () => import('@/views/SessionDetailsView.vue')
        },
        {
            path: '/sessionsStats/:id',
            name: 'session-stats',
            component: () => import('@/views/SessionStatisticView.vue')
        },
        {
            path: '/boulders',
            name: 'boulders',
            component: BoulderView
        },
        {
            path: '/dashboard',
            name: 'dasboard',
            component: DashboardView
        },
        {
            path: '/impressum',
            name: 'Impressum',
            component: ImpressumView
        },
        {
            path: '/aboutMe',
            name: 'AboutMe',
            component: AboutMeView
        },
        {
            path: '/datenschutz',
            name: 'DatenSchutz',
            component: DatenschutzView
        }

    ]

})

export default router