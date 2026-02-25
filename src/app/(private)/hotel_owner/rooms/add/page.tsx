import PageTitle from '@/components/page-title'
import RoomForm from '@/components/room-form'
import React from 'react'

function AddRoomsPage() {
  return (
    <div className='flex flex-col gap-5'>
      <PageTitle title='Add New Room' />
      <RoomForm formType='add' />
    </div>
  )
}

export default AddRoomsPage
