'use server'

import supabaseConfig from "@/app/config/supabse-config"

const HOTELS_BUCKET = "hotels"

const appendUniqueSuffixToPath = (path: string) => {
	const lastSlashIndex = path.lastIndexOf("/")
	const directory = lastSlashIndex >= 0 ? path.slice(0, lastSlashIndex) : ""
	const fileName = lastSlashIndex >= 0 ? path.slice(lastSlashIndex + 1) : path

	const lastDotIndex = fileName.lastIndexOf(".")
	const baseName = lastDotIndex > 0 ? fileName.slice(0, lastDotIndex) : fileName
	const extension = lastDotIndex > 0 ? fileName.slice(lastDotIndex) : ""

	const uniqueSuffix = `-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
	const uniqueFileName = `${baseName}${uniqueSuffix}${extension}`

	return directory ? `${directory}/${uniqueFileName}` : uniqueFileName
}

const isAlreadyExistsError = (message: string) => {
	return /already exists|resource already exists/i.test(message)
}

export const uploadFile = async (file: File, path: string) => {
	try {
		if (!file) {
			throw new Error("File is required")
		}

		const cleanPath = path?.trim() || ""
		if (!cleanPath) {
			throw new Error("Path is required")
		}

		const extension = file.name.split(".").pop()?.toLowerCase()
		const fileExtension = extension ? `.${extension}` : ""
		const hasExtension = /\.[a-zA-Z0-9]+$/.test(cleanPath)
		const initialPath = hasExtension ? cleanPath : `${cleanPath}${fileExtension}`

		let finalPath = initialPath
		let uploadErrorMessage = ""

		for (let attempt = 0; attempt < 2; attempt += 1) {
			const { error: uploadError } = await supabaseConfig.storage
				.from(HOTELS_BUCKET)
				.upload(finalPath, file, {
					cacheControl: "3600",
					upsert: false,
					contentType: file.type || undefined,
				})

			if (!uploadError) {
				uploadErrorMessage = ""
				break
			}

			uploadErrorMessage = uploadError.message

			if (attempt === 0 && isAlreadyExistsError(uploadError.message)) {
				finalPath = appendUniqueSuffixToPath(initialPath)
				continue
			}

			break
		}

		if (uploadErrorMessage) {
			throw new Error(uploadErrorMessage)
		}

		const {
			data: { publicUrl },
		} = supabaseConfig.storage.from(HOTELS_BUCKET).getPublicUrl(finalPath)

		return {
			success: true,
			message: "File uploaded successfully",
			url: publicUrl,
			path: finalPath,
			bucket: HOTELS_BUCKET,
		}
	} catch (error: any) {
		return {
			success: false,
			message: error.message || "File upload failed",
			url: null,
			path: null,
			bucket: HOTELS_BUCKET,
		}
	}
}