'use client'

import React from 'react'
import {
  Building2,
  CircleDot,
  Image as ImageIcon,
  Mail,
  MapPin,
  MapPinned,
  Phone,
} from 'lucide-react'
import type { IHotel } from '@/app/interfaces'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type HotelInfoModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  hotel: IHotel | null
}

function HotelInfoModal({ open, onOpenChange, hotel }: HotelInfoModalProps) {
  if (!hotel) {
    return null
  }

  const imageUrl = Array.isArray(hotel.images) ? hotel.images[0] : ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='min-w-[500px] max-h-[100vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{hotel.name}</DialogTitle>
          <DialogDescription>Hotel information</DialogDescription>
        </DialogHeader>

        <div className='grid gap-3 text-sm'>
          <div>
            <p className='text-muted-foreground flex items-center gap-2'>
              <Building2 className='size-4' />
              <span>Property</span>
            </p>
            <p className='font-medium flex items-center gap-2'>
              <Building2 className='size-4 text-muted-foreground' />
              <span>{hotel.name}</span>
            </p>
          </div>

          <div>
            <p className='text-muted-foreground mb-2 flex items-center gap-2'>
              <ImageIcon className='size-4' />
              <span>Image</span>
            </p>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={hotel.name}
                className='h-44 w-full rounded-md object-cover border border-border'
              />
            ) : (
              <div className='flex h-44 w-full items-center justify-center rounded-md border border-border text-muted-foreground'>
                No image available
              </div>
            )}
          </div>

          <div>
            <p className='text-muted-foreground flex items-center gap-2'>
              <MapPin className='size-4' />
              <span>City</span>
            </p>
            <p className='font-medium'>{hotel.city}</p>
          </div>

          <div>
            <p className='text-muted-foreground flex items-center gap-2'>
              <MapPinned className='size-4' />
              <span>Address</span>
            </p>
            <p className='font-medium'>{hotel.address}</p>
          </div>

          <div>
            <p className='text-muted-foreground flex items-center gap-2'>
              <Mail className='size-4' />
              <span>Email</span>
            </p>
            <p className='font-medium'>{hotel.email}</p>
          </div>

          <div>
            <p className='text-muted-foreground flex items-center gap-2'>
              <Phone className='size-4' />
              <span>Phone</span>
            </p>
            <p className='font-medium'>{hotel.phone}</p>
          </div>

          <div>
            <p className='text-muted-foreground flex items-center gap-2'>
              <CircleDot className='size-4' />
              <span>Status</span>
            </p>
            <p className='font-medium capitalize'>{hotel.status}</p>
          </div>
        </div>

        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  )
}

export default HotelInfoModal
