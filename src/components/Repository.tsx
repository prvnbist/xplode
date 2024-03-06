import { ActionIcon, Group, Table } from '@mantine/core'
import { IconArrowUpRight, IconBrandGithubFilled } from '@tabler/icons-react'

const Repository = ({ repository }: { repository: { url: string; type: string } }) => {
   if (!repository.url) return null
   return (
      <Table.Tr>
         <Table.Td>Repository</Table.Td>
         <Table.Td>
            <Group gap={8}>
               <IconBrandGithubFilled size={16} />
               {repository.url}
               <ActionIcon
                  ml="auto"
                  size="sm"
                  variant="subtle"
                  title="Open in browser"
                  style={{ cursor: 'pointer' }}
                  onClick={() => open(repository.url)}
               >
                  <IconArrowUpRight size={16} />
               </ActionIcon>
            </Group>
         </Table.Td>
      </Table.Tr>
   )
}

export default Repository
