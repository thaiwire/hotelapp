'use client'

import React, { useEffect, useState } from 'react'
import { BedDouble, CalendarDays, CircleDollarSign, ClipboardList, Hotel, UserRound, UsersRound } from 'lucide-react'

import { getAdminDashboardData } from '@/actions/bookings'
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

function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [cards, setCards] = useState({
    totalUsers: 0,
    totalOwners: 0,
    totalCustomers: 0,
    totalHotels: 0,
    totalRooms: 0,
    totalBookings: 0,
    upcomingBookings: 0,
    totalRevenue: 0,
  })
  const [recentBookings, setRecentBookings] = useState<IBooking[]>([])

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const response = await getAdminDashboardData()
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
  }, [])

  return (
    <div className='space-y-6'>
      <PageTitle title='Dashboard' />

      {errorMessage && <InfoMessage message={errorMessage} />}

      {!errorMessage &&
        (loading ? (
          <InfoMessage message='Loading dashboard data...' />
        ) : (
          <div className='space-y-6'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4'>
              <DashboardStatCard
                title='Total Users'
                value={cards.totalUsers}
                icon={UsersRound}
                borderClassName='border-l-4 border-l-blue-500'
              />
              <DashboardStatCard
                title='Total Owners'
                value={cards.totalOwners}
                icon={UserRound}
                borderClassName='border-l-4 border-l-red-500'
              />
              <DashboardStatCard
                title='Total Customers'
                value={cards.totalCustomers}
                icon={UsersRound}
                borderClassName='border-l-4 border-l-emerald-500'
              />
              <DashboardStatCard
                title='Total Hotels'
                value={cards.totalHotels}
                icon={Hotel}
                borderClassName='border-l-4 border-l-violet-500'
              />
              <DashboardStatCard
                title='Total Rooms'
                value={cards.totalRooms}
                icon={BedDouble}
                borderClassName='border-l-4 border-l-amber-500'
              />
              <DashboardStatCard
                title='Total Booking'
                value={cards.totalBookings}
                icon={ClipboardList}
                borderClassName='border-l-4 border-l-cyan-500'
              />
              <DashboardStatCard
                title='Upcoming Bookings'
                value={cards.upcomingBookings}
                icon={CalendarDays}
                borderClassName='border-l-4 border-l-indigo-500'
              />
              <DashboardStatCard
                title='Total Revenue'
                value={`$${cards.totalRevenue}`}
                icon={CircleDollarSign}
                borderClassName='border-l-4 border-l-teal-500'
              />
            </div>

            <div className='space-y-3'>
              <h2 className='text-5xl font-bold'>Recent Bookings</h2>

              <div className='rounded-lg border border-border bg-card'>
                {recentBookings.length === 0 ? (
                  <InfoMessage message='No bookings found yet.' />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className='px-4 py-3'>Customer</TableHead>
                        <TableHead className='px-4 py-3'>Hotel</TableHead>
                        <TableHead className='px-4 py-3'>Room</TableHead>
                        <TableHead className='px-4 py-3'>Check-in</TableHead>
                        <TableHead className='px-4 py-3'>Check-out</TableHead>
                        <TableHead className='px-4 py-3'>Amount</TableHead>
                        <TableHead className='px-4 py-3'>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentBookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell className='px-4 py-3'>
                            {booking.customer_name || `Customer #${booking.customer_id}`}
                          </TableCell>
                          <TableCell className='px-4 py-3'>
                            {booking.hotel_name || `Hotel #${booking.hotel_id}`}
                          </TableCell>
                          <TableCell className='px-4 py-3'>
                            {booking.room_name || `Room #${booking.room_id}`}
                          </TableCell>
                          <TableCell className='px-4 py-3'>{getDateFormat(booking.start_date)}</TableCell>
                          <TableCell className='px-4 py-3'>{getDateFormat(booking.end_date)}</TableCell>
                          <TableCell className='px-4 py-3'>${Number(booking.amount || 0)}</TableCell>
                          <TableCell className='px-4 py-3'>
                            <span
                              className={
                                booking.status === 'cancelled'
                                  ? 'inline-flex rounded-full bg-red-100 px-4 py-1 text-sm font-medium text-red-700'
                                  : 'inline-flex rounded-full bg-emerald-100 px-4 py-1 text-sm font-medium text-emerald-700'
                              }
                            >
                              {booking.status === 'cancelled' ? 'Cancelled' : 'Confirmed'}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          </div>
        ))}
    </div>
  )
}

export default AdminDashboard