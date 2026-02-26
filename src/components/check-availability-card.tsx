import React from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Search } from 'lucide-react'

interface CheckAvailabilityCardProps {
  checkInDate: string
  checkOutDate: string
  onCheckInDateChange: (value: string) => void
  onCheckOutDateChange: (value: string) => void
  onCheckAvailability: () => void
  onBookRoom?: () => void
  isCheckingAvailability?: boolean
  isBookingRoom?: boolean
  isCheckAvailabilityEnabled?: boolean
  isBookRoomEnabled?: boolean
  availabilityStatus?: 'success' | 'error' | null
  availabilityMessage?: string
  totalPrice?: number | null
}

function CheckAvailabilityCard({
  checkInDate,
  checkOutDate,
  onCheckInDateChange,
  onCheckOutDateChange,
  onCheckAvailability,
  onBookRoom,
  isCheckingAvailability = false,
  isBookingRoom = false,
  isCheckAvailabilityEnabled = false,
  isBookRoomEnabled = false,
  availabilityStatus = null,
  availabilityMessage = '',
  totalPrice = null,
}: CheckAvailabilityCardProps) {
  return (
    <div>
      <h3 className='text-4xl font-bold'>Check Availability</h3>

      <div className='mt-6 space-y-5'>
        <div>
          <p className='text-xl text-foreground'>Check-in Date</p>
          <Input
            type='date'
            value={checkInDate}
            onChange={(event) => onCheckInDateChange(event.target.value)}
            className='mt-2 h-12 rounded-md text-xl'
          />
        </div>

        <div>
          <p className='text-xl text-foreground'>Check-out Date</p>
          <Input
            type='date'
            value={checkOutDate}
            min={checkInDate || undefined}
            onChange={(event) => onCheckOutDateChange(event.target.value)}
            className='mt-2 h-12 rounded-md text-xl'
          />

          {availabilityStatus && availabilityMessage && (
            <div
              className={cn(
                'mt-3 rounded-md border p-3 text-sm',
                availabilityStatus === 'success'
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                  : 'border-red-300 bg-red-50 text-red-700'
              )}
            >
              <p>{availabilityMessage}</p>
              {availabilityStatus === 'success' && totalPrice !== null && (
                <p className='mt-1 font-semibold'>Current total price: ${totalPrice}</p>
              )}
            </div>
          )}
        </div>
      </div>

      <Button
        type='button'
        size='lg'
        onClick={onCheckAvailability}
        disabled={!isCheckAvailabilityEnabled || isCheckingAvailability}
        className='mt-7 h-13 w-full bg-primary/65 text-2xl text-primary-foreground hover:bg-primary/70'
      >
        <Search className='size-5' />
        {isCheckingAvailability ? 'Checking...' : 'Check Availability'}
      </Button>

      <Button
        type='button'
        size='lg'
        onClick={onBookRoom}
        disabled={!isBookRoomEnabled || isBookingRoom}
        className='mt-4 h-13 w-full bg-primary/65 text-2xl text-primary-foreground hover:bg-primary/70'
      >
        {isBookingRoom ? 'Booking...' : 'Book This Room'}
      </Button>

      <p className='mt-4 text-center text-lg text-muted-foreground'>Complete booking on the next step</p>
    </div>
  )
}

export default CheckAvailabilityCard