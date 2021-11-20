import Vue from 'vue'
import VueRouter, { Route, RouteConfig } from 'vue-router'

import globalStore from '@/store'

Vue.use(VueRouter)

const routes = [
  {
    path: '/gist/:id',
    component: () => import(/* webpackChunkName: "gist" */ '@/views/GistView.vue'),
    props: (route: Route) => ({
      id: route.params.id,
    }),
  },
  {
    path: '/*',
    component: () => import(/* webpackChunkName: "split" */ '@/views/ScreenSplitter.vue'),
  },
  {
    // catch-all back to home page
    path: '*',
    redirect: '/',
  },
]

// // individual viz plugins all go into /v/* subpaths
function vizPlugins(): any[] {
  const plugins = []
  for (const plugin of globalStore.state.visualizationTypes.values()) {
    plugins.push({
      path: '/v/' + plugin.kebabName + '/:slug/*',
      name: plugin.kebabName,
      component: plugin.component,
      props: (route: Route) => {
        const match = route.params.pathMatch
        const subfolder = match.substring(0, match.lastIndexOf('/'))
        const yamlConfig = match.substring(match.lastIndexOf('/') + 1)
        return {
          root: route.params.slug,
          subfolder,
          yamlConfig,
          thumbnail: false,
        }
      },
    })
  }

  return plugins
}

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: vizPlugins().concat(routes),
  // native-like back/forward and top-of-page routing
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  },
})

export default router
