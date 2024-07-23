import styled, { css } from 'styled-components'
import ThemeProvider from '../theme/ThemeProvider'

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}

const ThemeBlock = styled.div(
  ({ left, $fill, theme }) =>
    css`
      box-sizing: border-box;
      position: absolute;
      top: 0;
      left: ${left || $fill ? 0 : '50vw'};
      border-right: ${left ? '1px solid #202020' : 'none'};
      right: ${left ? '50vw' : 0};
      width: ${$fill ? '100vw' : '50vw'};
      height: 100vh;
      bottom: 0;
      overflow: auto;
      padding: 1rem;
      background: var(--es-${theme === 'light' ? 'white' : 'dark'});
    `
)

export const withTheme = (StoryFn, context) => {
  // Get values from story parameter first, else fallback to globals
  const theme = context.parameters.theme || context.globals.theme

  switch (theme) {
    case 'side-by-side': {
      return (
        <>
          <div>
            <ThemeProvider theme="light" />
            <ThemeBlock left theme="light">
              <StoryFn />
            </ThemeBlock>
          </div>
          <div>
            <ThemeProvider theme="dark" />
            <ThemeBlock theme="dark">
              <StoryFn />
            </ThemeBlock>
          </div>
        </>
      )
    }
    default: {
      return (
        <>
          <ThemeProvider theme={theme} />
          <ThemeBlock $fill theme={theme}>
            <StoryFn />
          </ThemeBlock>
        </>
      )
    }
  }
}

export const globalTypes = {
  theme: {
    name: 'Theme',
    description: 'Theme for the components',
    defaultValue: 'light',
    toolbar: {
      // The icon for the toolbar item
      icon: 'circlehollow',
      // Array of options
      items: [
        { value: 'light', icon: 'circlehollow', title: 'light' },
        { value: 'dark', icon: 'circle', title: 'dark' },
        { value: 'side-by-side', icon: 'sidebar', title: 'side by side' },
      ],
      // Property that specifies if the name of the item will be displayed
      name: true,
    },
  },
}

export const decorators = [withTheme]
