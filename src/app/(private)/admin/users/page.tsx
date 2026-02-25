'use client'

import React, { useEffect, useState } from 'react'
import { getAllUsers, updateUserRoleById } from '@/actions/users'
import type { IUser } from '@/app/interfaces'
import InfoMessage from '@/components/info-message'
import PageTitle from '@/components/page-title'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import toast from 'react-hot-toast'

const USER_ROLE_OPTIONS: IUser['role'][] = ['customer', 'hotel_owner', 'admin']

function AdminUsersPage() {
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null)
  const [users, setUsers] = useState<IUser[]>([])

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await getAllUsers()

        if (!response.success) {
          setErrorMessage(response.message || 'Failed to fetch users')
          return
        }

        setUsers(response.users || [])
      } catch (error: any) {
        setErrorMessage(error.message || 'Failed to fetch users')
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [])

  const handleRoleChange = (userId: number, role: IUser['role']) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId
          ? {
              ...user,
              role,
            }
          : user
      )
    )
  }

  const handleUpdateRole = async (user: IUser) => {
    try {
      setUpdatingUserId(user.id)
      const response = await updateUserRoleById(user.id, user.role)

      if (!response.success) {
        toast.error(response.message || 'Failed to update user role')
        return
      }

      toast.success(response.message || 'User role updated successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user role')
    } finally {
      setUpdatingUserId(null)
    }
  }

  return (
    <div className='flex flex-col gap-5'>
      <div className='flex items-center justify-between'>
        <PageTitle title='Users' />
      </div>

      {errorMessage && <InfoMessage message={errorMessage} />}

      {!errorMessage && (
        <div className='rounded-lg border border-border bg-card p-4 shadow-sm'>
          {loading ? (
            <InfoMessage message='Loading users...' />
          ) : users.length === 0 ? (
            <InfoMessage message='No users found.' />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className='font-medium'>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <span className='inline-flex items-center rounded-full border border-border bg-muted px-2 py-1 text-xs capitalize'>
                        {user.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(value) => handleRoleChange(user.id, value as IUser['role'])}
                      >
                        <SelectTrigger className='w-40 capitalize'>
                          <SelectValue placeholder='Select role' />
                        </SelectTrigger>
                        <SelectContent>
                          {USER_ROLE_OPTIONS.map((roleOption) => (
                            <SelectItem key={roleOption} value={roleOption} className='capitalize'>
                              {roleOption.replace('_', ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center justify-end'>
                        <Button
                          type='button'
                          size='sm'
                          onClick={() => handleUpdateRole(user)}
                          disabled={updatingUserId === user.id}
                        >
                          {updatingUserId === user.id ? 'Updating...' : 'Update'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminUsersPage
