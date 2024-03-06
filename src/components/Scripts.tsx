import { Table } from '@mantine/core'

const Scripts = ({ scripts = {} }: { scripts: Record<string, string> }) => {
   const keys = Object.keys(scripts).sort((a, b) => a.localeCompare(b))
   return (
      <Table striped>
         <Table.Tbody>
            {keys.map(key => (
               <Table.Tr key={key}>
                  <Table.Td>{key}</Table.Td>
                  <Table.Td>{scripts[key]}</Table.Td>
               </Table.Tr>
            ))}
         </Table.Tbody>
      </Table>
   )
}

export default Scripts
