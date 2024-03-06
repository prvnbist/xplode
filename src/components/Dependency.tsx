import { IconCheck } from '@tabler/icons-react'
import { ReactNode, useEffect, useMemo, useState } from 'react'

import { open } from '@tauri-apps/api/shell'
import { fetch } from '@tauri-apps/api/http'

import type { ComboboxItem, ComboboxLikeRenderOptionInput } from '@mantine/core'
import {
   Center,
   Flex,
   Group,
   Input,
   Loader,
   Pill,
   Select,
   Space,
   Stack,
   Table,
   Text,
   Title,
   UnstyledButton,
} from '@mantine/core'

import { TDependency } from '../types'
import { dateFormatter, formatContributors } from '../utils'

const NPM_ENDPOINT = 'https://registry.npmjs.org'

type RenderSelectOption = ComboboxLikeRenderOptionInput<ComboboxItem & { description?: string }>

const renderSelectOption = (item: RenderSelectOption): ReactNode => (
   <Group w="100%" justify="space-between">
      <Stack gap={4}>
         <Text size="sm">{item.option.label}</Text>
         {item.option.description && (
            <Text c="dimmed" size="xs">
               Published on {item.option.description}
            </Text>
         )}
      </Stack>
      {item.checked && (
         <IconCheck
            {...{
               stroke: 1.5,
               color: 'currentColor',
               opacity: 0.6,
               size: 18,
            }}
         />
      )}
   </Group>
)

type Details = { [key in string]: any }

const Row = ({ label, children }: { label: string; children: ReactNode }) => {
   return (
      <Table.Tr>
         <Table.Td>{label}</Table.Td>
         <Table.Td>{children}</Table.Td>
      </Table.Tr>
   )
}

const preparePackageData = (data: Details) => ({
   ...data,
   contributors: formatContributors(data.contributors),
   ...(data.repository && {
      repository: { ...data.repository, url: data.repository.url.replace(/^git\+|\.git$/g, '') },
   }),
   versions: Object.keys(data.versions)
      .reverse()
      .map(v => {
         let description = ''
         if (data.time[v]) {
            description = dateFormatter.format(new Date(data.time[v]))
         }
         return {
            label: v,
            value: v,
            description,
         }
      }),
})

const Dependency = ({ dependency }: { dependency: TDependency }) => {
   const [isLoading, setIsLoading] = useState(false)
   const [details, setDetails] = useState<Details>({})

   useEffect(() => {
      if (dependency?.name) {
         setIsLoading(true)
         ;(async () => {
            try {
               const { data } = await fetch<Details>(`${NPM_ENDPOINT}/${dependency.name}`, {
                  method: 'GET',
               })

               setDetails(preparePackageData(data))
            } catch (error) {
               console.log(error)
            } finally {
               setIsLoading(false)
            }
         })()
      }
   }, [])

   const currentVersion = useMemo(() => {
      let version = dependency.version

      if (['~', '^', '>', '>=', '<', '<='].some(i => version.startsWith(i))) {
         version = version.replace(/^[\^~><=]+/, '')
      }
      return version
   }, [dependency.version])

   if (isLoading)
      return (
         <Center py="lg">
            <Loader size="sm" />
         </Center>
      )

   return (
      <div>
         <Title order={3}>{details.name}</Title>
         <Space h={8} />
         <Text c="dimmed" size="sm">
            {details.description}
         </Text>
         <Space h={16} />
         <Stack gap={4}>
            <Input.Label>Version</Input.Label>
            <Select
               searchable
               onChange={() => {}}
               value={currentVersion}
               data={details.versions}
               renderOption={renderSelectOption}
            />
         </Stack>
         <Space h={16} />
         <Table withTableBorder withColumnBorders withRowBorders>
            <Table.Tbody>
               {details.author?.name && (
                  <Row label="Author">
                     <Text size="sm">
                        {details.author.name}
                        {` `}
                        {details.author?.email && `(${details.author.email})`}
                     </Text>
                  </Row>
               )}
               {details.license && (
                  <Row label="License">
                     <Text size="sm">{details.license}</Text>
                  </Row>
               )}
               {Array.isArray(details.keywords) && details.keywords.length > 0 && (
                  <Row label="Keywords">
                     <Flex gap={4} wrap="wrap">
                        {details.keywords.map((keyword: string) => (
                           <Pill bg="dark.6" key={keyword}>
                              {keyword}
                           </Pill>
                        ))}
                     </Flex>
                  </Row>
               )}
               {details.homepage && (
                  <Row label="Homepage">
                     <UnstyledButton onClick={() => open(details.homepage)}>
                        <Text size="sm" c="blue.4">
                           {details.homepage}
                        </Text>
                     </UnstyledButton>
                  </Row>
               )}
               {details?.repository?.url && (
                  <Row label="Repository">
                     <UnstyledButton onClick={() => open(details.repository.url)}>
                        <Text size="sm" c="blue.4">
                           {details.repository.url}
                        </Text>
                     </UnstyledButton>
                  </Row>
               )}
               {Array.isArray(details.maintainers) && details.maintainers.length > 0 && (
                  <Row label="Maintainers">
                     <Flex gap={4} wrap="wrap">
                        {details.maintainers.map((maintainer: { name: string; email: string }) => (
                           <Pill bg="dark.6" key={maintainer.email}>
                              {maintainer.name}
                           </Pill>
                        ))}
                     </Flex>
                  </Row>
               )}
               {details?.bugs?.url && (
                  <Row label="Issues">
                     <UnstyledButton onClick={() => open(details.bugs.url)}>
                        <Text size="sm" c="blue.4">
                           {details.bugs.url}
                        </Text>
                     </UnstyledButton>
                  </Row>
               )}
               {details.contributors && (
                  <Row label="Contributors">
                     <Text size="sm">{details.contributors}</Text>
                  </Row>
               )}
            </Table.Tbody>
         </Table>
      </div>
   )
}

export default Dependency
