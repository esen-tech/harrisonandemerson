import Grid from '../components/Grid'

export default {
  title: 'Layout/Grid',
  component: Grid,
  argTypes: {
    fluid: {
      control: 'boolean',
      defaultValue: false,
    },
    columns: {
      control: 'number',
      defaultValue: 3,
    },
    columnGap: {
      control: 'radio',
      options: ['xs', 's', 'm', 'l', 'xl', 'xxl'],
      defaultValue: 'm',
    },
    rowGap: {
      control: 'radio',
      options: ['xs', 's', 'm', 'l', 'xl', 'xxl'],
      defaultValue: 'm',
    },
  },
}

export const Template = (args) => (
  <Grid {...args}>
    <span>Content 1</span>
    <span>Content 2</span>
    <span>Content 3</span>
    <span>Content 4</span>
    <span>Content 5</span>
    <span>Content 6</span>
  </Grid>
)

export const Area = (args) => (
  <Grid {...args}>
    <Grid.Area columnSpan={3} style={{ backgroundColor: 'red' }}>
      Span 3
    </Grid.Area>
    <Grid.Area
      columnOffset={2}
      columnSpan={2}
      style={{ backgroundColor: 'red' }}
    >
      Offset 2, Span 2
    </Grid.Area>
    <Grid.Area columnSpan={2} style={{ backgroundColor: 'red' }}>
      Span 2
    </Grid.Area>
  </Grid>
)
