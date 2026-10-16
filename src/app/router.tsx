import { createBrowserRouter } from 'react-router'

import { NijePronadjeno } from '@/app/routes/nije-pronadjeno'
import { Oglasi } from '@/app/routes/oglasi'
import { Pocetna } from '@/app/routes/pocetna'
import { AppLayout } from '@/components/layout/app-layout'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <Pocetna /> },
      { path: '/oglasi', element: <Oglasi /> },
      { path: '*', element: <NijePronadjeno /> },
    ],
  },
])
