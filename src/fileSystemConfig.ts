import { get, set, clear } from 'idb-keyval'
import { FileSystemConfig, FileSystemAPIHandle } from '@/Globals'
import globalStore from '@/store'

const BASE_URL = import.meta.env.BASE_URL

// The URL contains the websiteLiveHost, calculated at runtime
let loc = {} as any
let webLiveHostname = 'NOPE'
let websiteLiveHost = 'NOPE'

if (typeof window !== 'undefined') {
  loc = window.location
  webLiveHostname = loc?.hostname
  websiteLiveHost = `${loc?.protocol}//${webLiveHostname}`
}

export function addInitialLocalFilesystems(
  filesystems: { handle: FileSystemAPIHandle; key: string | null }[]
) {
  for (let i = 0; i < filesystems.length; i++) {
    const slug = 'fs' + (1 + i)
    const system: FileSystemConfig = {
      name: filesystems[i].handle.name,
      slug: slug,
      description: 'Local folder',
      handle: filesystems[i].handle,
      baseURL: '',
    }
    fileSystems.unshift(system)
    globalStore.commit('addLocalFileSystem', { key: system.slug, handle: system.handle })
  }

  // hang onto count so that we don't overlap as Christian removes and re-adds folders
}

export function addLocalFilesystem(handle: FileSystemAPIHandle, key: string | null) {
  const slug = key || 'fs' + (1 + globalStore.state.numLocalFileSystems)

  const system: FileSystemConfig = {
    name: handle.name,
    slug: slug,
    description: 'Local folder',
    handle: handle,
    baseURL: '',
  }

  fileSystems.unshift(system)

  // commit to app state
  globalStore.commit('addLocalFileSystem', { key: system.slug, handle: handle })

  // write it out to indexed-db so we have it on next startup
  const sorted = [...globalStore.state.localFileHandles]
  sorted.sort((a, b) => (a.handle.name < b.handle.name ? -1 : 1))
  set('fs', sorted)
  return system.slug
}

let fileSystems: FileSystemConfig[] = [
  // DO NOT REMOVE THESE, THEY ARE FOR INTERNAL APP USE
  {
    name: 'interactive',
    slug: '',
    description: 'Drag and Drop"',
    baseURL: '',
    hidden: true,
  },
  {
    name: webLiveHostname + ' live folders',
    slug: 'live',
    description: 'Files served using "simwrapper here"',
    baseURL: websiteLiveHost + ':8050/_f_', // e.g. 'http://localhost:8050/_f_',
    hidden: true,
  },
  {
    name: 'Public Data Folder',
    slug: 'files',
    description: 'Data from /public/data folder',
    baseURL: loc.origin + BASE_URL + 'data',
    hidden: true,
  },

  {
    name: 'Browse data',
    slug: 'view',
    description: "View this site's datasets",
    baseURL: loc.origin + '/data',
    hidden: true,
  },

  // End. Below here, these are editable:

  {
    name: 'SYMEXPO Nantes',
    slug: 'symexpo-nantes',
    description: 'Private Nantes data at UGE SYMEXPO',
    baseURL: 'https://fnan-19-089.ad.ifsttar.fr/symexpo/nantes',
    thumbnail: '/simwrapper/images/thumb-chart.jpg',
  },
  {
    name: 'SYMEXPO Lyon',
    slug: 'symexpo-lyon',
    description: 'Private Lyon data at UGE SYMEXPO',
    baseURL: 'https://fnan-19-089.ad.ifsttar.fr/symexpo/lyon',
    thumbnail: '/simwrapper/images/thumb-chart.jpg',
  },
  {
    name: 'SYMEXPO 94',
    slug: 'symexpo-94',
    description: 'Private 94 data at UGE SYMEXPO',
    baseURL: 'https://fnan-19-089.ad.ifsttar.fr/symexpo/94',
    thumbnail: '/simwrapper/images/thumb-chart.jpg',
  },
]

for (let port = 8000; port < 8049; port++) {
  fileSystems.push({
    name: 'Localhost ' + port,
    slug: `${port}`,
    description: 'Localhost ' + port,
    description_de: 'Localhost ' + port,
    baseURL: 'http://localhost:' + port,
    hidden: true,
  })
}

for (let port = 8050; port < 8099; port++) {
  fileSystems.push({
    name: webLiveHostname + port,
    slug: `${port}`,
    description: webLiveHostname + port,
    description_de: webLiveHostname + port,
    baseURL: websiteLiveHost + `:${port}/_f_`, // e.g. 'http://localhost:8050/_f_',
    hidden: true,
  })
}

// merge user shortcuts
try {
  if (typeof localStorage !== 'undefined') {
    const storedShortcuts = localStorage.getItem('projectShortcuts')
    if (storedShortcuts) {
      const shortcuts = JSON.parse(storedShortcuts) as any[]
      const unique = fileSystems.filter(root => !(root.slug in shortcuts))
      fileSystems = [...Object.values(shortcuts), ...unique]
    }
  }
} catch (e) {
  console.error('ERROR MERGING URL SHORTCUTS:', '' + e)
}

export default fileSystems
