import React, { useState, useMemo, useEffect } from 'react'
import DeckGL from '@deck.gl/react'
import { StaticMap } from 'react-map-gl'
import { ScatterplotLayer } from '@deck.gl/layers'
import { DataFilterExtension } from '@deck.gl/extensions'
import * as timeConvert from 'convert-seconds'

import { REACT_VIEW_HANDLES, MAPBOX_TOKEN } from '@/Globals'
import globalStore from '@/store'

const dataFilter = new DataFilterExtension({ filterSize: 1 })

const INITIAL_VIEW = {
  zoom: 11,
  longitude: 13.38,
  latitude: 52.51,
  pitch: 0,
  bearing: 0,
}

function convertSecondsToClockTimeMinutes(index: number) {
  const seconds = index // this.getSecondsFromSlider(index)

  try {
    const hms = timeConvert(seconds)
    const minutes = ('00' + hms.minutes).slice(-2)
    return `${hms.hours}:${minutes}`
  } catch (e) {
    return '00:00'
  }
}

// -------------------------------------------------------------------
export default function Component({
  viewId = 0,
  pointLayers = [] as {
    coordinates: Float32Array
    time: Float32Array
    color: Uint8Array
    value: Float32Array
    timeRange: number[]
  }[],
  timeFilter = [] as number[],
  dark = false,
}) {
  // manage SimWrapper centralized viewState - for linked maps
  const [viewState, setViewState] = useState(INITIAL_VIEW) // globalStore.state.viewState)
  // const initialViewState = Object.assign({}, INITIAL_VIEW)

  REACT_VIEW_HANDLES[viewId] = () => {
    setViewState(globalStore.state.viewState)
  }

  function handleViewState(view: any) {
    if (!view.latitude) return
    view.center = [view.longitude, view.latitude]
    setViewState(view)
    globalStore.commit('setMapCamera', view)
  }

  function getTooltip(element: any) {
    if (element.index < 0) return null

    const layerId = element?.layer?.id
    if (layerId === undefined) return null

    const time = pointLayers[layerId].time[element.index]
    const humanTime = convertSecondsToClockTimeMinutes(time)

    const value = pointLayers[layerId].value[element.index]

    return {
      html: `\
        <table style="font-size: 0.9rem">
        <tr>
          <td>Value</td>
          <td style="padding-left: 0.5rem;"><b>${value}</b></td>
        </tr><tr>
          <td style="text-align: right;">Time</td>
          <td style="padding-left: 0.5rem;"><b>${humanTime}</b></td>
        </tr>
        </table>
      `,
      style: dark
        ? { color: '#ccc', backgroundColor: '#2a3c4f' }
        : { color: '#223', backgroundColor: 'white' },
    }
  }

  // add a scatterplotlayer for each set of points in pointLayers
  const layers = pointLayers.map((points, layerIndex) => {
    // The entire layer can be invisible if all of its points
    // are beyond the timeFilter range that is being shown.
    const outOfRange = points.timeRange[0] > timeFilter[1] || points.timeRange[1] < timeFilter[0]

    return new ScatterplotLayer({
      data: {
        length: points.time.length,
        attributes: {
          getPosition: { value: points.coordinates, size: 2 },
          getFilterValue: { value: points.time, size: 1 },
          getFillColor: { value: points.color, size: 3 },
        },
      },
      autoHighlight: false,
      extensions: [dataFilter],
      id: layerIndex,
      filled: true,
      filterRange: timeFilter.length ? timeFilter : null,
      getRadius: 4, // (d: any) => 5, // Math.sqrt(d...),
      highlightColor: [255, 0, 224],
      opacity: 1,
      parameters: { depthTest: false },
      pickable: true,
      radiusScale: 1,
      stroked: false,
      useDevicePixels: false,
      // hide layers that are outside the time window filter:
      updateTriggers: {
        getPosition: pointLayers,
        getFillColor: pointLayers,
        getFilterValue: timeFilter,
      },
      visible: !outOfRange,
    })
  })

  // initialViewState={initialViewState}
  return (
    <DeckGL
      layers={layers}
      controller={true}
      useDevicePixels={true}
      viewState={viewState}
      onViewStateChange={(e: any) => handleViewState(e.viewState)}
      pickingRadius={4}
      onClick={getTooltip}
      getTooltip={getTooltip}
    >
      {
        /*
        // @ts-ignore */
        <StaticMap
          mapStyle={globalStore.getters.mapStyle}
          preventStyleDiffing={true}
          mapboxApiAccessToken={MAPBOX_TOKEN}
        />
      }
    </DeckGL>
  )
}
