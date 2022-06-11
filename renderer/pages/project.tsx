import axios from 'axios'
import React from 'react'
import Head from 'next/head'
import { NextPage } from 'next'
import { Prism } from '@mantine/prism'
import { useRouter } from 'next/router'
import isPlainObject from 'lodash.isplainobject'
import { useDebouncedValue } from '@mantine/hooks'
import { Refresh, Trash, Edit, Command, ListDetails, Package, Plus } from 'tabler-icons-react'
import {
   Box,
   Text,
   Grid,
   Group,
   Stack,
   Title,
   Space,
   Button,
   Drawer,
   Center,
   Switch,
   Select,
   Anchor,
   Loader,
   TextInput,
   ThemeIcon,
   Container,
   ActionIcon,
   ScrollArea,
   Breadcrumbs,
   LoadingOverlay,
   UnstyledButton,
} from '@mantine/core'

import { useProjects } from '../lib/projects'

const Project: NextPage = (): JSX.Element => {
   const router = useRouter()
   const { selectedProject } = useProjects()
   const [content, setContent] = React.useState({})
   const [refreshing, setRefreshing] = React.useState(false)
   const [currentPanel, setCurrentPanel] = React.useState('Details')
   const crumbs = React.useMemo(
      () =>
         [
            { title: 'Home', href: '/' },
            { title: 'Project', href: '/project' },
         ].map((item, index) => (
            <Anchor href={item.href} key={index}>
               {item.title}
            </Anchor>
         )),
      []
   )

   const fetchProject = async () => {
      setRefreshing(true)
      try {
         const data = await fetch_file(selectedProject.path)
         const content = {
            details: Object.fromEntries(
               Object.keys(data)
                  .map(key => {
                     if (!isPlainObject(data[key])) {
                        return [key, data[key]]
                     }
                     return null
                  })
                  .filter(Boolean)
            ),
            scripts: data.scripts || {},
            dependencies: data.dependencies || {},
            devDependencies: data.devDependencies || {},
         }
         setContent(content)
      } catch (error) {
         console.log('Failed to refresh!')
      } finally {
         setRefreshing(false)
      }
   }

   React.useEffect(() => {
      if (selectedProject?.path) {
         ;(async () => {
            await fetchProject()
         })()
      } else {
         router.push('/')
      }
   }, [selectedProject])

   return (
      <Container px={16} py={24} fluid>
         <Head>
            <title>Project Details</title>
         </Head>
         <header>
            <Breadcrumbs>{crumbs}</Breadcrumbs>
            <Space h="md" />
            <Group>
               <Title order={3}>Project Details</Title>
               <ActionIcon title="Refresh Project" variant="filled" onClick={fetchProject} loading={refreshing}>
                  <Refresh size={16} />
               </ActionIcon>
            </Group>
         </header>
         <Space h="xl" />
         <main>
            <Grid>
               <Grid.Col span={2}>
                  <Container py={8} px={8} fluid sx={theme => ({ borderRadius: `${theme.radius.md}px`, background: theme.colors.dark[4] })}>
                     <MainLinks currentPanel={currentPanel} setCurrentPanel={setCurrentPanel} />
                  </Container>
               </Grid.Col>
               <Grid.Col span={10}>
                  <Container>
                     <Renderer fetchProject={fetchProject} content={content} panel={currentPanel} />
                  </Container>
               </Grid.Col>
            </Grid>
         </main>
      </Container>
   )
}

export default Project

const DetailsRenderer = ({ details = {} }) => {
   return (
      <Stack>
         {Object.keys(details).map(key => {
            if (typeof details[key] === 'string') {
               return (
                  <div key={key}>
                     <TextInput value={details[key]} label={key} onChange={() => {}} required />
                  </div>
               )
            } else if (typeof details[key] === 'boolean') {
               return (
                  <div key={key}>
                     <Switch size="md" label={key} checked={details[key]} onChange={() => {}} />
                  </div>
               )
            }
         })}
      </Stack>
   )
}

const ScriptsRenderer = ({ scripts }) => {
   return (
      <Stack spacing="lg">
         {Object.keys(scripts).map(key => {
            return (
               <Stack spacing="xs" key={key}>
                  <Title order={5}>{key}</Title>
                  <Prism noCopy language="bash">
                     {scripts[key]}
                  </Prism>
               </Stack>
            )
         })}
      </Stack>
   )
}

const DependenciesRenderer = ({ fetchProject, dependencies, isDevDependency = false }) => {
   const { selectedProject } = useProjects()
   const [_package, setPackage] = React.useState(null)
   const [uninstalling, setUninstalling] = React.useState(false)

   const uninstall = async ({ name, path }) => {
      try {
         setUninstalling(true)
         const { success } = await uninstall_package({ name, path })
         if (success) {
            await fetchProject()
         }
      } catch (error) {
         console.log('Failed to remove package!')
      } finally {
         setUninstalling(false)
      }
   }

   return (
      <>
         <Stack spacing="xs" sx={{ position: 'relative' }}>
            <LoadingOverlay visible={uninstalling} />
            {Object.keys(dependencies).map(key => {
               return (
                  <Box
                     p={16}
                     key={key}
                     width="100%"
                     sx={theme => ({
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderRadius: `${theme.radius.md}px`,
                        border: `1px solid ${theme.colors.dark[3]}`,
                     })}
                  >
                     <Stack spacing="xs">
                        <Group>
                           <Text color="dimmed">Name:</Text>
                           <Text>{key}</Text>
                        </Group>
                        <Group>
                           <Text color="dimmed">Version:</Text>
                           <Text>{dependencies[key]}</Text>
                        </Group>
                     </Stack>
                     <Group spacing="xs">
                        <ActionIcon title="Edit Package" color="blue" onClick={() => setPackage({ name: key, version: dependencies[key] })}>
                           <Edit size={16} />
                        </ActionIcon>
                        <ActionIcon title="Delete Package" color="red" onClick={() => uninstall({ name: key, path: selectedProject?.path })}>
                           <Trash size={16} />
                        </ActionIcon>
                     </Group>
                  </Box>
               )
            })}
         </Stack>
         <Drawer position="right" opened={_package?.name} onClose={() => setPackage(null)} title="Package Details" padding="xl" size="xl">
            <PackageDetails fetchProject={fetchProject} _package={_package} isDevDependency={isDevDependency} />
         </Drawer>
      </>
   )
}

const PackageDetails = ({ _package, isDevDependency, fetchProject }) => {
   const { selectedProject } = useProjects()
   const [details, setDetails] = React.useState(null)
   const [loading, setLoading] = React.useState(true)
   const [logs, setLogs] = React.useState<string>('')
   const [installing, setInstalling] = React.useState<boolean>(false)
   const [version, setVersion] = React.useState(_package?.version?.slice(1) || null)

   React.useEffect(() => {
      if (_package?.name) {
         ;(async () => {
            try {
               const { success, data } = await get_package(_package.name)
               if (success) {
                  console.log({ data })
                  setDetails(data)
               }
            } catch (error) {
            } finally {
               setLoading(false)
            }
         })()
      }
   }, [_package])

   const update_version = async () => {
      try {
         setInstalling(true)
         const { status, data } = await axios.post('/api/packages/install', {
            version: version,
            name: details?.name,
            path: selectedProject?.path,
            isDevDependency: isDevDependency,
         })
         if (status === 200) {
            if (data.success) {
               setLogs(data.data)
               await fetchProject()
            } else {
               throw new Error(data.error)
            }
         }
         setInstalling(false)
      } catch (error) {
         setInstalling(false)
         console.log('Failed to install the package version!')
      }
   }

   if (loading)
      return (
         <Center sx={{ width: '100%', height: '48px' }}>
            <Loader color="yellow" size="sm" variant="dots" />
         </Center>
      )
   return (
      <Stack>
         <div>
            <Text transform="uppercase" size="xs">
               Name
            </Text>
            <Text>{details?.name}</Text>
         </div>
         <div>
            <Text transform="uppercase" size="xs" sx={{ wordBreak: 'break-all' }}>
               Description
            </Text>
            <Text>{details?.description}</Text>
         </div>
         <div>
            <Text transform="uppercase" size="xs">
               Author
            </Text>
            {isPlainObject(details?.author) ? (
               <Text>
                  {details?.author?.name} - {details?.author?.email}
               </Text>
            ) : (
               <Text>{details?.author}</Text>
            )}
         </div>
         <div>
            <Text transform="uppercase" size="xs">
               Github
            </Text>
            <Anchor href={details?.github_url} target="_blank" sx={{ wordBreak: 'break-all' }}>
               {details?.github_url}
            </Anchor>
         </div>
         <div>
            <Text transform="uppercase" size="xs">
               Homepage
            </Text>
            <Anchor href={details?.homepage} target="_blank" sx={{ wordBreak: 'break-all' }}>
               {details?.homepage}
            </Anchor>
         </div>
         <div>
            <Text transform="uppercase" size="xs">
               Version
            </Text>
            <Space h="xs" />
            <Select
               value={version}
               onChange={setVersion}
               placeholder="Select version"
               data={details?.versions?.map(_version => ({ value: _version, label: _version }))}
            />
            <Space h="xs" />
            <Button color="pink" fullWidth loading={installing} disabled={installing} onClick={update_version}>
               {installing ? `Updating package to v${version}` : 'Update'}
            </Button>
         </div>
         {logs && (
            <div>
               <Text transform="uppercase" size="xs">
                  Logs
               </Text>
               <Space h="xs" />
               <Prism noCopy withLineNumbers language="bash">
                  {logs}
               </Prism>
            </div>
         )}
      </Stack>
   )
}

const Renderer = ({ content, panel, fetchProject }) => {
   const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)
   if (panel === 'Details') {
      return (
         <div>
            <Title order={4}>Details</Title>
            <Space h="md" />
            <DetailsRenderer details={content.details} />
         </div>
      )
   } else if (panel === 'Scripts') {
      return (
         <div>
            <Title order={4}>Scripts</Title>
            <Space h="md" />
            <ScriptsRenderer scripts={content.scripts} />
         </div>
      )
   } else if (['Dependencies', 'Dev Dependencies'].includes(panel)) {
      return (
         <div>
            <Group>
               <Title order={4}>{panel === 'Dependencies' ? 'Dependencies' : 'Dev Dependencies'}</Title>
               <ActionIcon title="Add Package" variant="filled" onClick={() => setIsDrawerOpen(true)}>
                  <Plus size={16} />
               </ActionIcon>
            </Group>
            <Space h="md" />
            <DependenciesRenderer
               fetchProject={fetchProject}
               dependencies={panel === 'Dependencies' ? content.dependencies : content.devDependencies}
            />
            <Drawer position="right" opened={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="Add Package" padding="xl" size="xl">
               <ScrollArea style={{ height: 'calc(100vh  - 80px' }} px={24} mx={-24}>
                  <AddPackage fetchProject={fetchProject} type={panel === 'Dependencies' ? 'dependency' : 'devDependency'} />
               </ScrollArea>
            </Drawer>
         </div>
      )
   }
   return null
}

const AddPackage = ({ type, fetchProject }) => {
   const { selectedProject } = useProjects()
   const [search, setSearch] = React.useState('')
   const [debounced] = useDebouncedValue(search, 400)
   const [results, setResults] = React.useState<any[]>([])
   const [searching, setSearching] = React.useState(false)
   const [selectedPackage, setSelectedPackage] = React.useState(null)
   const [selectedPackageVersions, setSelectedPackageVersions] = React.useState([])
   const [selectedVersion, setSelectedVersion] = React.useState('')
   const [installing, setInstalling] = React.useState(false)
   const [logs, setLogs] = React.useState('')

   React.useEffect(() => {
      if (debounced) {
         ;(async () => {
            try {
               setSearching(true)
               setSelectedPackage(null)
               setSelectedPackageVersions([])
               setSelectedVersion('')
               setLogs('')
               const result = await axios.get('/api/packages/search?package=' + debounced)
               if (result.status === 200) {
                  setResults(result.data || [])
               }
            } catch (error) {
               console.log('Failed to search for the package!')
            } finally {
               setSearching(false)
            }
         })()
      }
   }, [debounced])

   React.useEffect(() => {
      if (selectedPackage?.name) {
         ;(async () => {
            try {
               const result = await get_package(selectedPackage?.name)
               if (result.success) {
                  setSelectedPackageVersions(result.data.versions || [])
               }
            } catch (error) {
               console.log('Failed to get the package!')
            }
         })()
      }
   }, [selectedPackage])

   const installPackage = async () => {
      try {
         setInstalling(true)
         const { status, data } = await axios.post('/api/packages/install', {
            version: selectedVersion,
            name: selectedPackage?.name,
            path: selectedProject?.path,
            isDevDependency: type === 'devDependency',
         })
         if (status === 200) {
            if (data.success) {
               setLogs(data.data)
               await fetchProject()
            } else {
               throw new Error(data.error)
            }
         }
      } catch (error) {
         console.log({ error })
         console.log('Failed to install the package version!')
      } finally {
         setInstalling(false)
      }
   }

   return (
      <div>
         <TextInput
            size="md"
            required
            radius="md"
            value={search}
            label="Search Package"
            placeholder="Search by package name"
            onChange={e => setSearch(e.target.value)}
         />
         <Space h="md" />
         {searching && (
            <Center sx={{ width: '100%', height: '48px' }}>
               <Loader color="yellow" size="sm" variant="dots" />
            </Center>
         )}
         {!searching && results.length > 0 && (
            <Stack
               p={8}
               component={ScrollArea}
               sx={theme => ({ maxHeight: '380px', border: `1px solid ${theme.colors.dark[4]}`, borderRadius: theme.radius.md })}
            >
               {results.map((item, index) => (
                  <>
                     {index !== 0 && <Space h="xs" />}
                     <Box
                        px={16}
                        py={8}
                        pb={16}
                        key={item.name}
                        sx={theme => ({
                           cursor: 'pointer',
                           borderRadius: theme.radius.md,
                           backgroundColor: theme.colors.dark[6],
                           '&:hover': {
                              backgroundColor: theme.colors.dark[5],
                           },
                           ...(selectedPackage?.name === item.name && {
                              backgroundColor: theme.colors.blue[9],
                              '&:hover': {
                                 backgroundColor: theme.colors.blue[9],
                              },
                           }),
                        })}
                        onClick={() => setSelectedPackage(item)}
                     >
                        <Text>
                           {item.name} by {isPlainObject(item.author) ? item.author.name : item.author}
                        </Text>
                        <Text size="sm" color="dimmed">
                           {item.description}
                        </Text>
                     </Box>
                  </>
               ))}
            </Stack>
         )}
         <Space h="md" />
         {selectedPackage && selectedPackageVersions.length > 0 && (
            <Select
               label="Versions"
               value={selectedVersion}
               onChange={setSelectedVersion}
               placeholder="Select a version"
               data={selectedPackageVersions.map(version => ({ value: version, label: version }))}
            />
         )}
         <Space h="xs" />
         {selectedVersion && (
            <Button color="pink" fullWidth loading={installing} disabled={installing} onClick={installPackage}>
               {installing ? `Installing v${selectedVersion}` : 'Install'}
            </Button>
         )}
         <Space h="sm" />
         {selectedVersion && logs && (
            <div>
               <Text>Logs</Text>
               <Space h="xs" />
               <Prism noCopy withLineNumbers language="bash">
                  {logs}
               </Prism>
            </div>
         )}
      </div>
   )
}

interface MainLinkProps {
   icon: React.ReactNode
   color: string
   label: string
   onClick: () => void
   is_active: boolean
}

function MainLink({ icon, color, label, is_active, onClick }: MainLinkProps) {
   return (
      <UnstyledButton
         onClick={onClick}
         sx={theme => ({
            display: 'block',
            width: '100%',
            padding: theme.spacing.xs,
            color: theme.colors.dark[0],
            borderRadius: theme.radius.sm,
            backgroundColor: is_active ? theme.colors.dark[6] : 'transparent',
            '&:hover': {
               backgroundColor: theme.colors.dark[6],
            },
         })}
      >
         <Group>
            <ThemeIcon color={color} variant="light">
               {icon}
            </ThemeIcon>

            <Text size="sm">{label}</Text>
         </Group>
      </UnstyledButton>
   )
}

const data = [
   { icon: <ListDetails size={16} strokeWidth={1.5} color={'#e6b3b3'} />, color: 'blue', label: 'Details' },
   { icon: <Command size={16} />, color: 'grape', label: 'Scripts' },
   { icon: <Package size={16} />, color: 'teal', label: 'Dependencies' },
   { icon: <Package size={16} />, color: 'violet', label: 'Dev Dependencies' },
]

function MainLinks({ currentPanel, setCurrentPanel }) {
   const links = data.map(link => (
      <MainLink {...link} key={link.label} is_active={currentPanel === link.label} onClick={() => setCurrentPanel(link.label)} />
   ))
   return <div>{links}</div>
}

const fetch_file = async path => {
   try {
      const { success, data } = await get_file(path)
      if (success) {
         return data
      }
   } catch (error) {
      console.log(error)
   }
}

const get_file = async path => {
   try {
      const { status, data } = await axios.get('/api/file', {
         params: { path },
      })
      if (status === 200) {
         if (data.success) {
            return { success: true, data: data.data }
         } else {
            return { success: false, error: data.error }
         }
      } else {
         return {
            success: false,
            error: "Failed to fetch package file's content.",
         }
      }
   } catch (error) {
      return { success: false, error: error.message }
   }
}

const get_package = async name => {
   try {
      const { status, data } = await axios.get(`/api/packages/${name}`)
      if (status === 200) {
         if (data.success) {
            return { success: true, data: data.data }
         } else {
            return { success: false, error: data.error }
         }
      } else {
         return {
            success: false,
            error: "Failed to fetch package's details.",
         }
      }
   } catch (error) {
      return { success: false, error: error.message }
   }
}

const uninstall_package = async ({ name, path }) => {
   try {
      const { status, data } = await axios.post(`/api/packages/uninstall`, {
         name,
         path,
      })
      if (status === 200) {
         if (data.success) {
            return { success: true }
         } else {
            return { success: false, error: data.error }
         }
      } else {
         return {
            success: false,
            error: 'Failed to uninstall package.',
         }
      }
   } catch (error) {
      return { success: false, error: error.message }
   }
}
