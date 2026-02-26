"use client"

import { getAllHotels } from '@/actions/hotels'
import { getActiveRooms } from '@/actions/rooms'
import { roomTypes, roomsSortOptions } from '@/app/constants'
import type { IHotel, IRoom } from '@/app/interfaces'
import InfoMessage from '@/components/info-message'
import PageTitle from '@/components/page-title'
import RoomBookingCard from '@/components/room-booking-card'
import RoomFilters, { type RoomFiltersValue } from '@/components/room-filters'
import React, { useEffect, useMemo, useState } from 'react'

function BookRoomPage() {
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [rooms, setRooms] = useState<IRoom[]>([])
  const [hotelsMap, setHotelsMap] = useState<Record<number, string>>({})
  const [appliedFilters, setAppliedFilters] = useState<RoomFiltersValue>({
    roomType: '',
    sortBy: '',
  })

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const [roomsResponse, hotelsResponse] = await Promise.all([
          getActiveRooms(),
          getAllHotels(),
        ])

        if (!roomsResponse.success) {
          setErrorMessage(roomsResponse.message || 'Failed to fetch active rooms')
          return
        }

        if (!hotelsResponse.success) {
          setErrorMessage(hotelsResponse.message || 'Failed to fetch hotels')
          return
        }

        const nextHotelsMap = (hotelsResponse.hotels || []).reduce(
          (accumulator: Record<number, string>, hotel: IHotel) => {
            accumulator[hotel.id] = hotel.name
            return accumulator
          },
          {}
        )

        setHotelsMap(nextHotelsMap)
        setRooms(roomsResponse.rooms || [])
      } catch (error: any) {
        setErrorMessage(error.message || 'Failed to fetch active rooms')
      } finally {
        setLoading(false)
      }
    }

    loadRooms()
  }, [])

  const displayedRooms = useMemo(() => {
    let nextRooms = [...rooms]

    if (appliedFilters.roomType) {
      const roomType = appliedFilters.roomType.toLowerCase()
      nextRooms = nextRooms.filter((room) => room.type?.toLowerCase() === roomType)
    }

    if (appliedFilters.sortBy) {
      nextRooms.sort((roomA, roomB) => {
        switch (appliedFilters.sortBy) {
          case 'price_asc':
            return roomA.rent_per_day - roomB.rent_per_day
          case 'price_desc':
            return roomB.rent_per_day - roomA.rent_per_day
          case 'created_at_asc':
            return new Date(roomA.created_at).getTime() - new Date(roomB.created_at).getTime()
          case 'created_at_desc':
            return new Date(roomB.created_at).getTime() - new Date(roomA.created_at).getTime()
          default:
            return 0
        }
      })
    }

    return nextRooms
  }, [rooms, appliedFilters])

  const handleApplyFilters = (filters: RoomFiltersValue) => {
    setAppliedFilters(filters)
  }

  const handleClearFilters = () => {
    setAppliedFilters({ roomType: '', sortBy: '' })
  }

  return (
    <div className='flex flex-col gap-5'>
      <PageTitle title="Book a Room" />

      {errorMessage && <InfoMessage message={errorMessage} />}

      {!errorMessage && loading && <InfoMessage message='Loading available rooms...' />}

      {!errorMessage && !loading && rooms.length === 0 && (
        <InfoMessage message='No active rooms available right now.' />
      )}

      {!errorMessage && !loading && rooms.length > 0 && (
        <div className='flex flex-col gap-5'>
          <RoomFilters
            roomTypeOptions={roomTypes}
            sortOptions={roomsSortOptions}
            onApply={handleApplyFilters}
            onClear={handleClearFilters}
          />

          {displayedRooms.length === 0 ? (
            <InfoMessage message='No rooms found for selected filters.' />
          ) : (
            <div className='grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3'>
              {displayedRooms.map((room) => (
                <RoomBookingCard
                  key={room.id}
                  room={room}
                  hotelName={hotelsMap[room.hotel_id] || `Hotel #${room.hotel_id}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default BookRoomPage