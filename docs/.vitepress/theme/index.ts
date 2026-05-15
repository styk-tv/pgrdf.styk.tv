import DefaultTheme from 'vitepress/theme'
import './custom.css'
import ChapterPlayer from './components/ChapterPlayer.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('ChapterPlayer', ChapterPlayer)
  },
}
