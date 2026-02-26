'use client'

import type { IBooking } from '@/app/interfaces'
import { getDateFormat } from '@/helpers'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CalendarDays, CircleDollarSign, CircleDot, CreditCard, Hash, Hotel, UserRound } from 'lucide-react'
import React from 'react'

type BookingInfoModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  booking: IBooking | null
}

function BookingInfoModal({ open, onOpenChange, booking }: BookingInfoModalProps) {
  if (!booking) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='min-w-125 max-h-screen overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Booking #{booking.id}</DialogTitle>
          <DialogDescription>Booking details</DialogDescription>
        </DialogHeader>

        <div className='grid gap-3 text-sm'>
          <div>
            <p className='text-muted-foreground flex items-center gap-2'>
              <Hash className='size-4' />
              Booking ID
            </p>
            <p className='font-medium'>{booking.id}</p>
          </div>

          <div>
            <p className='text-muted-foreground flex items-center gap-2'>
              <Hotel className='size-4' />
              Hotel / Room
            </p>
            <p className='font-medium'>
              {booking.hotel_name || `Hotel #${booking.hotel_id}`} / {booking.room_name || `Room #${booking.room_id}`}
            </p>
          </div>

          <div>
            <p className='text-muted-foreground flex items-center gap-2'>
              <UserRound className='size-4' />
              Customer
            </p>
            <p className='font-medium'>{booking.customer_name || `Customer #${booking.customer_id}`}</p>
          </div>

          <div>
            <p className='text-muted-foreground flex items-center gap-2'>
              <CalendarDays className='size-4' />
              Stay Dates
            </p>
            <p className='font-medium'>
              {getDateFormat(booking.start_date)} - {getDateFormat(booking.end_date)}
            </p>
          </div>

          <div>
            <p className='text-muted-foreground flex items-center gap-2'>
              <CircleDollarSign className='size-4' />
              Amount
            </p>
            <p className='font-medium'>${Number(booking.amount || 0)}</p>
          </div>

          <div>
            <p className='text-muted-foreground flex items-center gap-2'>
              <CreditCard className='size-4' />
              Payment ID
            </p>
            <p className='font-medium'>{booking.payment_id || 'N/A'}</p>
          </div>

          <div>
            <p className='text-muted-foreground flex items-center gap-2'>
              <CircleDot className='size-4' />
              Status
            </p>
            <p className='font-medium capitalize'>{booking.status}</p>
          </div>
        </div>

        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  )
}

export default BookingInfoModal
