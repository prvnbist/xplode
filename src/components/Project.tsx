import { Link } from '@tanstack/react-router'

import { IconTrash } from '@tabler/icons-react'

import { modals } from '@mantine/modals'
import { useHover } from '@mantine/hooks'
import { ActionIcon, Group, Paper, Space, Text, Title } from '@mantine/core'

import { TProject, db } from '../lib/db'

const Project = ({ project }: { project: TProject }) => {
   const { hovered, ref } = useHover<HTMLAnchorElement>()

   const title = project.path.match(/[^\\\/]+$/)?.[0] ?? ''

   const remove = () =>
      modals.openConfirmModal({
         title: 'Delete Project',
         children: <Text size="sm">Are you sure you want to remove {title}?</Text>,
         labels: { confirm: 'Yes, delete', cancel: 'Cancel' },
         onConfirm: () => db.project.delete(project.id!),
      })

   return (
      <Paper
         p="lg"
         pt="sm"
         ref={ref}
         withBorder
         bg="dark.8"
         component={Link}
         to={`/project/$id`}
         params={{ id: project.id }}
         {...(hovered && { shadow: 'md' })}
      >
         <Group justify="space-between" h={40}>
            <Title order={5} c="white">
               {title}
            </Title>
            {hovered && (
               <ActionIcon size="md" variant="subtle" title="Delete Project" onClick={remove}>
                  <IconTrash size={16} />
               </ActionIcon>
            )}
         </Group>
         <Space h={4} />
         <Text size="sm" c="dimmed">
            {project.path}
         </Text>
      </Paper>
   )
}

export default Project
