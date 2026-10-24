import { createBrowserRouter } from 'react-router'

import { Home } from '@/app/routes/home'
import { Listings } from '@/app/routes/listings'
import { NotFound } from '@/app/routes/not-found'
import { AppLayout } from '@/components/layout/app-layout'
import { Detail } from '@/app/routes/detail'
import { Roommates } from '@/app/routes/roommates'
import { Saved } from '@/app/routes/saved'
import { Post } from '@/app/routes/post'
import { Login } from '@/app/routes/login'
import { Profile } from '@/app/routes/profile'
import { Edit } from '@/app/routes/edit'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/listings', element: <Listings /> },
      { path: '/listings/:id', element: <Detail /> },
      { path: '/listings/:id/edit', element: <Edit /> },
      { path: '/roommates', element: <Roommates /> },
      { path: '/saved', element: <Saved /> },
      { path: '/post', element: <Post /> },
      { path: '/login', element: <Login /> },
      { path: '/profile', element: <Profile /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])
