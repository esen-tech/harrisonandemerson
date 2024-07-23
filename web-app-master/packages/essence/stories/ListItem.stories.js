import ListItem from '../components/ListItem'
import Stack from '../components/Stack'

export default {
  title: 'Component/ListItem',
  component: ListItem,
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
    paragraph: {
      control: 'text',
      defaultValue: '文字說明',
    },
    metadata: {
      control: 'object',
      defaultValue: ['中繼資料1', '中繼資料2'],
    },
    contentBadge: {
      control: 'object',
      defaultValue: {
        variant: 'info',
        children: '徽章',
      },
    },
    description: {
      control: 'text',
      defaultValue:
        '對於第一次來到ĒSEN的貴賓，透過一對一醫生深度問診與相關檢測數據，幫助醫生辨別您目前的健康狀態，同時透過看診時溝通與交流進行生理功能評估。',
    },
    controlBadge: {
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
    controlScope: {
      control: 'radio',
      options: ['none', 'all', 'control'],
      defaultValue: 'none',
    },
    verticallyCentered: {
      control: 'boolean',
      defaultValue: false,
    },
  },
}

export const Template = ({
  image,
  title,
  paragraph,
  metadata,
  contentBadge,
  controlBadge,
  icon,
  description,
  ...args
}) => {
  return (
    <Stack>
      <ListItem {...args}>
        <ListItem.Content title={title} />
        <ListItem.Control badge={controlBadge} icon={icon} />
      </ListItem>
      <ListItem {...args}>
        <ListItem.Content title={title} paragraph={paragraph} />
        <ListItem.Control badge={controlBadge} icon={icon} />
      </ListItem>
      <ListItem {...args}>
        <ListItem.Content
          title={title}
          paragraph={paragraph}
          metadata={metadata}
        />
        <ListItem.Control badge={controlBadge} icon={icon} />
      </ListItem>
      <ListItem description={description} {...args}>
        <ListItem.Content
          title={title}
          paragraph={paragraph}
          metadata={metadata}
        />
        <ListItem.Control badge={controlBadge} icon={icon} />
      </ListItem>
      <ListItem {...args}>
        <ListItem.Content title={title} badge={contentBadge} />
        <ListItem.Control badge={controlBadge} icon={icon} />
      </ListItem>
      <ListItem {...args}>
        <ListItem.Content
          title={title}
          paragraph={paragraph}
          badge={contentBadge}
        />
        <ListItem.Control badge={controlBadge} icon={icon} />
      </ListItem>
      <ListItem {...args}>
        <ListItem.Content
          title={title}
          paragraph={paragraph}
          metadata={metadata}
          badge={contentBadge}
        />
        <ListItem.Control badge={controlBadge} icon={icon} />
      </ListItem>
      <ListItem description={description} {...args}>
        <ListItem.Content
          title={title}
          paragraph={paragraph}
          metadata={metadata}
          badge={contentBadge}
        />
        <ListItem.Control badge={controlBadge} icon={icon} />
      </ListItem>
      <ListItem {...args}>
        <ListItem.Media image={image} />
        <ListItem.Content title={title} />
        <ListItem.Control badge={controlBadge} icon={icon} />
      </ListItem>
      <ListItem {...args}>
        <ListItem.Media image={image} />
        <ListItem.Content title={title} paragraph={paragraph} />
        <ListItem.Control badge={controlBadge} icon={icon} />
      </ListItem>
      <ListItem {...args}>
        <ListItem.Media image={image} />
        <ListItem.Content
          title={title}
          paragraph={paragraph}
          metadata={metadata}
        />
        <ListItem.Control badge={controlBadge} icon={icon} />
      </ListItem>
      <ListItem description={description} {...args}>
        <ListItem.Media image={image} />
        <ListItem.Content
          title={title}
          paragraph={paragraph}
          metadata={metadata}
        />
        <ListItem.Control badge={controlBadge} icon={icon} />
      </ListItem>
      <ListItem {...args}>
        <ListItem.Content title={title} />
        <ListItem.Media image={image} />
      </ListItem>
      <ListItem {...args}>
        <ListItem.Content title={title} paragraph={paragraph} />
        <ListItem.Media image={image} />
      </ListItem>
      <ListItem {...args}>
        <ListItem.Content
          title={title}
          paragraph={paragraph}
          metadata={metadata}
        />
        <ListItem.Media image={image} />
      </ListItem>
      <ListItem description={description} {...args}>
        <ListItem.Content
          title={title}
          paragraph={paragraph}
          metadata={metadata}
        />
        <ListItem.Media image={image} />
      </ListItem>
    </Stack>
  )
}
