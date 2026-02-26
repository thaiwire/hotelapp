'use client'

import { getBookingsByCustomerId, updateBookingStatusById } from '@/actions/bookings'
import type { IBooking } from '@/app/interfaces'
import BookingInfoModal from '@/components/booking-info-modal'
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
import { getDateFormat, getTimeFormat } from '@/helpers'
import { UsersStore, useUsersStore } from '@/store/users-store'
import { Eye, Save } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

function CustomerBookingsPage() {
  const { loggedInUser }: UsersStore = useUsersStore()
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [bookings, setBookings] = useState<IBooking[]>([])
  const [selectedBooking, setSelectedBooking] = useState<IBooking | null>(null)
  const [isBookingInfoOpen, setIsBookingInfoOpen] = useState(false)
  const [statusDraftByBookingId, setStatusDraftByBookingId] = useState<Record<number, string>>({})
  const [updatingBookingId, setUpdatingBookingId] = useState<number | null>(null)

  useEffect(() => {
    const loadBookings = async () => {
      try {
        if (!loggedInUser?.id) {
          setLoading(false)
          return
        }

        const response = await getBookingsByCustomerId(loggedInUser.id)

        if (!response.success) {
          setErrorMessage(response.message || 'Failed to fetch bookings')
          return
        }

        const fetchedBookings = response.bookings || []
        setBookings(fetchedBookings)
        setStatusDraftByBookingId(
          fetchedBookings.reduce<Record<number, string>>((accumulator, booking) => {
            accumulator[booking.id] = booking.status || 'booked'
            return accumulator
          }, {})
        )
      } catch (error: any) {
        setErrorMessage(error.message || 'Failed to fetch bookings')
      } finally {
        setLoading(false)
      }
    }

    loadBookings()
  }, [loggedInUser?.id])

  const handleChangeStatus = async (bookingId: number) => {
    const nextStatus = statusDraftByBookingId[bookingId]
    const currentBooking = bookings.find((booking) => booking.id === bookingId)

    if (!currentBooking || !nextStatus) {
      return
    }

    if (nextStatus === currentBooking.status) {
      return
    }

    try {
      setUpdatingBookingId(bookingId)
      const response = await updateBookingStatusById(bookingId, nextStatus)

      if (!response.success || !response.booking) {
        toast.error(response.message || 'Failed to update booking status')
        return
      }

      setBookings((previousBookings) =>
        previousBookings.map((booking) =>
          booking.id === bookingId ? { ...booking, status: response.booking?.status || booking.status } : booking
        )
      )
      toast.success(response.message || 'Booking status updated successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update booking status')
    } finally {
      setUpdatingBookingId(null)
    }
  }

  return (
    <div className='flex flex-col gap-5'>
      <BookingInfoModal
        open={isBookingInfoOpen}
        onOpenChange={setIsBookingInfoOpen}
        booking={selectedBooking}
      />

      <PageTitle title='My Bookings' />

      {!loggedInUser?.id && <InfoMessage message='Please wait while user details are loading.' />}

      {errorMessage && <InfoMessage message={errorMessage} />}

      {!errorMessage && loggedInUser?.id && (
        <div className='rounded-lg border border-border bg-card p-4'>
          {loading ? (
            <InfoMessage message='Loading bookings...' />
          ) : bookings.length === 0 ? (
            <InfoMessage message='No bookings found yet.' />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hotel</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Booked On</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className='font-medium'>{booking.hotel_name || `Hotel #${booking.hotel_id}`}</TableCell>
                    <TableCell>{booking.room_name || `Room #${booking.room_id}`}</TableCell>
                    <TableCell>{booking.customer_name || `Customer #${booking.customer_id}`}</TableCell>
                    <TableCell>{getDateFormat(booking.start_date)}</TableCell>
                    <TableCell>{getDateFormat(booking.end_date)}</TableCell>
                    <TableCell>${Number(booking.amount || 0)}</TableCell>
                    <TableCell>
                      <span className='inline-flex items-center rounded-full border border-border bg-muted px-2 py-1 text-xs capitalize'>
                        {booking.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {getDateFormat(booking.created_at)}, {getTimeFormat(booking.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center justify-end gap-2'>
                        <Button
                          type='button'
                          variant='outline'
                          size='icon-sm'
                          title='View Booking'
                          onClick={() => {
                            setSelectedBooking(booking)
                            setIsBookingInfoOpen(true)
                          }}
                        >
                          <Eye className='size-4' />
                        </Button>

                        <Select
                          value={statusDraftByBookingId[booking.id] || booking.status || 'booked'}
                          onValueChange={(value) =>
                            setStatusDraftByBookingId((previousValue) => ({
                              ...previousValue,
                              [booking.id]: value,
                            }))
                          }
                        >
                          <SelectTrigger className='w-34'>
                            <SelectValue placeholder='Status' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='booked'>Booked</SelectItem>
                            <SelectItem value='cancelled'>Cancelled</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          type='button'
                          variant='outline'
                          size='icon-sm'
                          title='Save Status'
                          onClick={() => handleChangeStatus(booking.id)}
                          disabled={updatingBookingId === booking.id}
                        >
                          <Save className='size-4' />
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

export default CustomerBookingsPage
