export interface IUser {
	id: number
	created_at: string
	name: string
	email: string
	role: 'customer' | 'hotel_owner' | 'admin'
	status: string
	password?: string
}

export interface IHotel {
	id: number
	created_at: string
	name: string
	description: string
	city: string
	address: string
	email: string
	phone: string
	images: string[]
	status: "approved" | "pending" | "rejected" | string
	owner_id: number

	// relationships
	owner?: IUser
}

export interface IRoom {
	id: number
	created_at: string
	hotel_id: number
	owner_id: number
	name: string
	description: string
	type: string
	rent_per_day: number
	status: string
	amenities: string[]
	images: string[]

	// relationships
	hotel?: IHotel
	owner?: IUser
}
