import { getHotelById } from '@/actions/hotels'
import HotelForm from '@/components/hotel-form'
import InfoMessage from '@/components/info-message'
import PageTitle from '@/components/page-title'
import React from 'react'

interface EditHotelPageProps {
  params: Promise<{ id: string }>
}


async function EditHotelPage({ params }: EditHotelPageProps) {
  const {id} = await params
  const hotel = await getHotelById(Number(id))

  if (!hotel || !hotel.success || !hotel.hotel) {
    return <InfoMessage message="Hotel not found" />
  }

  return (
    <div className='flex flex-col gap-5'>
        <PageTitle title='Edit Hotel' />
        <HotelForm formType='edit' 
        hotelData={hotel.hotel}
        />
    </div>
  )
}

export default EditHotelPage