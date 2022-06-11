import path from 'path'
import React from 'react'
import Head from 'next/head'
import { NextPage } from 'next'
import { ipcRenderer } from 'electron'
import { useRouter } from 'next/router'
import { PackgeImport } from 'tabler-icons-react'
import { Space, Grid, Container, Title, Button, Center } from '@mantine/core'

import { useProjects } from '../lib/projects'

const Index: NextPage = (): JSX.Element => {
   const router = useRouter()
   const { projects, dispatch } = useProjects()
   return (
      <div>
         <Head>
            <title>Home</title>
         </Head>
         <header>
            <Center
               style={{ height: '200px' }}
               sx={theme => ({
                  borderBottom: `1px solid ${theme.colors.dark[5]}`,
               })}
            >
               <Button
                  color="gray"
                  size="xl"
                  leftIcon={<PackgeImport size={36} strokeWidth={1.5} color={'#e6b3b3'} />}
                  onClick={() =>
                     ipcRenderer
                        .invoke('select-folder-window')
                        .then(path => dispatch({ type: 'ADD_PROJECT', payload: { path } }))
                        .catch(console.log)
                  }
               >
                  Import Project
               </Button>
            </Center>
         </header>
         <Container sx={theme => ({ marginTop: `-${theme.spacing.xl}px` })}>
            <Grid>
               {projects.map(project => {
                  return (
                     <Grid.Col span={4} key={project.path}>
                        <Container
                           as="li"
                           sx={theme => ({
                              height: '110px',
                              borderRadius: theme.radius.md,
                              background: theme.colors.dark[6],
                              padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
                           })}
                        >
                           <Title order={4}>{path.basename(project.path)}</Title>
                           <Space h="md" />
                           <Button
                              fullWidth
                              variant="light"
                              color="cyan"
                              onClick={() => {
                                 dispatch({ type: 'SELECT_PROJECT', payload: project })
                                 router.push(`/project`)
                              }}
                           >
                              View Project
                           </Button>
                        </Container>
                     </Grid.Col>
                  )
               })}
            </Grid>
         </Container>
      </div>
   )
}

export default Index
