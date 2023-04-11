import { defineConfig, presetIcons, presetUno, presetWind } from 'unocss'

const config = {
  presets: [
    presetUno(),
    presetWind(),
    presetIcons({
      prefix: 'i-',
      extraProperties: {
        display: 'inline-block'
      }
    })
  ],
  shortcuts: [
    {
      'flex-center': 'flex justify-center items-center',
      'flex-col-center': 'flex flex-col justify-center items-center'
    }
  ],
  rules: [[/^leh-(\d+\.{0,1}\d{0,2})$/, ([, d]) => ({ 'line-height': `${d}` })]],
  theme: {
    colors: {
      primary: 'rgb(217, 70, 239)'
    }
  }
}

export default defineConfig(config)
