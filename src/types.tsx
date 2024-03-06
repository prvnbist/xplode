export interface TProject {
   id?: number
   path: string
}

export type DependencyType = 'dependency' | 'devDependency' | 'peerDependency'

export type TDependency = {
   name: string
   version: string
   type: DependencyType
}
