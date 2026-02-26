'use client'

import React from 'react'

import InfoMessage from '@/components/info-message'
import PageTitle from '@/components/page-title'
import UserProfileCard from '@/components/user-profile-card'
import { UsersStore, useUsersStore } from '@/store/users-store'

function OwnerProfilePage() {
  const { loggedInUser }: UsersStore = useUsersStore()

  return (
    <div className='space-y-6'>
      <PageTitle title='Profile' />

      {!loggedInUser ? (
        <InfoMessage message='Please wait while user details are loading.' />
      ) : (
        <UserProfileCard user={loggedInUser} />
      )}
    </div>
  )
}

export default OwnerProfilePage
