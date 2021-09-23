import React from 'react'
import axios from 'axios'
import tw from 'twin.macro'
import Head from 'next/head'
import Modal from 'react-modal'
import { ipcRenderer } from 'electron'

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

   React.useEffect(() => {
      // if (path.trim()) {
      ;(async () => {
         const { success, data } = await get_file(path)
         if (success) {
            setFile(data)
         }
      })()
      // }
   }, [path])

   const fetch_package = async () => {
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
   }

   const closeModal = () => {
      setSelectedPackage({ name: '', version: '' })
      setPackageDetails({})
   }

   return (
      <React.Fragment>
         <Head>
            <title>Home</title>
         </Head>
         <header tw="flex items-center h-12 bg-gray-700">
            <button
               title="Select Project"
               tw="bg-gray-600 h-full w-12 flex items-center justify-center"
               onClick={() => {
                  ipcRenderer
                     .invoke('select-folder-window')
                     .then(setPath)
                     .catch(console.log)
               }}
            >
               <Icon.Add tw="stroke-current text-white" />
            </button>
            {file?.name && (
               <h3
                  title={'Project: ' + file?.name}
                  tw="ml-4 text-lg text-white"
               >
                  {file?.name}
               </h3>
            )}
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
                  <h2 tw="text-lg mb-2 text-white">Dependencies</h2>
                  <Packages
                     packages={file?.dependencies || {}}
                     setSelectedPackage={setSelectedPackage}
                  />
                  <h2 tw="text-lg mt-4 mb-1 text-white">Dev Dependencies</h2>
                  <Packages
                     packages={file.devDependencies || {}}
                     setSelectedPackage={setSelectedPackage}
                  />
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
