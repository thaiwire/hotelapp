import React from 'react'
import { LucideIcon } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type DashboardStatCardProps = {
  title: string
  value: string | number
  icon: LucideIcon
  borderClassName?: string
  valueClassName?: string
  iconClassName?: string
}

function DashboardStatCard({
  title,
  value,
  icon: Icon,
  borderClassName,
  valueClassName,
  iconClassName,
}: DashboardStatCardProps) {
  return (
    <Card className={cn('border py-2', borderClassName)}>
      <CardHeader className='flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-4xl font-medium text-muted-foreground'>{title}</CardTitle>
        <Icon className={cn('size-9 text-muted-foreground', iconClassName)} />
      </CardHeader>
      <CardContent>
        <p className={cn('text-6xl font-bold', valueClassName)}>{value}</p>
      </CardContent>
    </Card>
  )
}

export default DashboardStatCard
