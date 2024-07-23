import Button from '@esen/essence/components/Button'
import Container from '@esen/essence/components/Container'
import Label from '@esen/essence/components/Label'
import Spacer from '@esen/essence/components/Spacer'
import Stack from '@esen/essence/components/Stack'
import Text from '@esen/essence/components/Text'
import Logo from './brand/Logo'

const Placeholder = ({ title, description, action }) => {
  return (
    <Container fluid>
      <Spacer ySize="l" />
      <Stack alignItems="center" gap="l">
        <Logo />
        <Stack gap="m" alignItems="center">
          <Label size="l" disabled>
            {title}
          </Label>
          <Text size="s" disabled multiLine align="center">
            {description}
          </Text>
        </Stack>
        <Button size="s" variant="secondary" {...action} />
      </Stack>
      <Spacer ySize="l" />
    </Container>
  )
}

export default Placeholder
