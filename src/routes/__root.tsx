import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { createRootRoute, Outlet } from '@tanstack/react-router'

export const Route = createRootRoute({
   component: () => (
      <>
         <Outlet />
         <TanStackRouterDevtools />
      </>
   ),
})
