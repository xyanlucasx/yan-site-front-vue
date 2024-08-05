import { createRouter, createWebHistory } from 'vue-router'
import UploadImages from '../components/UploadImages.vue';
import ImageList from '../views/ImageList.vue'
import GalleryView from '../views/GalleryView.vue'
import Login from '../views/LoginView.vue'
import store from '../store'

const toArray = value => Array.isArray(value) ? value : (value ? [value] : null);

const routes = [
  {
    path: '/',
    name: 'home',
    beforeEnter (to, from, next) {
      return next('/gallery')
    }
  },
  {
    path: '/secretdoor',
    name: 'login',
    component: Login
  },
  {
    path: '/upload',
    name: 'upload',
    component: UploadImages,
    beforeEnter (to, from, next) {
      const { payload } = store.getters.getUser
      if (payload?.exp * 1000 > Date.now()) return next()
      return next('/secretdoor')
    }
  },
  {
    path: '/list',
    name: 'list',
    component: ImageList,
    beforeEnter (to, from, next) {
      const { payload } = store.getters.getUser
      if (payload?.exp * 1000 > Date.now()) return next()
      return next('/secretdoor')
    }
  },
  {
    path: '/gallery',
    name: 'gallery',
    component: GalleryView,
    props: route => ({
      id: route.query.id,
      version: route.query.version,
      city: toArray(route.query.city),
      country: toArray(route.query.country),
      state: toArray(route.query.state),
      tag : toArray(route.query.tag),
      startDate: route.query.startDate,
      endDate: route.query.endDate
    })
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
