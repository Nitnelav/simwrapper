export const MAP_STYLES_ONLINE = {
  light: 'mapbox://styles/mapbox/light-v10',
  dark: 'mapbox://styles/vsp-tu-berlin/ckek59op0011219pbwfar1rex',
}

export const MAP_STYLES_OFFLINE = {
  // NO NETWoRK:
  light: { version: 8, layers: [], sources: {} },
  dark: { version: 8, layers: [], sources: {} },
}

export const MAPBOX_TOKEN =
  'pk.eyJ1IjoidnNwLXR1LWJlcmxpbiIsImEiOiJjamNpemh1bmEzNmF0MndudHI5aGFmeXpoIn0.u9f04rjFo7ZbWiSceTTXyA'

export enum Status {
  INFO,
  WARNING,
  ERROR,
}

export enum DataType {
  NUMBER,
  STRING,
  BOOLEAN,
  DATE,
  LOOKUP,
}

export interface DataTable {
  [columnName: string]: DataTableColumn
}

/**
 * DataTableColumn represents one column of a loaded dataset. Numerical data will always be
 * stored as a Float32Array, while other data such as strings will be stored as regular
 * arrays.
 *
 * @property type - is one of the DataType enumeration, and is used to decode factors
 *
 * @property factors - is only populated during construction if the actual values are constrained
 * to a small set of choices, in which case the index of the factor is stored in the row data instead
 * of the value itself.
 */
export interface DataTableColumn {
  values: Float32Array | any[]
  name: string
  type: DataType
  max?: number
  // factors?: any[] // only present if elements are stored as offset to the factor value here, instead of as the real value
}

/** LookupDataset bridges CSV data and link data with the join column containing array offsets */
export interface LookupDataset {
  datasetKey: string
  dataTable: DataTable
  activeColumn: string
  csvRowFromLinkRow: number[]
}

export interface CSV {
  header: string[]
  headerMax: number[]
  rows: Float32Array[]
  activeColumn: number
}

export type VizLayerConfiguration = {
  datasets: { [id: string]: string }
  display: { color: any; width: any }
}

export type YamlConfigs = {
  dashboards: { [filename: string]: string }
  topsheets: { [filename: string]: string }
  vizes: { [filename: string]: string }
  configs: { [filename: string]: string }
}

export const UI_FONT =
  "'Titillium Web', 'Roboto', 'Open Sans', Avenir, Arial, Helvetica, sans-serif"

export interface FileSystem {
  getDirectory(path: string): Promise<DirectoryEntry>
  getFileText(path: string): Promise<string>
  getFileJson(path: string): Promise<any>
  getFileBlob(path: string): Promise<Blob | null>
  cleanURL(path: string): string
}

export interface FileSystemConfig {
  name: string
  name_de?: string
  description: string
  description_de?: string
  baseURL: string
  slug: string
  thumbnail?: string
  needPassword?: boolean
  skipList?: string[]
  dashboardFolder?: string
  hidden?: boolean
  handle?: FileSystemAPIHandle
}

export interface VisualizationPlugin {
  component: Vue.VueConstructor
  kebabName: string
  prettyName: string
  description?: string
  filePatterns: string[]
}

export interface DirectoryEntry {
  files: string[]
  dirs: string[]
  handles: { [name: string]: FileSystemAPIHandle }
}

export enum ColorScheme {
  LightMode = 'light',
  DarkMode = 'dark',
}

export interface BreadCrumb {
  label: string
  url?: string
}

export interface ColorSet {
  text: string
  background: string
  links: string
  susceptible: string
  infectedButNotContagious: string
  contagious: string
  symptomatic: string
  seriouslyIll: string
  critical: string
  recovered: string
}

export enum Health {
  Susceptible = 'susceptible',
  InfectedButNotContagious = 'infectedButNotContagious',
  Contagious = 'contagious',
}

export interface Agent {
  id: string
  time: number[]
  path: [number, number][]
  dtime: number[]
  d: number[]
}

export interface AgentProgessingThroughDisease {
  id: string
  x: number
  y: number
  infectedButNotContagious: number
  contagious: number
  showingSymptoms: number
  seriouslySick: number
  critical: number
  recovered: number
}

export interface Infection {
  id: string
  dtime: number[]
  d: number[]
}

export interface Trip {
  id: number
  timestamps: number[]
  path?: number[]
  status?: string
}

export interface RunYaml {
  city: string
  info: string
  readme: string
  zip: string
  timestamp: string
  // these are for old version
  offset?: number[]
  startDate?: string
  endDate?: string
  // these are for new version
  defaultStartDate?: string
  startDates?: string[]
  // these are for everything
  optionGroups: {
    day?: number
    heading: string
    subheading?: string
    measures: {
      measure: string
      title: string
      order?: string
      options?: number[]
    }[]
  }[]
}

export interface FileSystemAPIHandle {
  name: string
  values: any // returns { kind: string; name: string; getFile: any }[]
  getFile: any
  requestPermission: any
}

export const LIGHT_MODE: ColorSet = {
  text: '#000',
  background: '#ccccc4',
  links: '#ffffff',
  susceptible: '#999900',
  infectedButNotContagious: '#0077ff',
  contagious: '#bb0044',
  symptomatic: '#ff5533',
  seriouslyIll: '#7733ee',
  critical: '#000',
  recovered: '#116622',
}

export const DARK_MODE: ColorSet = {
  text: '#fff',
  background: '#181518',
  links: '#445577',
  susceptible: '#bbbb44',
  infectedButNotContagious: '#00dddd',
  contagious: '#ff2299',
  symptomatic: '#ff5533',
  seriouslyIll: '#7733ee',
  critical: '#fff',
  recovered: '#116622',
}

export enum LegendItemType {
  line,
  box,
}

export interface LegendItem {
  type: LegendItemType
  color: number[]
  value: any
  label?: string
}

/**
 * This holds handles to React view component callbacks, so we can
 * notify them when the global map view state changes.
 *
 * This is needed because Deck.gl components can either handle their own
 * state internally, or use React to manage state externally.
 * Since we are a Vue app, this one weird trick allows us to update the
 * map state from the outside without rebuilding the whole component,
 * which would cause huge performance problems.
 *
 * NOTE --> Your Vue app needs to manage these handles and REMOVE them
 * in beforeDestroy() or else you will have some major memory leaks!
 * You have been warned.
 */
export const REACT_VIEW_HANDLES: { [id: number]: any } = {}
