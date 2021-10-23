import React from 'react'
import axios from 'axios'
import tw from 'twin.macro'
import Head from 'next/head'
import Modal from 'react-modal'
import { ipcRenderer } from 'electron'
import isString from 'lodash.isstring'
import startCase from 'lodash.startcase'
import isPlainObject from 'lodash.isplainobject'

import * as Icon from '../assets/icons'
import * as Illustration from '../assets/illustrations'
import { PackageModal, Packages } from '../components'
import { IFileState, IPackageDetailsState } from '../types'

function Home() {
   const [path, setPath] = React.useState('')
   const [file, setFile] = React.useState<IFileState>({})
   const [packageDetails, setPackageDetails] =
      React.useState<IPackageDetailsState>({})
   const [selectedPackage, setSelectedPackage] = React.useState<{
      name: string
      version: string
   }>({ name: '', version: '' })
   const [packageDetailsLoading, setPackageDetailsLoading] =
      React.useState<boolean>(false)

   const fetch_file = React.useCallback(async path => {
      try {
         const { success, data } = await get_file(path)
         if (success) {
            setFile(data)
         }
      } catch (error) {
         console.log(error)
      }
   }, [])

   React.useEffect(() => {
      if (path) {
         fetch_file(path)
      }
   }, [path, fetch_file])

   const fetch_package = React.useCallback(async () => {
      setPackageDetailsLoading(true)
      if (selectedPackage?.name) {
         const { success, data } = await get_package(selectedPackage.name)
         if (success) {
            setPackageDetails({
               ...data,
               isDevDependency:
                  file.devDependencies?.hasOwnProperty(selectedPackage.name) ??
                  false,
            })
         }
      }
      setPackageDetailsLoading(false)
   }, [file, selectedPackage, setPackageDetails, setPackageDetailsLoading])

   const closeModal = () => {
      setSelectedPackage({ name: '', version: '' })
      setPackageDetails({})
   }

   const uninstallPackage = React.useCallback(
      async name => {
         try {
            const { success } = await uninstall_package({ path, name })
            if (success) {
               fetch_file(path)
            }
         } catch (error) {
            console.log(error)
         }
      },
      [path, fetch_file]
   )

   return (
      <React.Fragment>
         <Head>
            <title>Home</title>
         </Head>
         <header tw="flex items-center justify-between h-12 border-b border-gray-700">
            <aside tw="flex">
               <button
                  title="Select Project"
                  tw="bg-green-400 ml-2 h-8 w-8 rounded flex items-center justify-center"
                  onClick={() => {
                     ipcRenderer
                        .invoke('select-folder-window')
                        .then(setPath)
                        .catch(console.log)
                  }}
               >
                  <Icon.Add size={22} tw="stroke-current text-white" />
               </button>
               {file?.name && (
                  <h3
                     title={'Project: ' + file?.name}
                     tw="ml-3 text-lg text-white"
                  >
                     {file?.name}
                  </h3>
               )}
            </aside>
            <button
               title="Close Project"
               tw="flex-shrink-0 border border-red-400 mr-2 h-8 w-8 rounded flex items-center justify-center"
               onClick={() => {
                  setFile({})
                  setPath('')
               }}
            >
               <Icon.Close size={22} tw="stroke-current text-white" />
            </button>
         </header>
         {!path.trim() ? (
            <section tw="mt-8 flex flex-col items-center">
               <div>
                  <Illustration.Empty />
               </div>
               <p tw="mt-4 text-center text-white">
                  Start by selecting a folder!
               </p>
            </section>
         ) : (
            <>
               <main tw="p-3">
                  {Object.keys(file).map(key => (
                     <Renderer key={key} field={key} value={file[key]} />
                  ))}
                  <div tw="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                     <section>
                        <h2 tw="mb-2 uppercase font-medium text-sm text-gray-500 tracking-wider">
                           Dependencies
                        </h2>
                        <Packages
                           uninstallPackage={uninstallPackage}
                           packages={file?.dependencies || {}}
                           setSelectedPackage={setSelectedPackage}
                        />
                     </section>
                     <section>
                        <h2 tw="mb-2 uppercase font-medium text-sm text-gray-500 tracking-wider">
                           Dev Dependencies
                        </h2>
                        <Packages
                           uninstallPackage={uninstallPackage}
                           packages={file.devDependencies || {}}
                           setSelectedPackage={setSelectedPackage}
                        />
                     </section>
                  </div>
               </main>
               <Modal
                  onAfterClose={closeModal}
                  onAfterOpen={fetch_package}
                  onRequestClose={closeModal}
                  shouldCloseOnOverlayClick={true}
                  isOpen={Boolean(selectedPackage?.name)}
                  contentElement={(props, children) => (
                     <div {...props} tw="!border-0 !bg-gray-900">
                        {children}
                     </div>
                  )}
               >
                  <PackageModal
                     path={path}
                     closeModal={closeModal}
                     fetch_file={fetch_file}
                     details={packageDetails}
                     loading={packageDetailsLoading}
                     installed={selectedPackage.version}
                  />
               </Modal>
            </>
         )}
      </React.Fragment>
   )
}

export default Home

const isNested = input => {
   if (!isPlainObject(input)) return false

   let result = false

   for (let [, value] of Object.entries(input)) {
      if (!isString(value)) {
         result = true
      }
   }
   return result
}

const Renderer = ({ field, value }) => {
   if (['dependencies', 'devDependencies'].includes(field)) return null

   if (isNested(value)) return null
   if (typeof value === 'string')
      return (
         <section tw="mt-3">
            <span tw="uppercase font-medium text-sm text-gray-500 tracking-wider">
               {startCase(field)}:{' '}
            </span>
            <p tw="text-white">{value}</p>
         </section>
      )
   if (typeof value === 'object') {
      return (
         <section tw="mt-3">
            <span tw="uppercase font-medium text-sm text-gray-500 tracking-wider">
               {startCase(field)}:{' '}
            </span>
            <ul tw="mt-2 border border-gray-700 rounded">
               {Object.keys(value).map(
                  key =>
                     typeof value[key] === 'string' && (
                        <li
                           key={key}
                           tw="gap-3 text-gray-400 flex px-3 h-10 items-center border-b border-gray-700 last:border-0"
                        >
                           <span>{key}:</span>
                           <span tw="text-yellow-200">{value[key]}</span>
                        </li>
                     )
               )}
            </ul>
         </section>
      )
   }
   return null
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
