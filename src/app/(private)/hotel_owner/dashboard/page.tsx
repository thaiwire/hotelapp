'use client'

import React, { useEffect, useState } from 'react'
import { Building2, CircleDollarSign, Hotel, UsersRound } from 'lucide-react'

import { getOwnerDashboardData } from '@/actions/bookings'
import type { IBooking } from '@/app/interfaces'
import DashboardStatCard from '@/components/dashboard-stat-card'
import InfoMessage from '@/components/info-message'
import PageTitle from '@/components/page-title'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getDateFormat } from '@/helpers'
import { UsersStore, useUsersStore } from '@/store/users-store'

function OwnerDashboardPage() {
  const { loggedInUser }: UsersStore = useUsersStore()

  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [cards, setCards] = useState({
    totalHotels: 0,
    totalRooms: 0,
    totalBookings: 0,
    totalRevenue: 0,
  })
  const [recentBookings, setRecentBookings] = useState<IBooking[]>([])

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        if (!loggedInUser?.id) {
          setLoading(false)
          return
        }

        const response = await getOwnerDashboardData(loggedInUser.id)

        if (!response.success) {
          setErrorMessage(response.message || 'Failed to fetch dashboard data')
          return
        }

        setCards(response.cards)
        setRecentBookings(response.recentBookings || [])
      } catch (error: any) {
        setErrorMessage(error.message || 'Failed to fetch dashboard data')
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [loggedInUser?.id])

  return (
    <div className='space-y-6'>
      <PageTitle title='Dashboard' />

      {!loggedInUser?.id && <InfoMessage message='Please wait while user details are loading.' />}

      {errorMessage && <InfoMessage message={errorMessage} />}

      {!errorMessage && loggedInUser?.id && (
        <>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4'>
            <DashboardStatCard
              title='Total Hotels'
              value={cards.totalHotels}
              icon={Hotel}
              borderClassName='border-sky-300'
              valueClassName='text-sky-700'
            />
            <DashboardStatCard
              title='Total Rooms'
              value={cards.totalRooms}
              icon={Building2}
              borderClassName='border-emerald-300'
              valueClassName='text-emerald-700'
            />
            <DashboardStatCard
              title='Total Bookings'
              value={cards.totalBookings}
              icon={UsersRound}
              borderClassName='border-violet-300'
              valueClassName='text-violet-700'
            />
            <DashboardStatCard
              title='Total Revenue'
              value={`$${cards.totalRevenue}`}
              icon={CircleDollarSign}
              borderClassName='border-amber-300'
              valueClassName='text-amber-700'
            />
          </div>

          <div className='space-y-3'>
            <h2 className='text-4xl font-bold'>Recent Bookings</h2>

            <div className='rounded-lg border border-border bg-card p-4'>
              {loading ? (
                <InfoMessage message='Loading dashboard data...' />
              ) : recentBookings.length === 0 ? (
                <InfoMessage message='No bookings found yet.' />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Hotel</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Check-in</TableHead>
                      <TableHead>Check-out</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>{booking.customer_name || `Customer #${booking.customer_id}`}</TableCell>
                        <TableCell>{booking.hotel_name || `Hotel #${booking.hotel_id}`}</TableCell>
                        <TableCell>{booking.room_name || `Room #${booking.room_id}`}</TableCell>
                        <TableCell>{getDateFormat(booking.start_date)}</TableCell>
                        <TableCell>{getDateFormat(booking.end_date)}</TableCell>
                        <TableCell>${Number(booking.amount || 0)}</TableCell>
                        <TableCell className='capitalize'>{booking.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default OwnerDashboardPage