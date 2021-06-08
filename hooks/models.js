import { useEffect } from 'react'

import { useGLTF, useTexture } from '@react-three/drei'
import shallow from 'zustand/shallow'

import Materials from '@/configs/materials/list.json'

import useGeometries from '@/helpers/geometries'
import useTextures from '@/helpers/textures'
import useParameters from '@/helpers/parameters'

export function useModelInfo(elemName, { modelKey, modelSrc } = {}) {
  const properties = useParameters((state) => state.values)

  const name = modelKey ? properties[modelKey].replace(/ /g, '_') : elemName
  const path = modelSrc ? modelSrc + name : 'main'

  return { name, path }
}

export function useGeometryManager(name, path) {
  const [geometries, addGeometry] = useGeometries(
    (store) => [store.geometries, store.addGeometry],
    shallow
  )

  const { nodes } = useGLTF('/models/' + path + '.glb', '/draco-gltf/')

  if (!geometries[name]) addGeometry(name, nodes[name].geometry)

  return geometries
}

export function useOutlinedGeometryManager(name, path) {
  const [geometries, addGeometry] = useGeometries(
    (store) => [store.geometries, store.addGeometry],
    shallow
  )

  const { nodes } = useGLTF('/models/' + path + '.glb', '/draco-gltf/')

  if (!geometries[name]) {
    const [main, outline] = nodes[name].children

    addGeometry(name, main.geometry)
    addGeometry(name + '_outline', outline.geometry)
  }

  return geometries
}

export function useColorManager(model, material) {
  const { color } = Materials[material]

  useEffect(() => {
    if (color) {
      const { material } = model.current

      const { colors } = useParameters.getState()
      const { h, s, l } = colors[color]

      material.color.setHSL(h / 360, s, l)

      useParameters.subscribe(
        ({ h, s, l }) => material.color.setHSL(h / 360, s, l),
        (state) => state.colors[color]
      )
    }
  }, [color, model])
}

export function useTextureManager(material, group = undefined) {
  const [textures, addTexture] = useTextures(
    (store) => [store.textures, store.addTexture],
    shallow
  )

  const textureName = group ? group + material : Materials[material].texture

  console.log(textureName)

  const texture = useTexture('/img/textures/' + textureName + '.png')

  texture.flipY = false

  if (!textures[material]) addTexture(material, texture)

  return textures[material]
}
