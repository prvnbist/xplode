import { useState } from 'react'
import { IconArrowBack } from '@tabler/icons-react'
import { Link, createFileRoute } from '@tanstack/react-router'

import { join } from '@tauri-apps/api/path'
import { BaseDirectory, exists, readTextFile } from '@tauri-apps/api/fs'

import { useDisclosure } from '@mantine/hooks'
import { Accordion, ActionIcon, Container, Drawer, Group, Space, Text, Title } from '@mantine/core'

import { db } from '../lib/db'
import { TDependency, TProject } from '../types'
import { Dependencies, Dependency, Metadata, Scripts } from '../components'

type RouteData =
   | {
        status: 'ERROR'
        message: string
     }
   | {
        status: 'SUCCESS'
        data: TProject & {
           title: string
           content: Record<string, any>
        }
     }

export const Route = createFileRoute('/project/$id')({
   loader: async ({ params }): Promise<RouteData> => {
      const project = await db.project.get(Number(params.id))
      if (!project?.id) {
         return { status: 'ERROR', message: 'No such project exists!' }
      }

      const filePath = await join(project.path, 'package.json')
      const isAvailable = await exists(filePath, { dir: BaseDirectory.AppData })

      if (!isAvailable) {
         return {
            status: 'ERROR',
            message: 'Either the folder does not exist or the folder does not contain a package.json file!',
         }
      }

      const rawContent = await readTextFile(filePath, { dir: BaseDirectory.AppConfig })
      let parsedContent = {}

      try {
         parsedContent = JSON.parse(rawContent)
      } catch (error) {
         return {
            status: 'ERROR',
            message: 'The package.json seems to have invalid json, please fix and retry!',
         }
      }

      return {
         status: 'SUCCESS',
         data: {
            ...project,
            content: parsedContent,
            title: project?.path.match(/[^\\\/]+$/)?.[0] ?? '',
         },
      }
   },
   component: Project,
})

function Project() {
   const data = Route.useLoaderData()
   const [opened, { open, close }] = useDisclosure(false)
   const [dependency, setDependency] = useState<TDependency | null>(null)

   if (data.status === 'ERROR') {
      return (
         <Container p={24}>
            <Group>
               <ActionIcon variant="default" color="dark" component={Link} to="/">
                  <IconArrowBack size={16} />
               </ActionIcon>
            </Group>
            <Space h={16} />
            <Text>{data.message}</Text>
         </Container>
      )
   }

   const onView = (dep: TDependency) => {
      setDependency(dep)
      open()
   }
   return (
      <Container p={24}>
         <Group>
            <ActionIcon variant="default" color="dark" component={Link} to="/">
               <IconArrowBack size={16} />
            </ActionIcon>
            <Title order={2}>Project: {data.data.title}</Title>
         </Group>
         <Space h={16} />
         <Metadata content={data.data.content} />
         <Space h={16} />
         <Accordion variant="separated" defaultValue="scripts">
            {data.data.content.scripts && (
               <Accordion.Item value="scripts">
                  <Accordion.Control>Scripts</Accordion.Control>
                  <Accordion.Panel>
                     <Scripts scripts={data.data.content.scripts} />
                  </Accordion.Panel>
               </Accordion.Item>
            )}
            {data.data.content.dependencies && (
               <Accordion.Item value="dependencies">
                  <Accordion.Control>Dependencies</Accordion.Control>
                  <Accordion.Panel>
                     <Dependencies type="dependency" deps={data.data.content.dependencies} onView={onView} />
                  </Accordion.Panel>
               </Accordion.Item>
            )}
            {data.data.content.devDependencies && (
               <Accordion.Item value="devDependencies">
                  <Accordion.Control>Dev Dependencies</Accordion.Control>
                  <Accordion.Panel>
                     <Dependencies type="devDependency" deps={data.data.content.devDependencies} onView={onView} />
                  </Accordion.Panel>
               </Accordion.Item>
            )}
            {data.data.content.peerDependencies && (
               <Accordion.Item value="peerDependencies">
                  <Accordion.Control>Peer Dependencies</Accordion.Control>
                  <Accordion.Panel>
                     <Dependencies type="peerDependency" deps={data.data.content.peerDependencies} onView={onView} />
                  </Accordion.Panel>
               </Accordion.Item>
            )}
         </Accordion>
         <Drawer offset={8} radius="md" opened={opened} onClose={close} position="right" title="Dependency Details">
            {opened && dependency?.name && <Dependency dependency={dependency} />}
         </Drawer>
      </Container>
   )
}
