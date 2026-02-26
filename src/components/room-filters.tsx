"use client"

import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type FilterOption = {
  value: string
  label: string
}

type RoomFiltersValue = {
  roomType: string
  sortBy: string
}

interface RoomFiltersProps {
  roomTypeOptions: FilterOption[]
  sortOptions: FilterOption[]
  onApply: (filters: RoomFiltersValue) => void
  onClear: () => void
}

function RoomFilters({ roomTypeOptions, sortOptions, onApply, onClear }: RoomFiltersProps) {
  const [roomType, setRoomType] = useState('all')
  const [sortBy, setSortBy] = useState('default')

  const handleApply = () => {
    onApply({
      roomType: roomType === 'all' ? '' : roomType,
      sortBy: sortBy === 'default' ? '' : sortBy,
    })
  }

  const handleClear = () => {
    setRoomType('all')
    setSortBy('default')
    onClear()
  }

  return (
    <div className='rounded-lg border border-border bg-card p-4 shadow-sm'>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto] md:items-end'>
        <div className='space-y-2'>
          <p className='text-sm text-muted-foreground'>Filter by Room Type</p>
          <Select value={roomType} onValueChange={setRoomType}>
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='Select room type' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Room Types</SelectItem>
              {roomTypeOptions.map((roomTypeOption) => (
                <SelectItem key={roomTypeOption.value} value={roomTypeOption.value}>
                  {roomTypeOption.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-2'>
          <p className='text-sm text-muted-foreground'>Sort by</p>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='Select sort option' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='default'>Default</SelectItem>
              {sortOptions.map((sortOption) => (
                <SelectItem key={sortOption.value} value={sortOption.value}>
                  {sortOption.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button type='button' onClick={handleApply} className='md:h-10'>
          Apply Filter
        </Button>
        <Button type='button' variant='outline' onClick={handleClear} className='md:h-10'>
          Clear Filter
        </Button>
      </div>
    </div>
  )
}

export type { RoomFiltersValue }
export default RoomFilters