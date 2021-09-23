import React from 'react'
import axios from 'axios'
import tw from 'twin.macro'
import Select from 'react-select'

import * as Icon from '../assets/icons'
import { IPackageDetailsProps } from '../types'

export const PackageModal = ({
   path,
   loading,
   details,
   installed,
   closeModal,
   fetch_file,
}: IPackageDetailsProps) => {
   return (
      <>
         <header tw="h-12 pl-3 pr-2 flex items-center justify-between">
            <span tw="text-white">{details.name}</span>
            <button
               onClick={closeModal}
               tw="h-8 w-8 rounded hover:bg-gray-700 flex items-center justify-center"
            >
               <Icon.Close size={18} tw="stroke-current text-white" />
            </button>
         </header>
         <main tw="px-3">
            {loading ? (
               <span tw="flex text-center text-white">Loading...</span>
            ) : (
               <>
                  <Description description={details?.description} />
                  <Author author={details?.author} />
                  <Homepage homepage={details?.homepage} />
                  <Github url={details?.github_url} />
                  <Versions
                     path={path}
                     name={details?.name}
                     installed={installed}
                     fetch_file={fetch_file}
                     versions={details?.versions}
                     isDevDependency={details?.isDevDependency}
                  />
               </>
            )}
         </main>
      </>
   )
}

const Description = ({ description }) => {
   if (!description) return null
   return (
      <section tw="mt-3">
         <span tw="uppercase font-medium text-sm text-gray-500 tracking-wider">
            Description:{' '}
         </span>
         <p tw="text-gray-400">{description}</p>
      </section>
   )
}

const Author = ({ author }) => {
   if (!author) return null
   return (
      <section tw="mt-6">
         <span tw="block mb-1 uppercase font-medium text-sm text-gray-500 tracking-wider">
            Author:{' '}
         </span>
         <div tw="flex items-center gap-2">
            {author?.name && (
               <div tw="text-yellow-300 text-sm font-light h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                  {author?.name
                     .match(/(^\S\S?|\b\S)?/g)
                     .join('')
                     .match(/(^\S|\S$)?/g)
                     .join('')
                     .toUpperCase()}
               </div>
            )}
            <div tw="flex flex-col">
               {author?.name && <span tw="text-gray-400">{author?.name}</span>}
               {author?.email && (
                  <span tw="text-gray-400 text-sm">{author?.email}</span>
               )}
            </div>
         </div>
      </section>
   )
}

const Homepage = ({ homepage }) => {
   if (!homepage) return null
   return (
      <section tw="mt-6">
         <span tw="block uppercase font-medium text-sm text-gray-500 tracking-wider">
            Homepage:{' '}
         </span>
         <a
            target="_blank"
            href={homepage}
            rel="noopener noreferrer"
            tw="text-blue-300"
         >
            {homepage}
         </a>
      </section>
   )
}

const Github = ({ url }) => {
   if (!url) return null
   return (
      <section tw="mt-6">
         <span tw="block uppercase font-medium text-sm text-gray-500 tracking-wider">
            Github:{' '}
         </span>
         <a
            href={url}
            target="_blank"
            tw="text-blue-300"
            rel="noopener noreferrer"
         >
            {url}
         </a>
      </section>
   )
}

const Versions = ({
   path,
   name,
   installed,
   fetch_file,
   isDevDependency,
   versions: _versions,
}) => {
   const [logs, setLogs] = React.useState<string>('')
   const [installing, setInstalling] = React.useState<boolean>(false)
   const [selectedVersion, setSelectedVersion] = React.useState<string>('')

   const update_version = async () => {
      try {
         setInstalling(true)
         const { status, data } = await axios.post('/api/packages/install', {
            path,
            name: name,
            version: selectedVersion,
            isDevDependency: isDevDependency,
         })
         if (status === 200) {
            if (data.success) {
               setLogs(data.data)
               fetch_file(path)
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

   const onVersionChange = ({ value }) => {
      setLogs('')
      setSelectedVersion(value)
   }

   const versions = React.useMemo(
      () =>
         _versions?.map(version => ({ value: version, label: version })) || [],
      [_versions]
   )

   const styles = React.useMemo(
      () => ({
         dropdownIndicator: styles => {
            return { ...styles, color: '#000' }
         },
         option: (styles, { isDisabled, isSelected }) => {
            return {
               ...styles,
               color: isDisabled ? '#ccc' : isSelected ? '#fff' : '#000',
            }
         },
      }),
      []
   )

   return (
      <section tw="mt-6">
         <span tw="block mb-2 uppercase font-medium text-sm text-gray-500 tracking-wider">
            Versions:{' '}
         </span>
         <Select
            components={{ DropdownIndicator: _DropdownIndicator }}
            defaultValue={{
               value: installed.replace('^', ''),
               label: installed.replace('^', ''),
            }}
            options={versions}
            onChange={onVersionChange}
            styles={styles}
         />
         {selectedVersion && selectedVersion !== installed.replace('^', '') && (
            <button
               disabled={installing}
               onClick={update_version}
               tw="mt-2 w-full bg-green-500 text-white h-10 rounded disabled:(bg-gray-600 text-black)"
            >
               {installing ? `Updating ` : `Update `}to v{selectedVersion}
            </button>
         )}

         {logs && (
            <>
               <span tw="mt-3 mb-2 block uppercase font-medium text-sm text-gray-500 tracking-wider">
                  Logs:{' '}
               </span>
               <pre tw="p-2 h-[360px] bg-gray-800 rounded w-full overflow-auto">
                  <code tw="text-white">{logs}</code>
               </pre>
            </>
         )}
      </section>
   )
}

const _DropdownIndicator = ({ isFocused }) => {
   return (
      <button tw="flex items-center justify-center w-8">
         {isFocused ? (
            <Icon.Up size={20} tw="stroke-current text-gray-800" />
         ) : (
            <Icon.Down size={20} tw="stroke-current text-gray-800" />
         )}
      </button>
   )
}
