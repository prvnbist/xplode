import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { createLazyFileRoute } from '@tanstack/react-router'

import { join } from '@tauri-apps/api/path'
import { BaseDirectory, exists } from '@tauri-apps/api/fs'

import { modals } from '@mantine/modals'
import { Button, Center, Container, Group, SimpleGrid, Space, Text, TextInput, Title } from '@mantine/core'

import { db } from '../lib/db'
import { Project } from '../components'

export const Route = createLazyFileRoute('/')({
   component: Index,
})

function Index() {
   const projects = useLiveQuery(() => db.project.toArray())

   const add = () => {
      modals.open({
         title: 'Add Project',
         children: <AddProject />,
      })
   }

   return (
      <Container p={24}>
         <Group justify="space-between">
            <Title order={2}>Projects({projects?.length ?? 0})</Title>
            <Button variant="light" title="Add Project" onClick={add}>
               Add Project
            </Button>
         </Group>
         <Space h={16} />
         {!Array.isArray(projects) || projects?.length === 0 ? (
            <Center h={240}>
               <Text>-- No Projects --</Text>
            </Center>
         ) : (
            <SimpleGrid cols={3}>
               {projects.map(project => (
                  <Project key={project.id} project={project} />
               ))}
            </SimpleGrid>
         )}
      </Container>
   )
}

const AddProject = () => {
   const [path, setPath] = useState('')
   const [error, setError] = useState('')
   const [submitting, setSubmitting] = useState(false)

   const onSubmit = async () => {
      setSubmitting(true)
      const filePath = await join(path, 'package.json')
      const isAvailable = await exists(filePath, { dir: BaseDirectory.AppData })
      if (!isAvailable) {
         setSubmitting(false)
         setError('Either the folder does not exist or the folder does not contain a package.json file!')
         return
      }

      setError('')
      await db.project.add({ path })
      modals.closeAll()
   }
   return (
      <>
         <TextInput placeholder="eg: C:\code\project_1" value={path} onChange={e => setPath(e.target.value)} />
         <Space h={16} />
         <Button fullWidth onClick={onSubmit} disabled={!path || submitting} loading={submitting}>
            Submit
         </Button>
         <Space h={8} />
         {error && (
            <Text size="sm" c="red.5">
               {error}
            </Text>
         )}
      </>
   )
}
