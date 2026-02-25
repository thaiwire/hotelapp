"use client";

import React, { useEffect, useState } from 'react'
import { getLoggedInUser } from "@/actions/users";
import { useRouter } from 'next/navigation';
import { useUsersStore } from '@/store/users-store';
import Header from './header';
import Spinner from '@/components/spinner';

function PrivateLayout({children}: {children: React.ReactNode}) {
  const [loading, setLoading] = useState(true)
  const { setLoggedInUser } = useUsersStore(); 
  const router = useRouter();

  const fetchUserData = async () => {
    try {
      const response = await getLoggedInUser()
      if (response.success) {
        setLoggedInUser(response.user)
      } else {
        router.replace('/login')
      }
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchUserData()
  }, [])

  if (loading) {
    return <Spinner label="Loading user data..." />
  }
  

  return (
    <div>
       <Header />
       <div className='p-5'>{children}</div>
    </div>
  );
}

export default PrivateLayout