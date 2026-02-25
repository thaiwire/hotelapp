'use client'

import React, { useEffect, useState } from 'react'
import { editHotelById, getAllHotels } from '@/actions/hotels'
import type { IHotel } from '@/app/interfaces'
import InfoMessage from '@/components/info-message'
import HotelInfoModal from '@/components/hotel-info-modal'
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
import { Eye } from 'lucide-react'
import toast from 'react-hot-toast'

const HOTEL_STATUS_OPTIONS = ['pending', 'approved', 'rejected'] as const

function AdminHotelsPage() {
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [updatingHotelId, setUpdatingHotelId] = useState<number | null>(null)
  const [hotels, setHotels] = useState<IHotel[]>([])
  const [selectedHotel, setSelectedHotel] = useState<IHotel | null>(null)
  const [isHotelInfoOpen, setIsHotelInfoOpen] = useState(false)

  useEffect(() => {
    const loadHotels = async () => {
      try {
        const response = await getAllHotels()

        if (!response.success) {
          setErrorMessage(response.message || 'Failed to fetch hotels')
          return
        }

        setHotels(response.hotels || [])
      } catch (error: any) {
        setErrorMessage(error.message || 'Failed to fetch hotels')
      } finally {
        setLoading(false)
      }
    }

    loadHotels()
  }, [])

  const handleStatusChange = (hotelId: number, status: IHotel['status']) => {
    setHotels((prevHotels) =>
      prevHotels.map((hotel) =>
        hotel.id === hotelId
          ? {
              ...hotel,
              status,
            }
          : hotel
      )
    )
  }

  const handleUpdateStatus = async (hotel: IHotel) => {
    try {
      setUpdatingHotelId(hotel.id)
      const response = await editHotelById(hotel.id, { status: hotel.status })

      if (!response.success) {
        toast.error(response.message || 'Failed to update hotel status')
        return
      }

      toast.success(response.message || 'Hotel status updated successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update hotel status')
    } finally {
      setUpdatingHotelId(null)
    }
  }

  return (
    <div className='flex flex-col gap-5'>
      <HotelInfoModal
        open={isHotelInfoOpen}
        onOpenChange={setIsHotelInfoOpen}
        hotel={selectedHotel}
      />

      <div className='flex items-center justify-between'>
        <PageTitle title='Hotels' />
      </div>

      {errorMessage && <InfoMessage message={errorMessage} />}

      {!errorMessage && (
        <div className='rounded-lg border border-border bg-card p-4 shadow-sm'>
          {loading ? (
            <InfoMessage message='Loading hotels...' />
          ) : hotels.length === 0 ? (
            <InfoMessage message='No hotels found.' />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Owner ID</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hotels.map((hotel) => (
                  <TableRow key={hotel.id}>
                    <TableCell className='font-medium'>{hotel.name}</TableCell>
                    <TableCell>{hotel.owner_id}</TableCell>
                    <TableCell>{hotel.city}</TableCell>
                    <TableCell className='max-w-52 truncate'>{hotel.address}</TableCell>
                    <TableCell>{hotel.email}</TableCell>
                    <TableCell>{hotel.phone}</TableCell>
                    <TableCell>
                      <Select
                        value={hotel.status}
                        onValueChange={(value) =>
                          handleStatusChange(hotel.id, value as IHotel['status'])
                        }
                      >
                        <SelectTrigger className='w-36 capitalize'>
                          <SelectValue placeholder='Select status' />
                        </SelectTrigger>
                        <SelectContent>
                          {HOTEL_STATUS_OPTIONS.map((statusOption) => (
                            <SelectItem key={statusOption} value={statusOption} className='capitalize'>
                              {statusOption}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center justify-end gap-2'>
                        <Button
                          type='button'
                          variant='outline'
                          size='icon-sm'
                          title='View'
                          onClick={() => {
                            setSelectedHotel(hotel)
                            setIsHotelInfoOpen(true)
                          }}
                        >
                          <Eye className='size-4' />
                        </Button>

                        <Button
                          type='button'
                          size='sm'
                          onClick={() => handleUpdateStatus(hotel)}
                          disabled={updatingHotelId === hotel.id}
                        >
                          {updatingHotelId === hotel.id ? 'Updating...' : 'Update'}
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

export default AdminHotelsPage
