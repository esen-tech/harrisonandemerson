import '../css/essence.css'
import DarkTheme from './DarkTheme'
import LightTheme from './LightTheme'

const ThemeProvider = ({ theme }) => {
  switch (theme) {
    case 'light': {
      return <LightTheme />
    }
    case 'dark': {
      return <DarkTheme />
    }
  }
}

export default ThemeProvider
