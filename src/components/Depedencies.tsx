import { IconInfoCircle } from '@tabler/icons-react'

import { ActionIcon, Flex, Table } from '@mantine/core'

import { DependencyType, TDependency } from '../types'

type DependenciesProps = {
   type: DependencyType
   deps: Record<string, string>
   onView: (dep: TDependency) => void
}

const Dependencies = ({ type, onView, deps = {} }: DependenciesProps) => {
   return (
      <Table striped>
         <Table.Tbody>
            {Object.keys(deps).map(key => (
               <Table.Tr key={key}>
                  <Table.Td width={40} pr={0}>
                     <Flex>
                        <ActionIcon
                           size="sm"
                           variant="subtle"
                           title="View Details"
                           onClick={() => onView({ name: key, version: deps[key], type })}
                        >
                           <IconInfoCircle size={16} />
                        </ActionIcon>
                     </Flex>
                  </Table.Td>
                  <Table.Td pl={0}>{key}</Table.Td>
                  <Table.Td ta="right">{deps[key]}</Table.Td>
               </Table.Tr>
            ))}
         </Table.Tbody>
      </Table>
   )
}

export default Dependencies
