import HotelForm from '@/components/hotel-form'
import PageTitle from '@/components/page-title'
import React from 'react'

function AddHotelsPage() {
  return (
    <div className='flex flex-col gap-5'>
        <PageTitle title='Add New Hotel' />
        <HotelForm formType='add' />
    </div>
  )
}

export default AddHotelsPage