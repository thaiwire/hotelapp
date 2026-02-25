'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import PrivateLayout from './private-layout'

const PRIVATE_ROUTE_PREFIXES = ['/customer', '/hotel_owner', '/admin']

function CustomLayout({children}: {children: React.ReactNode}) {
  const pathname = usePathname()
  const isPrivateRoute = PRIVATE_ROUTE_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  )

  if (!isPrivateRoute) {
    return <>{children}</>
  }

  return <PrivateLayout>{children}</PrivateLayout>
}

export default CustomLayout