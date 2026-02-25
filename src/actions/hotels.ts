'use server'

import { IHotel } from "./../app/interfaces/index";
import supabaseConfig from "@/app/config/supabse-config"

export const createHotel = async (payload: Partial<IHotel>) => {
	try {
		const name = payload.name?.trim();
		const description = payload.description?.trim();
		const city = payload.city?.trim();
		const address = payload.address?.trim();
		const email = payload.email?.trim().toLowerCase();
		const phone = payload.phone?.trim();
		const status = payload.status?.trim() || "pending";

		if (!name || !description || !city || !address || !email || !phone || !payload.owner_id) {
			throw new Error("Name, description, city, address, email, phone and owner id are required");
		}

		const { data, error } = await supabaseConfig
			.from("hotels")
			.insert({
				name,
				description,
				city,
				address,
				email,
				phone,
				images: payload.images || [],
				status,
				owner_id: payload.owner_id,
			})
			.select("*")
			.single();

		if (error) {
			throw new Error(error.message);
		}

		return {
			success: true,
			message: "Hotel created successfully",
			hotel: data,
		};
	} catch (error: any) {
		return {
			success: false,
			message: error.message || "An error occurred while creating hotel",
		};
	}
};

export const editHotelById = async (id: number, payload: Partial<IHotel>) => {
	try {
		if (!id) {
			throw new Error("Hotel id is required");
		}

		const updatePayload: Partial<IHotel> = {};

		if (payload.name !== undefined) updatePayload.name = payload.name.trim();
		if (payload.description !== undefined) updatePayload.description = payload.description.trim();
		if (payload.city !== undefined) updatePayload.city = payload.city.trim();
		if (payload.address !== undefined) updatePayload.address = payload.address.trim();
		if (payload.email !== undefined) updatePayload.email = payload.email.trim().toLowerCase();
		if (payload.phone !== undefined) updatePayload.phone = payload.phone.trim();
		if (payload.images !== undefined) updatePayload.images = payload.images;
		if (payload.status !== undefined) updatePayload.status = payload.status.trim();
		if (payload.owner_id !== undefined) updatePayload.owner_id = payload.owner_id;

		if (Object.keys(updatePayload).length === 0) {
			throw new Error("At least one field is required to update hotel");
		}

		const { data, error } = await supabaseConfig
			.from("hotels")
			.update(updatePayload)
			.eq("id", id)
			.select("*")
			.maybeSingle();

		if (error) {
			throw new Error(error.message);
		}

		if (!data) {
			throw new Error("Hotel not found");
		}

		return {
			success: true,
			message: "Hotel updated successfully",
			hotel: data,
		};
	} catch (error: any) {
		return {
			success: false,
			message: error.message || "An error occurred while updating hotel",
		};
	}
};

export const getHotelById = async (id: number) => {
	try {
		if (!id) {
			throw new Error("Hotel id is required");
		}

		const { data, error } = await supabaseConfig
			.from("hotels")
			.select("*")
			.eq("id", id)
			.maybeSingle();

		if (error) {
			throw new Error(error.message);
		}

		if (!data) {
			throw new Error("Hotel not found");
		}

		return {
			success: true,
			message: "Hotel fetched successfully",
			hotel: data,
		};
	} catch (error: any) {
		return {
			success: false,
			message: error.message || "Failed to fetch hotel",
			hotel: null,
		};
	}
};

export const deleteHotelById = async (id: number) => {
	try {
		if (!id) {
			throw new Error("Hotel id is required");
		}

		const { data, error } = await supabaseConfig
			.from("hotels")
			.delete()
			.eq("id", id)
			.select("id")
			.maybeSingle();

		if (error) {
			throw new Error(error.message);
		}

		if (!data) {
			throw new Error("Hotel not found");
		}

		return {
			success: true,
			message: "Hotel deleted successfully",
		};
	} catch (error: any) {
		return {
			success: false,
			message: error.message || "An error occurred while deleting hotel",
		};
	}
};

export const deleteHotelByIdi = async (id: number) => {
	return deleteHotelById(id);
};

export const getHotelsByOwnerId = async (owner_id: number) => {
	try {
		if (!owner_id) {
			throw new Error("Owner id is required");
		}

		const { data, error } = await supabaseConfig
			.from("hotels")
			.select("*")
			.eq("owner_id", owner_id)
			.order("created_at", { ascending: false });

		if (error) {
			throw new Error(error.message);
		}

		return {
			success: true,
			message: "Hotels fetched successfully",
			hotels: data,
		};
	} catch (error: any) {
		return {
			success: false,
			message: error.message || "Failed to fetch hotels",
			hotels: null,
		};
	}
};

export const getAllHotels = async () => {
	try {
		const { data, error } = await supabaseConfig
			.from("hotels")
			.select("*" )
			.order("created_at", { ascending: false });

		if (error) {
			throw new Error(error.message);
		}

		return {
			success: true,
			message: "Hotels fetched successfully",
			hotels: data,
		};
	} catch (error: any) {
		return {
			success: false,
			message: error.message || "Failed to fetch hotels",
			hotels: null,
		};
	}
};


