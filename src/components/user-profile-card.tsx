import React from 'react'
import {
  BadgeCheck,
  CalendarClock,
  Fingerprint,
  KeyRound,
  Mail,
  ShieldUser,
  UserRound,
} from 'lucide-react'

import type { IUser } from '@/app/interfaces'
import { getDateFormat } from '@/helpers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type UserProfileCardProps = {
  user: IUser
}

const FIELD_CONFIG: {
  key: keyof IUser
  label: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  { key: 'id', label: 'User ID', icon: Fingerprint },
  { key: 'name', label: 'Name', icon: UserRound },
  { key: 'email', label: 'Email', icon: Mail },
  { key: 'role', label: 'Role', icon: ShieldUser },
  { key: 'status', label: 'Status', icon: BadgeCheck },
  { key: 'created_at', label: 'Created At', icon: CalendarClock },
  { key: 'password', label: 'Password', icon: KeyRound },
]

const getValue = (key: keyof IUser, value: IUser[keyof IUser]) => {
  if (key === 'created_at') {
    return getDateFormat(value as string, 'DD MMM YYYY, hh:mm A')
  }

  if (key === 'password') {
    if (!value) {
      return 'Not set'
    }

    return '••••••••'
  }

  if (typeof value === 'string' && value.trim() === '') {
    return 'N/A'
  }

  return value ?? 'N/A'
}

function UserProfileCard({ user }: UserProfileCardProps) {
  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-xl'>
          <UserRound className='size-5' />
          User Profile
        </CardTitle>
      </CardHeader>

      <CardContent className='grid gap-4 sm:grid-cols-2'>
        {FIELD_CONFIG.map((field) => {
          const Icon = field.icon
          const value = getValue(field.key, user[field.key])

          return (
            <div key={field.key} className='rounded-lg border p-4'>
              <div className='mb-2 flex items-center gap-2 text-sm text-muted-foreground'>
                <Icon className='size-4' />
                <span>{field.label}</span>
              </div>

              <div
                className={
                  field.key === 'role' || field.key === 'status'
                    ? 'inline-flex rounded-full border bg-muted px-3 py-1 text-sm font-medium capitalize'
                    : 'break-all text-base font-semibold'
                }
              >
                {value}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

export default UserProfileCard
