import {
  defineConfig,
  presetAttributify,
  presetUno,
  transformerDirectives,
  transformerVariantGroup
} from 'unocss'

export default defineConfig({
  presets: [presetUno(), presetAttributify()],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  theme: {
    colors: {
      wine: {
        950: '#180407',
        900: '#25070f',
        800: '#3a0f1e',
        700: '#5a1626',
        600: '#7a1c31'
      },
      gold: {
        100: '#fff8e1',
        200: '#fff3c4',
        300: '#f7e3a1',
        400: '#e8c96a',
        500: '#d4af37',
        600: '#c9a227',
        700: '#a97c15'
      },
      seal: '#c8102e',
      ink: '#2a2118',
      inksoft: '#6b5c46',
      paper: '#fffdf9'
    },
    fontFamily: {
      serifcn: '"Noto Serif SC","Source Han Serif SC","Songti SC","STSong",serif',
      sanscn: '"PingFang SC","Hiragino Sans GB","Microsoft YaHei","Heiti SC","Noto Sans SC",system-ui,sans-serif'
    }
  },
  shortcuts: {
    'btn-reset': 'appearance-none border-0 bg-transparent p-0 font-inherit cursor-pointer select-none',
    'tap': 'transition-transform duration-150 active:scale-95'
  },
  safelist: ['text-seal', 'bg-seal', 'text-gold-300', 'text-gold-500', 'text-wine-900']
})
