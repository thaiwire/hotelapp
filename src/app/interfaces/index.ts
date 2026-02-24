export interface IUser {
	id: number
	created_at: string
	name?: string | null
	email?: string | null
	role?: 'customer' | 'hotel_owner' | 'admin' | null
	status?: string | null
	password?: string | null
}
