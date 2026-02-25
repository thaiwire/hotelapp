'use server'

import { IRoom } from './../app/interfaces/index'
import supabaseConfig from '@/app/config/supabse-config'

export const createRoom = async (payload: Partial<IRoom>) => {
  try {
    const name = payload.name?.trim()
    const description = payload.description?.trim()
    const type = payload.type?.trim()
    const status = payload.status?.trim() || 'available'
    const rent_per_day = Number(payload.rent_per_day)

    if (
      !name ||
      !description ||
      !type ||
      !payload.hotel_id ||
      !payload.owner_id ||
      Number.isNaN(rent_per_day)
    ) {
      throw new Error(
        'Name, description, type, rent per day, hotel id and owner id are required'
      )
    }

    const { data, error } = await supabaseConfig
      .from('rooms')
      .insert({
        name,
        description,
        type,
        rent_per_day,
        status,
        amenities: payload.amenities || [],
        images: payload.images || [],
        hotel_id: payload.hotel_id,
        owner_id: payload.owner_id,
      })
      .select('*')
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return {
      success: true,
      message: 'Room created successfully',
      room: data,
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'An error occurred while creating room',
    }
  }
}

export const editRoomById = async (id: number, payload: Partial<IRoom>) => {
  try {
    if (!id) {
      throw new Error('Room id is required')
    }

    const updatePayload: Partial<IRoom> = {}

    if (payload.name !== undefined) updatePayload.name = payload.name.trim()
    if (payload.description !== undefined)
      updatePayload.description = payload.description.trim()
    if (payload.type !== undefined) updatePayload.type = payload.type.trim()
    if (payload.status !== undefined) updatePayload.status = payload.status.trim()
    if (payload.rent_per_day !== undefined) {
      const rentPerDay = Number(payload.rent_per_day)
      if (Number.isNaN(rentPerDay)) {
        throw new Error('Rent per day must be a valid number')
      }
      updatePayload.rent_per_day = rentPerDay
    }
    if (payload.amenities !== undefined) updatePayload.amenities = payload.amenities
    if (payload.images !== undefined) updatePayload.images = payload.images
    if (payload.hotel_id !== undefined) updatePayload.hotel_id = payload.hotel_id
    if (payload.owner_id !== undefined) updatePayload.owner_id = payload.owner_id

    if (Object.keys(updatePayload).length === 0) {
      throw new Error('At least one field is required to update room')
    }

    const { data, error } = await supabaseConfig
      .from('rooms')
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    if (!data) {
      throw new Error('Room not found')
    }

    return {
      success: true,
      message: 'Room updated successfully',
      room: data,
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'An error occurred while updating room',
    }
  }
}

export const getRoomById = async (id: number) => {
  try {
    if (!id) {
      throw new Error('Room id is required')
    }

    const { data, error } = await supabaseConfig
      .from('rooms')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    if (!data) {
      throw new Error('Room not found')
    }

    return {
      success: true,
      message: 'Room fetched successfully',
      room: data,
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to fetch room',
      room: null,
    }
  }
}

export const deleteRoomById = async (id: number) => {
  try {
    if (!id) {
      throw new Error('Room id is required')
    }

    const { data, error } = await supabaseConfig
      .from('rooms')
      .delete()
      .eq('id', id)
      .select('id')
      .maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    if (!data) {
      throw new Error('Room not found')
    }

    return {
      success: true,
      message: 'Room deleted successfully',
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'An error occurred while deleting room',
    }
  }
}

export const getRoomsByOwnerId = async (owner_id: number) => {
  try {
    if (!owner_id) {
      throw new Error('Owner id is required')
    }

    const { data, error } = await supabaseConfig
      .from('rooms')
      .select('*')
      .eq('owner_id', owner_id)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return {
      success: true,
      message: 'Rooms fetched successfully',
      rooms: data,
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to fetch rooms',
      rooms: null,
    }
  }
}
