import { createBrowserRouter } from 'react-router'

import { AppLayout } from '@/components/layout/app-layout'
import { NijePronadjeno } from '@/pages/nije-pronadjeno'
import { Oglasi } from '@/pages/oglasi'
import { Pocetna } from '@/pages/pocetna'

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
