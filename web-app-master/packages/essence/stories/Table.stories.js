import Table from '../components/Table'

export default {
  title: 'Component/Table',
  component: Table,
  argTypes: {
    fluid: {
      control: 'boolean',
      defaultValue: false,
    },
  },
}

export const Template = (args) => (
  <Table {...args}>
    <thead>
      <tr>
        <Table.Th leftIndent>A</Table.Th>
        <Table.Th>B</Table.Th>
        <Table.Th>C</Table.Th>
        <Table.Th rightIndent>D</Table.Th>
      </tr>
    </thead>
    <tbody>
      {[1, 2, 3, 4, 5, 6, 7, 8].map((row) => (
        <tr key={row}>
          <Table.Td leftIndent>{row}-1</Table.Td>
          <Table.Td>{row}-2</Table.Td>
          <Table.Td>{row}-3</Table.Td>
          <Table.Td rightIndent>{row}-4</Table.Td>
        </tr>
      ))}
    </tbody>
  </Table>
)
