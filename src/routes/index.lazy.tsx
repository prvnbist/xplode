import { Title } from '@mantine/core'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/')({
   component: Index,
})

function Index() {
   return (
      <div>
         <Title order={2}>Hello World!</Title>
      </div>
   )
}
