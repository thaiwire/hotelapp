"use client"

import React, { useEffect, useMemo, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Trash2 } from "lucide-react"
import { useForm } from "react-hook-form"
import {
  BtnBold,
  BtnBulletList,
  BtnItalic,
  BtnLink,
  BtnNumberedList,
  BtnRedo,
  BtnStrikeThrough,
  BtnUnderline,
  BtnUndo,
  Editor,
  EditorProvider,
  Separator,
  Toolbar,
} from "react-simple-wysiwyg"
import { z } from "zod"

import type { IHotel, IRoom } from "@/app/interfaces"
import { amenities, roomTypes } from "@/app/constants"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createRoom, editRoomById } from "@/actions/rooms"
import { uploadFile } from "@/actions/uploads"
import { getHotelsByOwnerId } from "@/actions/hotels"
import { useUsersStore } from "@/store/users-store"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

const ROOM_STATUS_OPTIONS = ["available", "unavailable", "maintenance"] as const

const roomFormSchema = z.object({
  name: z.string().min(2, "Room name is required"),
  description: z.string().min(1, "Description is required"),
  type: z.string().min(1, "Room type is required"),
  hotel_id: z.string().min(1, "Hotel is required"),
  status: z.string().min(1, "Status is required"),
  rent_per_day: z.number().min(1, "Rent per day is required"),
  amenities: z.array(z.string()),
})

type RoomFormValues = z.infer<typeof roomFormSchema>

type SelectedImage = {
  key: string
  file: File
  previewUrl: string
}

interface RoomFormProps {
  formType: "add" | "edit"
  roomData?: Partial<IRoom>
}

function RoomForm({ formType, roomData }: RoomFormProps) {
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([])
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>(
    Array.isArray(roomData?.images) ? roomData.images : []
  )
  const [ownerHotels, setOwnerHotels] = useState<IHotel[]>([])
  const [loadingHotels, setLoadingHotels] = useState(true)
  const { loggedInUser } = useUsersStore()
  const router = useRouter()

  const initialValues = useMemo<RoomFormValues>(
    () => ({
      name: roomData?.name ?? "",
      description: roomData?.description ?? "",
      type: roomData?.type ?? "",
      hotel_id: roomData?.hotel_id ? String(roomData.hotel_id) : "",
      status: roomData?.status ?? "available",
      rent_per_day: roomData?.rent_per_day ?? 0,
      amenities: Array.isArray(roomData?.amenities) ? roomData.amenities : [],
    }),
    [roomData]
  )

  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomFormSchema),
    defaultValues: initialValues,
  })

  useEffect(() => {
    setExistingImageUrls(Array.isArray(roomData?.images) ? roomData.images : [])
  }, [roomData?.images])

  useEffect(() => {
    return () => {
      selectedImages.forEach((image) => URL.revokeObjectURL(image.previewUrl))
    }
  }, [selectedImages])

  useEffect(() => {
    const loadHotels = async () => {
      try {
        if (!loggedInUser?.id) {
          setLoadingHotels(false)
          return
        }

        const response = await getHotelsByOwnerId(loggedInUser.id)
        if (!response.success) {
          toast.error(response.message || "Failed to fetch hotels")
          return
        }

        setOwnerHotels(response.hotels || [])
      } catch (error: any) {
        toast.error(error.message || "Failed to fetch hotels")
      } finally {
        setLoadingHotels(false)
      }
    }

    loadHotels()
  }, [loggedInUser?.id])

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files

    if (!files || files.length === 0) {
      return
    }

    const imageItems = Array.from(files).map((file, index) => ({
      key: `${file.name}-${file.lastModified}-${index}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }))

    setSelectedImages((prev) => [...prev, ...imageItems])
    event.target.value = ""
  }

  const handleDeleteImage = (imageKey: string) => {
    setSelectedImages((prev) => {
      const toRemove = prev.find((image) => image.key === imageKey)
      if (toRemove) {
        URL.revokeObjectURL(toRemove.previewUrl)
      }
      return prev.filter((image) => image.key !== imageKey)
    })
  }

  const handleDeleteExistingImage = (imageUrl: string) => {
    setExistingImageUrls((prev) => prev.filter((url) => url !== imageUrl))
  }

  const onSubmit = async (values: RoomFormValues) => {
    try {
      if (!loggedInUser?.id) {
        toast.error("Please login again to continue")
        return
      }

      let uploadImageUrls: string[] = []
      for (const item of selectedImages) {
        const uploadResult = await uploadFile(item.file, `rooms/${item.file.name}`)
        if (uploadResult.success && uploadResult.url) {
          uploadImageUrls.push(uploadResult.url)
        }
      }

      const allImages = [...existingImageUrls, ...uploadImageUrls]
      let response: { success: boolean; message?: string } | null = null

      if (formType === "add") {
        response = await createRoom({
          ...values,
          hotel_id: Number(values.hotel_id),
          images: allImages,
          owner_id: loggedInUser.id,
        })
      } else {
        if (!roomData?.id) {
          toast.error("Room id is missing")
          return
        }

        response = await editRoomById(roomData.id, {
          ...values,
          hotel_id: Number(values.hotel_id),
          images: allImages,
        })
      }

      if (response?.success) {
        toast.success(
          response.message ||
            (formType === "edit"
              ? "Room updated successfully!"
              : "Room created successfully!")
        )
        form.reset()
        setSelectedImages([])
        router.push("/hotel_owner/rooms")
      } else {
        toast.error(
          response?.message ||
            (formType === "edit"
              ? "Failed to update room. Please try again."
              : "Failed to create room. Please try again.")
        )
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to submit room")
    }
  }

  return (
    <section className="rounded-lg border border-border bg-card p-4 shadow-sm sm:p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Name</FormLabel>
                    <Input placeholder="Enter room name" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select room type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roomTypes.map((roomType) => (
                          <SelectItem
                            key={roomType.value}
                            value={roomType.value}
                          >
                            {roomType.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <div className="overflow-hidden rounded-md border border-input bg-transparent shadow-xs">
                    <EditorProvider>
                      <Editor
                        value={field.value}
                        onChange={(event) => field.onChange(event.target.value)}
                        containerProps={{ className: "min-h-40" }}
                      >
                        <Toolbar>
                          <BtnUndo />
                          <BtnRedo />
                          <Separator />
                          <BtnBold />
                          <BtnItalic />
                          <BtnUnderline />
                          <BtnStrikeThrough />
                          <Separator />
                          <BtnNumberedList />
                          <BtnBulletList />
                          <BtnLink />
                        </Toolbar>
                      </Editor>
                    </EditorProvider>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="rent_per_day"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rent per Day ($)</FormLabel>
                    <Input
                      type="number"
                      min={0}
                      placeholder="0"
                      {...field}
                      onChange={(event) =>
                        field.onChange(Number(event.target.value))
                      }
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ROOM_STATUS_OPTIONS.map((roomStatus) => (
                          <SelectItem
                            key={roomStatus}
                            value={roomStatus}
                            className="capitalize"
                          >
                            {roomStatus}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hotel_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hotel</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={
                              loadingHotels
                                ? "Loading hotels..."
                                : "Select a hotel"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ownerHotels.map((hotel) => (
                          <SelectItem key={hotel.id} value={String(hotel.id)}>
                            {hotel.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="amenities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amenities</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {amenities.map((amenity) => {
                      const isSelected = field.value.includes(amenity.value);

                      return (
                        <Button
                          key={amenity.value}
                          type="button"
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            if (isSelected) {
                              field.onChange(
                                field.value.filter(
                                  (item) => item !== amenity.value,
                                ),
                              );
                              return;
                            }

                            field.onChange([...field.value, amenity.value]);
                          }}
                        >
                          {amenity.label}
                        </Button>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-3">
              <FormLabel>Images</FormLabel>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
              />

              {existingImageUrls.length > 0 && (
                <div className="grid gap-2">
                  <p className="text-sm text-muted-foreground">
                    Existing Images
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {existingImageUrls.map((imageUrl, index) => (
                      <div
                        key={`${imageUrl}-${index}`}
                        className="flex flex-col gap-2 rounded-md border border-border bg-background p-2"
                      >
                        <img
                          src={imageUrl}
                          alt={`Room image ${index + 1}`}
                          className="h-36 w-full rounded-md object-cover"
                        />
                        <div className="flex items-center justify-between gap-2">
                          <p className="line-clamp-1 text-xs text-muted-foreground">
                            Existing image {index + 1}
                          </p>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="h-7 px-2"
                            onClick={() => handleDeleteExistingImage(imageUrl)}
                          >
                            <Trash2 className="size-3.5" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedImages.length > 0 && (
                <div className="grid gap-2">
                  <p className="text-sm text-muted-foreground">
                    New Selected Images
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {selectedImages.map((image) => (
                      <div
                        key={image.key}
                        className="flex flex-col gap-2 rounded-md border border-border bg-background p-2"
                      >
                        <img
                          src={image.previewUrl}
                          alt={image.file.name}
                          className="h-36 w-full rounded-md object-cover"
                        />
                        <div className="flex items-center justify-between gap-2">
                          <p className="line-clamp-1 text-xs text-muted-foreground">
                            {image.file.name}
                          </p>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="h-7 px-2"
                            onClick={() => handleDeleteImage(image.key)}
                          >
                            <Trash2 className="size-3.5" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              className={cn("min-w-28", formType === "edit" && "min-w-32")}
            >
              {formType === "edit" ? "Update Room" : "Add Room"}
            </Button>
          </div>
        </form>
      </Form>
    </section>
  );
}

export default RoomForm
