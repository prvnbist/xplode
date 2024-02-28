import startCase from 'lodash.startcase'
import { IconArrowBack } from '@tabler/icons-react'
import { Link, createFileRoute } from '@tanstack/react-router'

import { join } from '@tauri-apps/api/path'
import { BaseDirectory, exists, readTextFile } from '@tauri-apps/api/fs'

import { Accordion, ActionIcon, Checkbox, Container, Group, Space, Table, Text, Title } from '@mantine/core'

import { TProject, db } from '../lib/db'

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
                     <Dependencies deps={data.data.content.dependencies} />
                  </Accordion.Panel>
               </Accordion.Item>
            )}
            {data.data.content.devDependencies && (
               <Accordion.Item value="devDependencies">
                  <Accordion.Control>Dev Dependencies</Accordion.Control>
                  <Accordion.Panel>
                     <Dependencies deps={data.data.content.devDependencies} />
                  </Accordion.Panel>
               </Accordion.Item>
            )}
            {data.data.content.peerDependencies && (
               <Accordion.Item value="peerDependencies">
                  <Accordion.Control>Peer Dependencies</Accordion.Control>
                  <Accordion.Panel>
                     <Dependencies deps={data.data.content.peerDependencies} />
                  </Accordion.Panel>
               </Accordion.Item>
            )}
         </Accordion>
      </Container>
   )
}

const Metadata = ({ content }: { content: Record<string, any> }) => {
   const keys = Object.keys(content).sort((a, b) => a.localeCompare(b))
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
         </Table.Tbody>
      </Table>
   )
}

const Scripts = ({ scripts = {} }: { scripts: Record<string, string> }) => {
   const keys = Object.keys(scripts).sort((a, b) => a.localeCompare(b))
   return (
      <Table>
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

const Dependencies = ({ deps = {} }: { deps: Record<string, string> }) => {
   return (
      <Table>
         <Table.Tbody>
            {Object.keys(deps).map(key => (
               <Table.Tr key={key}>
                  <Table.Td>{key}</Table.Td>
                  <Table.Td ta="right">{deps[key]}</Table.Td>
               </Table.Tr>
            ))}
         </Table.Tbody>
      </Table>
   )
}
