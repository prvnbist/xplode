import startCase from 'lodash.startcase'
import { Checkbox, Table } from '@mantine/core'

import Repository from './Repository'

const Metadata = ({ content }: { content: Record<string, any> }) => {
   const keys = Object.keys(content).sort((a, b) => a.localeCompare(b))
   const { repository = {} } = content
   return (
      <Table>
         <Table.Tbody>
            {keys.map(key => {
               const value = content[key]
               if (!['string', 'boolean'].includes(typeof value)) return null

               return (
                  <Table.Tr key={key}>
                     <Table.Td>{startCase(key)}</Table.Td>
                     <Table.Td>
                        {typeof value === 'boolean' ? (
                           <Checkbox size="xs" checked={value} onChange={() => {}} />
                        ) : (
                           value
                        )}
                     </Table.Td>
                  </Table.Tr>
               )
            })}
            <Repository repository={repository} />
         </Table.Tbody>
      </Table>
   )
}

export default Metadata
