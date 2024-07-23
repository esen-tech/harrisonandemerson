import Badge from '../components/Badge'
import Button from '../components/Button'
import Card from '../components/Card'
import Grid from '../components/Grid'
import Image from '../components/Image'

export default {
  title: 'Component/Card',
  component: Card,
  argTypes: {
    inset: {
      control: 'boolean',
      defaultValue: false,
    },
    centered: {
      control: 'boolean',
      defaultValue: false,
    },
    fitContent: {
      control: 'boolean',
      defaultValue: false,
    },
    active: {
      control: 'boolean',
      defaultValue: false,
    },
    image: {
      control: 'object',
      defaultValue: {
        src: 'https://picsum.photos/id/999/400/300',
      },
    },
    title: {
      control: 'text',
      defaultValue: '清單項目',
    },
    paragraph: {
      control: 'text',
      defaultValue: '文字說明',
    },
    controlScope: {
      control: 'radio',
      options: ['none', 'all', 'control'],
      defaultValue: 'none',
    },
  },
}

export const Template = ({ image, title, paragraph, ...args }) => {
  return (
    <Grid columns={3} columnGap="m" rowGap="m">
      <Card {...args}>
        <Card.Media image={image} />
        <Card.Content title={title} paragraph={paragraph} />
      </Card>
      <Card {...args}>
        <Card.Media inset image={image} />
        <Card.Content
          title={title}
          paragraph={paragraph}
          media={<Badge variant="info">標籤</Badge>}
        />
      </Card>
      <Card {...args}>
        <Card.Media image={image} />
        <Card.Content
          title={title}
          paragraph={paragraph}
          media={
            <Image
              rounded
              width={40}
              height={40}
              src="https://picsum.photos/id/666/100/100"
            />
          }
        />
        <Card.Control>
          <Button inversed variant="primary" size="s">
            動作
          </Button>
        </Card.Control>
      </Card>
      <Card {...args}>
        <Card.Media
          image={{
            fluid: false,
            rounded: true,
            width: 40,
            height: 40,
            ...image,
          }}
        />
        <Card.Content title={title} paragraph={paragraph} />
      </Card>
      <Card {...args}>
        <Card.Media
          image={{
            fluid: false,
            rounded: true,
            width: 40,
            height: 40,
            ...image,
          }}
        />
        <Card.Content
          title={title}
          paragraph={paragraph}
          media={<Badge variant="info">標籤</Badge>}
        />
        <Card.Control>
          <Button fluid inversed variant="primary" size="s">
            預約
          </Button>
        </Card.Control>
      </Card>
      <Card {...args}>
        <Card.Media
          image={{
            fluid: false,
            rounded: true,
            width: 40,
            height: 40,
            ...image,
          }}
        />
        <Card.Content title={title} paragraph={paragraph} />
        <Card.Control>
          <Button fluid inversed variant="primary" size="s">
            預約
          </Button>
        </Card.Control>
      </Card>
    </Grid>
  )
}
