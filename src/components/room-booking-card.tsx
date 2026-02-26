import type { IRoom } from '@/app/interfaces'
import { Button } from '@/components/ui/button'
import { CalendarDays, MapPin } from 'lucide-react'
import Link from 'next/link'

interface RoomBookingCardProps {
  room: IRoom
  hotelName: string
}

function RoomBookingCard({ room, hotelName }: RoomBookingCardProps) {
  const imageUrl = Array.isArray(room.images) ? room.images[0] : ''
  const amenities = Array.isArray(room.amenities) ? room.amenities : []
  const shownAmenities = amenities.slice(0, 3)
  const remainingAmenitiesCount = Math.max(0, amenities.length - shownAmenities.length)

  return (
    <Link
      href={`/customer/book-room/${room.id}`}
      className='overflow-hidden rounded-xl border border-border bg-card transition hover:border-ring hover:shadow-sm'
    >
      <div className='aspect-6/3 w-full overflow-hidden bg-muted'>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={room.name}
            className='h-full w-full object-cover transition duration-300 hover:scale-105'
          />
        ) : (
          <div className='flex h-full items-center justify-center text-sm text-muted-foreground'>
            No image available
          </div>
        )}
      </div>

      <div className='space-y-3 p-4'>
        <div className='flex items-center justify-between gap-2'>
          <h3 className='line-clamp-1 text-lg font-semibold'>{room.name}</h3>
          <span className='rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700'>
            AVAILABLE
          </span>
        </div>

        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
          <MapPin className='size-4' />
          <p className='line-clamp-1'>{hotelName || `Hotel #${room.hotel_id}`}</p>
        </div>

        <p className='line-clamp-2 text-sm text-muted-foreground'>{room.description}</p>

        <p className='text-3xl font-bold text-emerald-600'>${room.rent_per_day}/day</p>

        <div className='space-y-2'>
          <p className='text-base font-semibold'>Amenities:</p>

          <div className='flex flex-wrap items-center gap-2'>
            {shownAmenities.map((amenity) => (
              <span
                key={amenity}
                className='rounded-md border border-border bg-muted px-2 py-1 text-sm text-muted-foreground'
              >
                {amenity}
              </span>
            ))}

            {remainingAmenitiesCount > 0 && (
              <span className='text-sm text-muted-foreground'>+{remainingAmenitiesCount} more</span>
            )}
          </div>
        </div>

        <Button type='button' className='w-full gap-2' size='lg'>
          <CalendarDays className='size-4' />
          Book Now
        </Button>
      </div>
    </Link>
  )
}

export default RoomBookingCard