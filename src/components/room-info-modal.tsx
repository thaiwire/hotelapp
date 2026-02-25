'use client'

import React from 'react'
import { BedDouble, Building2, CalendarClock, CircleDot, Image as ImageIcon, Wallet } from 'lucide-react'
import type { IRoom } from '@/app/interfaces'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

type RoomInfoModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  room: IRoom | null
  hotelName?: string
  createdOn?: string
}

function RoomInfoModal({ open, onOpenChange, room, hotelName, createdOn }: RoomInfoModalProps) {
  if (!room) {
    return null
  }

  const imageUrl = Array.isArray(room.images) ? room.images[0] : ''
  const amenitiesText = Array.isArray(room.amenities) && room.amenities.length > 0 ? room.amenities.join(', ') : 'N/A'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='min-w-125 max-h-screen overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{room.name}</DialogTitle>
          <DialogDescription>Room information</DialogDescription>
        </DialogHeader>

        <div className='grid gap-3 text-sm'>
          <div>
            <p className='text-muted-foreground mb-2 flex items-center gap-2'>
              <ImageIcon className='size-4' />
              <span>Image</span>
            </p>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={room.name}
                className='h-44 w-full rounded-md border border-border object-cover'
              />
            ) : (
              <div className='flex h-44 w-full items-center justify-center rounded-md border border-border text-muted-foreground'>
                No image available
              </div>
            )}
          </div>

          <div>
            <p className='text-muted-foreground flex items-center gap-2'>
              <BedDouble className='size-4' />
              <span>Room Type</span>
            </p>
            <p className='font-medium capitalize'>{room.type}</p>
          </div>

          <div>
            <p className='text-muted-foreground flex items-center gap-2'>
              <Building2 className='size-4' />
              <span>Hotel</span>
            </p>
            <p className='font-medium'>{hotelName || `#${room.hotel_id}`}</p>
          </div>

          <div>
            <p className='text-muted-foreground flex items-center gap-2'>
              <Wallet className='size-4' />
              <span>Rent per Day</span>
            </p>
            <p className='font-medium'>${room.rent_per_day}</p>
          </div>

          <div>
            <p className='text-muted-foreground flex items-center gap-2'>
              <CircleDot className='size-4' />
              <span>Status</span>
            </p>
            <p className='font-medium capitalize'>{room.status}</p>
          </div>

          <div>
            <p className='text-muted-foreground flex items-center gap-2'>
              <CalendarClock className='size-4' />
              <span>Created On</span>
            </p>
            <p className='font-medium'>{createdOn || 'N/A'}</p>
          </div>

          <div>
            <p className='text-muted-foreground'>Amenities</p>
            <p className='font-medium capitalize'>{amenitiesText}</p>
          </div>
        </div>

        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  )
}

export default RoomInfoModal
