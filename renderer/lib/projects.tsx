import React from 'react'

interface IProject {
   path: string
}

interface IProjectsState {
   projects: IProject[]
   selectedProject: IProject | null
}

const initialState: IProjectsState = {
   projects: [],
   selectedProject: null,
}

const Context = React.createContext<IProjectsState>(initialState)

const reducers = (state, action) => {
   switch (action.type) {
      case 'ADD_PROJECT': {
         const projects = [...state.projects]
         const index = projects.findIndex(project => project.path === action.payload.path)
         if (index === -1) {
            projects.push(action.payload)
            return { ...state, projects }
         }
         return state
      }
      case 'SELECT_PROJECT': {
         return { ...state, selectedProject: action.payload }
      }
      default:
         return state
   }
}

export const ProjectProvider = ({ children }) => {
   const [state, dispatch] = React.useReducer(reducers, initialState)

   return <Context.Provider value={{ ...state, dispatch }}>{children}</Context.Provider>
}

export const useProjects = () => {
   const context = React.useContext(Context)
   if (context === undefined) {
      throw new Error('useProjects must be used within a ProjectProvider')
   }
   return context
}
