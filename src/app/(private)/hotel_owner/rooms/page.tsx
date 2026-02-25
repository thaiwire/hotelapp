'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { deleteRoomById, getRoomsByOwnerId } from '@/actions/rooms'
import { getHotelsByOwnerId } from '@/actions/hotels'
import InfoMessage from '@/components/info-message'
import PageTitle from '@/components/page-title'
import RoomInfoModal from '@/components/room-info-modal'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getDateFormat, getTimeFormat } from '@/helpers'
import { cn } from '@/lib/utils'
import { UsersStore, useUsersStore } from '@/store/users-store'
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import type { IHotel, IRoom } from '@/app/interfaces'
import toast from 'react-hot-toast'

function RoomsOwnerPage() {
  const { loggedInUser }: UsersStore = useUsersStore()
  const [loading, setLoading] = useState(true)
  const [deletingRoomId, setDeletingRoomId] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [rooms, setRooms] = useState<IRoom[]>([])
  const [hotels, setHotels] = useState<IHotel[]>([])
  const [selectedRoom, setSelectedRoom] = useState<IRoom | null>(null)
  const [isRoomInfoOpen, setIsRoomInfoOpen] = useState(false)

  const hotelsMap = useMemo(() => {
    return hotels.reduce((accumulator, hotel) => {
      accumulator[hotel.id] = hotel.name
      return accumulator
    }, {} as Record<number, string>)
  }, [hotels])

  const handleDeleteRoom = async (roomId: number) => {
    const confirmed = window.confirm('Are you sure you want to delete this room?')
    if (!confirmed) {
      return
    }

    try {
      setDeletingRoomId(roomId)
      const response = await deleteRoomById(roomId)

      if (!response.success) {
        toast.error(response.message || 'Failed to delete room')
        return
      }

      setRooms((prevRooms) => prevRooms.filter((room) => room.id !== roomId))
      toast.success(response.message || 'Room deleted successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete room')
    } finally {
      setDeletingRoomId(null)
    }
  }

  useEffect(() => {
    const loadRoomsAndHotels = async () => {
      try {
        if (!loggedInUser?.id) {
          setLoading(false)
          return
        }

        const [roomsResponse, hotelsResponse] = await Promise.all([
          getRoomsByOwnerId(loggedInUser.id),
          getHotelsByOwnerId(loggedInUser.id),
        ])

        if (!roomsResponse.success) {
          setErrorMessage(roomsResponse.message || 'Failed to fetch rooms')
          return
        }

        if (!hotelsResponse.success) {
          setErrorMessage(hotelsResponse.message || 'Failed to fetch hotels')
          return
        }

        setRooms(roomsResponse.rooms || [])
        setHotels(hotelsResponse.hotels || [])
      } catch (error: any) {
        setErrorMessage(error.message || 'Failed to fetch rooms')
      } finally {
        setLoading(false)
      }
    }

    loadRoomsAndHotels()
  }, [loggedInUser?.id])

  return (
    <div className='flex flex-col gap-5'>
      <RoomInfoModal
        open={isRoomInfoOpen}
        onOpenChange={setIsRoomInfoOpen}
        room={selectedRoom}
        hotelName={selectedRoom ? hotelsMap[selectedRoom.hotel_id] : undefined}
        createdOn={
          selectedRoom
            ? `${getDateFormat(selectedRoom.created_at, 'MMM DD, YYYY')} ${getTimeFormat(
                selectedRoom.created_at,
                'hh:mm A'
              )}`
            : undefined
        }
      />

      <div className='flex items-center justify-between'>
        <PageTitle title='My Rooms' />
        <Button asChild>
          <Link href='/hotel_owner/rooms/add' className='flex items-center gap-2'>
            <Plus className='size-4' />
            Add New Room
          </Link>
        </Button>
      </div>

      {!loggedInUser?.id && <InfoMessage message='Please wait while user details are loading.' />}

      {errorMessage && <InfoMessage message={errorMessage} />}

      {!errorMessage && loggedInUser?.id && (
        <div className='rounded-lg border border-border bg-card p-4 shadow-sm'>
          {loading ? (
            <InfoMessage message='Loading rooms...' />
          ) : rooms.length === 0 ? (
            <InfoMessage message='No rooms found. Add your first room to get started.' />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room Name</TableHead>
                  <TableHead>Hotel</TableHead>
                  <TableHead>Rent per Day</TableHead>
                  <TableHead>Amenities</TableHead>
                  <TableHead>Created On</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell className='font-medium'>{room.name}</TableCell>
                    <TableCell>{hotelsMap[room.hotel_id] || `#${room.hotel_id}`}</TableCell>
                    <TableCell>${room.rent_per_day}</TableCell>
                    <TableCell className='capitalize'>
                      {room.amenities?.length ? room.amenities.slice(0, 2).join(', ') : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {getDateFormat(room.created_at, 'MMM DD, YYYY')} {getTimeFormat(room.created_at, 'hh:mm A')}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'inline-flex items-center rounded-sm border px-3 py-1 text-xs font-medium uppercase',
                          room.status === 'available' &&
                            'border-emerald-200 bg-emerald-50 text-emerald-700',
                          room.status === 'unavailable' &&
                            'border-amber-200 bg-amber-50 text-amber-700',
                          room.status === 'maintenance' &&
                            'border-destructive/20 bg-destructive/10 text-destructive',
                          !['available', 'unavailable', 'maintenance'].includes(room.status) &&
                            'border-border bg-muted text-muted-foreground'
                        )}
                      >
                        {room.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <Button
                          type='button'
                          variant='outline'
                          size='icon-sm'
                          title='View'
                          onClick={() => {
                            setSelectedRoom(room)
                            setIsRoomInfoOpen(true)
                          }}
                        >
                          <Eye className='size-4' />
                        </Button>

                        <Link href={`/hotel_owner/rooms/edit/${room.id}`}>
                          <Button type='button' variant='outline' size='icon-sm' title='Edit'>
                            <Pencil className='size-4' />
                          </Button>
                        </Link>

                        <Button
                          type='button'
                          variant='destructive'
                          size='icon-sm'
                          title='Delete'
                          onClick={() => handleDeleteRoom(room.id)}
                          disabled={deletingRoomId === room.id}
                        >
                          <Trash2 className='size-4' />
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

export default RoomsOwnerPage
