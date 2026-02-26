"use server";

import supabaseConfig from "@/app/config/supabse-config";
import { IBooking } from "./../app/interfaces/index";

const enrichBookings = async (bookings: IBooking[]) => {
  if (!Array.isArray(bookings) || bookings.length === 0) {
    return [] as IBooking[]
  }

  const hotelIds = [...new Set(bookings.map((booking) => booking.hotel_id).filter(Boolean))]
  const roomIds = [...new Set(bookings.map((booking) => booking.room_id).filter(Boolean))]
  const customerIds = [...new Set(bookings.map((booking) => booking.customer_id).filter(Boolean))]

  let hotelsById = new Map<number, string>()
  let roomsById = new Map<number, string>()
  let customersById = new Map<number, string>()

  if (hotelIds.length > 0) {
    const { data: hotels, error: hotelsError } = await supabaseConfig
      .from('hotels')
      .select('id, name')
      .in('id', hotelIds)

    if (hotelsError) {
      throw new Error(hotelsError.message || 'Failed to fetch hotel details')
    }

    hotelsById = new Map((hotels || []).map((hotel) => [hotel.id, hotel.name]))
  }

  if (roomIds.length > 0) {
    const { data: rooms, error: roomsError } = await supabaseConfig
      .from('rooms')
      .select('id, name')
      .in('id', roomIds)

    if (roomsError) {
      throw new Error(roomsError.message || 'Failed to fetch room details')
    }

    roomsById = new Map((rooms || []).map((room) => [room.id, room.name]))
  }

  if (customerIds.length > 0) {
    const { data: customers, error: customersError } = await supabaseConfig
      .from('user_profiles')
      .select('id, name')
      .in('id', customerIds)

    if (customersError) {
      throw new Error(customersError.message || 'Failed to fetch customer details')
    }

    customersById = new Map((customers || []).map((customer) => [customer.id, customer.name]))
  }

  return bookings.map((booking) => ({
    ...booking,
    hotel_name: hotelsById.get(booking.hotel_id) || `Hotel #${booking.hotel_id}`,
    room_name: roomsById.get(booking.room_id) || `Room #${booking.room_id}`,
    customer_name: customersById.get(booking.customer_id) || `Customer #${booking.customer_id}`,
  })) as IBooking[]
}

export const checkAvailabilityOfRoom = async (
  roomId: number,
  bookedDates: string[],
) => {
  try {
    if (!roomId || Number.isNaN(roomId)) {
      throw new Error("Invalid room id")
    }

    if (!Array.isArray(bookedDates) || bookedDates.length === 0) {
      throw new Error("Booked dates are required")
    }

    const { data, error } = await supabaseConfig
      .from("bookings")
      .select("*")
      .eq("room_id", roomId)
      .neq("status", "cancelled")
      .overlaps("booked_dates", bookedDates);    

    if (error) {
       throw new Error(error.message || "Failed to check availability");
    }

    if (data && data.length > 0) {
      const existingBooking = data[0] as IBooking;
      return {
        success: false,
        message: `Room is not available for the selected dates. It is already booked from ${existingBooking.start_date} to ${existingBooking.end_date}.`,
      };
    }

    return {
      success: true,
      message: "Room is available for the selected dates.",
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to check availability",
    };
  }
};

export const createBooking = async (payload: Partial<IBooking>) => {
  try {
    if (!payload.room_id || Number.isNaN(payload.room_id)) {
      throw new Error("Room id is required")
    }

    if (!payload.hotel_id || Number.isNaN(payload.hotel_id)) {
      throw new Error("Hotel id is required")
    }

    if (!payload.owner_id || Number.isNaN(payload.owner_id)) {
      throw new Error("Owner id is required")
    }

    if (!payload.customer_id || Number.isNaN(payload.customer_id)) {
      throw new Error("Customer id is required")
    }

    if (!Array.isArray(payload.booked_dates) || payload.booked_dates.length === 0) {
      throw new Error("Booked dates are required")
    }

    if (!payload.start_date || !payload.end_date) {
      throw new Error("Start date and end date are required")
    }

    if (payload.amount === undefined || Number.isNaN(Number(payload.amount))) {
      throw new Error("Amount is required")
    }

    const availability = await checkAvailabilityOfRoom(payload.room_id, payload.booked_dates)
    if (!availability.success) {
      return {
        success: false,
        message: availability.message,
      }
    }

    const { data, error } = await supabaseConfig
      .from("bookings")
      .insert({
        room_id: payload.room_id,
        hotel_id: payload.hotel_id,
        owner_id: payload.owner_id,
        customer_id: payload.customer_id,
        booked_dates: payload.booked_dates,
        start_date: payload.start_date,
        end_date: payload.end_date,
        amount: Number(payload.amount),
        payment_id: payload.payment_id || "",
        status: payload.status || "booked",
      })
      .select("*")
      .single()

    if (error) {
      throw new Error(error.message || "Failed to create booking")
    }

    return {
      success: true,
      message: "Room booked successfully",
      booking: data as IBooking,
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to create booking",
      booking: null,
    }
  }
}

export const getBookingsByCustomerId = async (customerId: number) => {
  try {
    if (!customerId || Number.isNaN(customerId)) {
      throw new Error('Customer id is required')
    }

    const { data, error } = await supabaseConfig
      .from('bookings')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message || 'Failed to fetch bookings')
    }

    const enrichedBookings = await enrichBookings((data || []) as IBooking[])

    return {
      success: true,
      message: 'Bookings fetched successfully',
      bookings: enrichedBookings,
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to fetch bookings',
      bookings: null,
    }
  }
}

export const getBookingsByOwnerId = async (ownerId: number) => {
  try {
    if (!ownerId || Number.isNaN(ownerId)) {
      throw new Error('Owner id is required')
    }

    const { data, error } = await supabaseConfig
      .from('bookings')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message || 'Failed to fetch bookings')
    }

    const enrichedBookings = await enrichBookings((data || []) as IBooking[])

    return {
      success: true,
      message: 'Bookings fetched successfully',
      bookings: enrichedBookings,
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to fetch bookings',
      bookings: null,
    }
  }
}

export const updateBookingStatusById = async (id: number, status: string) => {
  try {
    if (!id || Number.isNaN(id)) {
      throw new Error('Booking id is required')
    }

    const normalizedStatus = status?.trim().toLowerCase()
    const allowedStatuses = ['booked', 'cancelled']

    if (!normalizedStatus || !allowedStatuses.includes(normalizedStatus)) {
      throw new Error('Invalid booking status')
    }

    const { data, error } = await supabaseConfig
      .from('bookings')
      .update({ status: normalizedStatus })
      .eq('id', id)
      .select('*')
      .maybeSingle()

    if (error) {
      throw new Error(error.message || 'Failed to update booking status')
    }

    if (!data) {
      throw new Error('Booking not found')
    }

    return {
      success: true,
      message: 'Booking status updated successfully',
      booking: data as IBooking,
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to update booking status',
      booking: null,
    }
  }
}

export const getOwnerDashboardData = async (ownerId: number) => {
  try {
    if (!ownerId || Number.isNaN(ownerId)) {
      throw new Error('Owner id is required')
    }

    const [hotelsResult, roomsResult, bookingsResult, recentBookingsResult] = await Promise.all([
      supabaseConfig
        .from('hotels')
        .select('id', { count: 'exact', head: true })
        .eq('owner_id', ownerId),
      supabaseConfig
        .from('rooms')
        .select('id', { count: 'exact', head: true })
        .eq('owner_id', ownerId),
      supabaseConfig
        .from('bookings')
        .select('id, amount, status')
        .eq('owner_id', ownerId),
      supabaseConfig
        .from('bookings')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false })
        .limit(5),
    ])

    if (hotelsResult.error) {
      throw new Error(hotelsResult.error.message || 'Failed to fetch hotels summary')
    }

    if (roomsResult.error) {
      throw new Error(roomsResult.error.message || 'Failed to fetch rooms summary')
    }

    if (bookingsResult.error) {
      throw new Error(bookingsResult.error.message || 'Failed to fetch bookings summary')
    }

    if (recentBookingsResult.error) {
      throw new Error(recentBookingsResult.error.message || 'Failed to fetch recent bookings')
    }

    const bookingsSummary = bookingsResult.data || []
    const totalRevenue = bookingsSummary
      .filter((booking) => booking.status !== 'cancelled')
      .reduce((accumulator, booking) => accumulator + Number(booking.amount || 0), 0)

    const enrichedRecentBookings = await enrichBookings((recentBookingsResult.data || []) as IBooking[])

    return {
      success: true,
      message: 'Owner dashboard data fetched successfully',
      cards: {
        totalHotels: hotelsResult.count || 0,
        totalRooms: roomsResult.count || 0,
        totalBookings: bookingsSummary.length,
        totalRevenue,
      },
      recentBookings: enrichedRecentBookings,
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to fetch owner dashboard data',
      cards: {
        totalHotels: 0,
        totalRooms: 0,
        totalBookings: 0,
        totalRevenue: 0,
      },
      recentBookings: [] as IBooking[],
    }
  }
}

export const getCustomerDashboardData = async (customerId: number) => {
  try {
    if (!customerId || Number.isNaN(customerId)) {
      throw new Error('Customer id is required')
    }

    const [summaryResult, recentResult] = await Promise.all([
      supabaseConfig
        .from('bookings')
        .select('id, amount, status, start_date')
        .eq('customer_id', customerId),
      supabaseConfig
        .from('bookings')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })
        .limit(5),
    ])

    if (summaryResult.error) {
      throw new Error(summaryResult.error.message || 'Failed to fetch customer dashboard data')
    }

    if (recentResult.error) {
      throw new Error(recentResult.error.message || 'Failed to fetch recent bookings')
    }

    const bookings = summaryResult.data || []
    const today = new Date().toISOString().split('T')[0]

    const upcomingBookings = bookings.filter(
      (booking) => booking.status !== 'cancelled' && booking.start_date >= today
    ).length

    const cancelledBookings = bookings.filter((booking) => booking.status === 'cancelled').length
    const completedBookings = bookings.filter((booking) => booking.status !== 'cancelled').length
    const recentBookings = await enrichBookings((recentResult.data || []) as IBooking[])

    return {
      success: true,
      message: 'Customer dashboard data fetched successfully',
      cards: {
        totalBookings: bookings.length,
        completedBookings,
        upcomingBookings,
        cancelledBookings,
      },
      recentBookings,
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to fetch customer dashboard data',
      cards: {
        totalBookings: 0,
        completedBookings: 0,
        upcomingBookings: 0,
        cancelledBookings: 0,
      },
      recentBookings: [] as IBooking[],
    }
  }
}

export const getAdminDashboardData = async () => {
  try {
    const [hotelsResult, roomsResult, usersResult, ownersResult, customersResult, bookingsResult, recentBookingsResult] = await Promise.all([
      supabaseConfig.from('hotels').select('id', { count: 'exact', head: true }),
      supabaseConfig.from('rooms').select('id', { count: 'exact', head: true }),
      supabaseConfig.from('user_profiles').select('id', { count: 'exact', head: true }),
      supabaseConfig.from('user_profiles').select('id', { count: 'exact', head: true }).eq('role', 'hotel_owner'),
      supabaseConfig.from('user_profiles').select('id', { count: 'exact', head: true }).eq('role', 'customer'),
      supabaseConfig.from('bookings').select('id, amount, status, start_date'),
      supabaseConfig.from('bookings').select('*').order('created_at', { ascending: false }).limit(5),
    ])

    if (hotelsResult.error) {
      throw new Error(hotelsResult.error.message || 'Failed to fetch hotels summary')
    }

    if (roomsResult.error) {
      throw new Error(roomsResult.error.message || 'Failed to fetch rooms summary')
    }

    if (usersResult.error) {
      throw new Error(usersResult.error.message || 'Failed to fetch users summary')
    }

    if (ownersResult.error) {
      throw new Error(ownersResult.error.message || 'Failed to fetch owners summary')
    }

    if (customersResult.error) {
      throw new Error(customersResult.error.message || 'Failed to fetch customers summary')
    }

    if (bookingsResult.error) {
      throw new Error(bookingsResult.error.message || 'Failed to fetch bookings summary')
    }

    if (recentBookingsResult.error) {
      throw new Error(recentBookingsResult.error.message || 'Failed to fetch recent bookings')
    }

    const bookings = bookingsResult.data || []
    const today = new Date().toISOString().split('T')[0]

    const upcomingBookings = bookings.filter(
      (booking) => booking.status !== 'cancelled' && booking.start_date >= today
    ).length

    const totalRevenue = bookings
      .filter((booking) => booking.status !== 'cancelled')
      .reduce((accumulator, booking) => accumulator + Number(booking.amount || 0), 0)

    const recentBookings = await enrichBookings((recentBookingsResult.data || []) as IBooking[])

    return {
      success: true,
      message: 'Admin dashboard data fetched successfully',
      cards: {
        totalUsers: usersResult.count || 0,
        totalOwners: ownersResult.count || 0,
        totalCustomers: customersResult.count || 0,
        totalHotels: hotelsResult.count || 0,
        totalRooms: roomsResult.count || 0,
        totalBookings: bookings.length,
        upcomingBookings,
        totalRevenue,
      },
      recentBookings,
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to fetch admin dashboard data',
      cards: {
        totalUsers: 0,
        totalOwners: 0,
        totalCustomers: 0,
        totalHotels: 0,
        totalRooms: 0,
        totalBookings: 0,
        upcomingBookings: 0,
        totalRevenue: 0,
      },
      recentBookings: [] as IBooking[],
    }
  }
}
