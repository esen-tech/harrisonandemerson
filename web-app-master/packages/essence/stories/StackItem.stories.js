import Stack from '../components/Stack'
import StackItem from '../components/StackItem'

export default {
  title: 'Component/StackItem',
  component: StackItem,
  argTypes: {
    image: {
      control: 'object',
      defaultValue: {
        src: 'https://picsum.photos/id/999/100/150',
      },
    },
    title: {
      control: 'text',
      defaultValue: '清單項目',
    },
    metadata: {
      control: 'object',
      defaultValue: ['細節說明1', '細節說明2', '細節說明3'],
    },
    controlAlignItems: {
      control: 'radio',
      options: ['start', 'center'],
      defaultValue: 'start',
    },
    badge: {
      control: 'object',
      defaultValue: {
        variant: 'info',
        children: '標籤',
      },
    },
    icon: {
      control: 'object',
      defaultValue: {
        name: 'arrow_forward_ios',
      },
    },
    actionScope: {
      control: 'radio',
      options: [false, 'all', 'control'],
      defaultValue: 'all',
    },
  },
}

export const Template = (args) => (
  <Stack>
    <StackItem {...args} />
    <StackItem {...args} />
    <StackItem {...args} />
  </Stack>
)

export const Mixed = ({ image, title, metadata, badge, icon, ...rest }) => (
  <Stack>
    <StackItem title={title} {...rest} />
    <StackItem title={title} badge={badge} {...rest} />
    <StackItem title={title} icon={icon} {...rest} />
    <StackItem title={title} badge={badge} icon={icon} {...rest} />
    <StackItem title={title} {...rest} />
    <StackItem title={title} metadata={metadata} badge={badge} {...rest} />
    <StackItem title={title} metadata={metadata} icon={icon} {...rest} />
    <StackItem
      title={title}
      metadata={metadata}
      badge={badge}
      icon={icon}
      {...rest}
    />
    <StackItem image={image} title={title} {...rest} />
    <StackItem image={image} title={title} badge={badge} {...rest} />
    <StackItem image={image} title={title} icon={icon} {...rest} />
    <StackItem
      image={image}
      title={title}
      badge={badge}
      icon={icon}
      {...rest}
    />
    <StackItem image={image} title={title} {...rest} />
    <StackItem
      image={image}
      title={title}
      metadata={metadata}
      badge={badge}
      {...rest}
    />
    <StackItem
      image={image}
      title={title}
      metadata={metadata}
      icon={icon}
      {...rest}
    />
    <StackItem
      image={image}
      title={title}
      metadata={metadata}
      badge={badge}
      icon={icon}
      {...rest}
    />
  </Stack>
)
