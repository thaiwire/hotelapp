"use client"

import { checkAvailabilityOfRoom, createBooking } from '@/actions/bookings'
import { getHotelById } from '@/actions/hotels'
import { getRoomById } from '@/actions/rooms'
import type { IRoom } from '@/app/interfaces'
import CheckAvailabilityCard from '@/components/check-availability-card'
import InfoMessage from '@/components/info-message'
import StripePaymentModal from '@/components/stripe-payment-modal'
import { useUsersStore } from '@/store/users-store'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Star } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

const getAmenityLabel = (value: string) => {
  return value
    .replace(/[_-]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

function RoomIDPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const roomId = Number(params?.id)

  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [room, setRoom] = useState<IRoom | null>(null)
  const [hotelName, setHotelName] = useState('Unknown Hotel')
  const [checkInDate, setCheckInDate] = useState('')
  const [checkOutDate, setCheckOutDate] = useState('')
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)
  const [isBookingRoom, setIsBookingRoom] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isRoomAvailable, setIsRoomAvailable] = useState(false)
  const [availabilityStatus, setAvailabilityStatus] = useState<'success' | 'error' | null>(null)
  const [availabilityMessage, setAvailabilityMessage] = useState('')
  const [totalPrice, setTotalPrice] = useState<number | null>(null)
  const { loggedInUser } = useUsersStore()

  useEffect(() => {
    const loadRoomDetails = async () => {
      try {
        if (!roomId || Number.isNaN(roomId)) {
          setErrorMessage('Invalid room id')
          return
        }

        const roomResponse = await getRoomById(roomId)
        if (!roomResponse.success || !roomResponse.room) {
          setErrorMessage(roomResponse.message || 'Room not found')
          return
        }

        const fetchedRoom = roomResponse.room
        setRoom(fetchedRoom)

        const hotelResponse = await getHotelById(fetchedRoom.hotel_id)
        if (hotelResponse.success && hotelResponse.hotel) {
          setHotelName(hotelResponse.hotel.name)
        }
      } catch (error: any) {
        setErrorMessage(error.message || 'Failed to load room details')
      } finally {
        setLoading(false)
      }
    }

    loadRoomDetails()
  }, [roomId])

  const imageUrl = useMemo(() => {
    if (!room?.images || room.images.length === 0) {
      return ''
    }
    return room.images[0]
  }, [room])

  const isDateRangeValid = useMemo(() => {
    if (!checkInDate || !checkOutDate) {
      return false
    }

    const startDate = new Date(`${checkInDate}T00:00:00`)
    const endDate = new Date(`${checkOutDate}T00:00:00`)

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return false
    }

    return endDate.getTime() > startDate.getTime()
  }, [checkInDate, checkOutDate])

  const resetAvailabilityState = () => {
    setIsRoomAvailable(false)
    setAvailabilityStatus(null)
    setAvailabilityMessage('')
    setTotalPrice(null)
  }

  const handleChangeCheckInDate = (value: string) => {
    setCheckInDate(value)
    resetAvailabilityState()
  }

  const handleChangeCheckOutDate = (value: string) => {
    setCheckOutDate(value)
    resetAvailabilityState()
  }

  const buildBookedDates = (start: string, end: string) => {
    const bookedDates: string[] = []
    const currentDate = new Date(`${start}T00:00:00`)
    const endDate = new Date(`${end}T00:00:00`)

    while (currentDate.getTime() < endDate.getTime()) {
      bookedDates.push(currentDate.toISOString().split('T')[0])
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return bookedDates
  }

  const handleCheckAvailability = async () => {
    if (!room) {
      return
    }

    if (!isDateRangeValid) {
      setIsRoomAvailable(false)
      setAvailabilityStatus('error')
      setAvailabilityMessage('Please select a valid check-in and check-out date.')
      setTotalPrice(null)
      return
    }

    try {
      setIsCheckingAvailability(true)
      setIsRoomAvailable(false)
      setAvailabilityStatus(null)
      setAvailabilityMessage('')
      setTotalPrice(null)

      const bookedDates = buildBookedDates(checkInDate, checkOutDate)
      const response = await checkAvailabilityOfRoom(room.id, bookedDates)

      if (response.success) {
        const startDate = new Date(`${checkInDate}T00:00:00`)
        const endDate = new Date(`${checkOutDate}T00:00:00`)
        const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        const calculatedTotalPrice = nights * room.rent_per_day

        setIsRoomAvailable(true)
        setAvailabilityStatus('success')
        setAvailabilityMessage(response.message || 'Room is available for selected dates.')
        setTotalPrice(calculatedTotalPrice)
        return
      }

      setIsRoomAvailable(false)
      setAvailabilityStatus('error')
      setAvailabilityMessage(response.message || 'Room is not available for selected dates.')
      setTotalPrice(null)
    } catch (error: any) {
      setIsRoomAvailable(false)
      setAvailabilityStatus('error')
      setAvailabilityMessage(error.message || 'Failed to check availability')
      setTotalPrice(null)
    } finally {
      setIsCheckingAvailability(false)
    }
  }

  const handleBookRoom = async () => {
    if (!room) {
      return
    }

    if (!loggedInUser?.id) {
      toast.error('Please login again to continue')
      return
    }

    if (!isDateRangeValid || !isRoomAvailable || totalPrice === null) {
      toast.error('Please check room availability before booking')
      return
    }

    setIsPaymentModalOpen(true)
  }

  const handlePaymentSuccess = async (paymentId: string) => {
    if (!room) {
      throw new Error('Room not found')
    }

    if (!loggedInUser?.id) {
      throw new Error('Please login again to continue')
    }

    if (!isDateRangeValid || !isRoomAvailable || totalPrice === null) {
      throw new Error('Please check room availability before booking')
    }

    try {
      setIsBookingRoom(true)

      const bookedDates = buildBookedDates(checkInDate, checkOutDate)
      const response = await createBooking({
        room_id: room.id,
        hotel_id: room.hotel_id,
        owner_id: room.owner_id,
        customer_id: loggedInUser.id,
        booked_dates: bookedDates,
        start_date: checkInDate,
        end_date: checkOutDate,
        amount: totalPrice,
        payment_id: paymentId,
        status: 'booked',
      })

      if (!response.success) {
        setIsRoomAvailable(false)
        setAvailabilityStatus('error')
        setAvailabilityMessage(response.message || 'Failed to book room')
        toast.error(response.message || 'Failed to book room')
        return
      }

      setAvailabilityStatus('success')
      setAvailabilityMessage('Booking created successfully.')
      toast.success(response.message || 'Room booked successfully')
      setIsPaymentModalOpen(false)
      router.push('/customer/bookings')
    } catch (error: any) {
      setIsPaymentModalOpen(true)
      toast.error(error.message || 'Failed to book room')
      throw new Error(error.message || 'Failed to book room')
    } finally {
      setIsBookingRoom(false)
    }
  }

  if (loading) {
    return <InfoMessage message='Loading room details...' />
  }

  if (errorMessage || !room) {
    return <InfoMessage message={errorMessage || 'Room not found'} />
  }

  const amenities = Array.isArray(room.amenities) ? room.amenities : []
  const statusText = room.status?.toLowerCase() === 'available' ? 'ACTIVE' : room.status?.toUpperCase()

  return (
    <div className='space-y-4'>
      <StripePaymentModal
        open={isPaymentModalOpen}
        onOpenChange={setIsPaymentModalOpen}
        amount={Number(totalPrice || 0)}
        isBookingRoom={isBookingRoom}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <Button asChild variant='ghost' size='sm' className='gap-2'>
        <Link href='/customer/book-room'>
          <ArrowLeft className='size-10' />
          Back to Rooms
        </Link>
      </Button>

      <div className='grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr]'>
        <div className='space-y-6'>
        <div className='overflow-hidden rounded-xl border border-border bg-card'>
          <div className='h-105 w-full bg-muted'>
            {imageUrl ? (
              <img src={imageUrl} alt={room.name} className='h-full w-full object-cover' />
            ) : (
              <div className='flex h-full items-center justify-center text-sm text-muted-foreground'>
                No image available
              </div>
            )}
          </div>
        </div>

        <div className='rounded-xl border border-border bg-card p-7'>
          <h2 className='text-4xl font-bold leading-tight'>About this room</h2>
          <p className='mt-5 text-2xl leading-relaxed text-muted-foreground'>{room.description}</p>
        </div>

        <div className='rounded-xl border border-border bg-card p-7'>
          <h2 className='text-4xl font-bold leading-tight'>Amenities</h2>

          {amenities.length === 0 ? (
            <p className='mt-5 text-xl text-muted-foreground'>No amenities listed for this room.</p>
          ) : (
            <div className='mt-6 flex flex-wrap items-center gap-x-10 gap-y-5'>
              {amenities.map((amenity) => (
                <div key={amenity} className='flex items-center gap-3'>
                  <span className='flex size-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600'>
                    <Star className='size-5' />
                  </span>
                  <p className='text-3xl'>{getAmenityLabel(amenity)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

        <div className='h-fit rounded-xl border border-border bg-card p-7 xl:sticky xl:top-6'>
          <div className='space-y-6'>
          <div>
            <p className='text-xl text-muted-foreground'>Hotel</p>
            <p className='mt-2 text-4xl font-bold'>{hotelName}</p>
          </div>

          <hr className='border-border' />

          <div>
            <p className='text-xl text-muted-foreground'>Room Type</p>
            <p className='mt-2 text-4xl font-bold'>{room.type}</p>
          </div>

          <hr className='border-border' />

          <div>
            <p className='text-xl text-muted-foreground'>Price</p>
            <p className='mt-2 text-5xl font-bold text-emerald-600'>
              ${room.rent_per_day}
              <span className='text-3xl font-semibold text-muted-foreground'>/night</span>
            </p>
          </div>

          <hr className='border-border' />

          <div>
            <p className='text-xl text-muted-foreground'>Status</p>
            <span className='mt-3 inline-flex rounded-full bg-emerald-100 px-4 py-1 text-lg font-semibold text-emerald-700'>
              {statusText}
            </span>
          </div>

          <hr className='border-border' />

            <CheckAvailabilityCard
              checkInDate={checkInDate}
              checkOutDate={checkOutDate}
              onCheckInDateChange={handleChangeCheckInDate}
              onCheckOutDateChange={handleChangeCheckOutDate}
              onCheckAvailability={handleCheckAvailability}
              onBookRoom={handleBookRoom}
              isCheckingAvailability={isCheckingAvailability}
              isBookingRoom={isBookingRoom}
              isCheckAvailabilityEnabled={isDateRangeValid}
              isBookRoomEnabled={isRoomAvailable}
              availabilityStatus={availabilityStatus}
              availabilityMessage={availabilityMessage}
              totalPrice={totalPrice}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoomIDPage