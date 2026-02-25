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

import type { IHotel } from "@/app/interfaces"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { createHotel, editHotelById } from "@/actions/hotels"
import { uploadFile } from "@/actions/uploads"
import { useUsersStore } from "@/store/users-store"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"



const hotelFormSchema = z.object({
  name: z.string().min(2, "Hotel name is required"),
  description: z.string().min(1, "Description is required"),
  city: z.string().min(2, "City is required"),
  address: z.string().min(2, "Address is required"),
  phone: z.string().min(7, "Mobile number is required"),
  email: z.email("Please enter a valid email address"),
})

type HotelFormValues = z.infer<typeof hotelFormSchema>

type SelectedImage = {
  key: string
  file: File
  previewUrl: string
}

interface HotelFormProps {
  formType: "add" | "edit"
  hotelData?: Partial<IHotel>
}

function HotelForm({ formType, hotelData }: HotelFormProps) {
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([])
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>(
    Array.isArray(hotelData?.images) ? hotelData.images : []
  )
  const { loggedInUser } = useUsersStore()
  const router = useRouter()

  const initialValues = useMemo<HotelFormValues>(
    () => ({
      name: hotelData?.name ?? "",
      description: hotelData?.description ?? "",
      city: hotelData?.city ?? "",
      address: hotelData?.address ?? "",
      phone: hotelData?.phone ?? "",
      email: hotelData?.email ?? "",
    }),
    [hotelData]
  )

  const form = useForm<HotelFormValues>({
    resolver: zodResolver(hotelFormSchema),
    defaultValues: initialValues,
  })

  useEffect(() => {
    setExistingImageUrls(Array.isArray(hotelData?.images) ? hotelData.images : [])
  }, [hotelData?.images])

  useEffect(() => {
    return () => {
      selectedImages.forEach((image) => URL.revokeObjectURL(image.previewUrl))
    }
  }, [selectedImages])

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

  const onSubmit = async (values: HotelFormValues) => {
    // const payload = {
    //   ...values,
    //   images: selectedImages.map((image) => image.file),
    //   formType,
    // }

    // // upload image


    // // save hotel data

    // console.log("Hotel form submit payload:", payload)
    try {
      // Upload images first
      let uploadImageUrls: string[] = [];
      for (const item of selectedImages) {
        const uploadResult = await uploadFile(item.file, `hotels/${item.file.name}`);
        if (uploadResult.success && uploadResult.url) {
          uploadImageUrls.push(uploadResult.url);
        } else {
          console.error("Failed to upload image:", item.file.name, uploadResult.message);
        }
      }

      if (!loggedInUser?.id) {
        toast.error("Please login again to continue")
        return
      }

      const allImages = [...existingImageUrls, ...uploadImageUrls]
      let response: { success: boolean; message?: string } | null = null
      if (formType === "add") {
         response = await createHotel({
          ...values,
          images: allImages,
          status: "pending",
          owner_id: loggedInUser.id,
        })
      } else {
        if (!hotelData?.id) {
          toast.error("Hotel id is missing")
          return
        }

        response = await editHotelById(hotelData.id, {
          ...values,
          images: allImages,
        })
      }
      if (response?.success) {
         toast.success(
          response?.message ||
            (formType === "edit"
              ? "Hotel updated successfully!"
              : "Hotel created successfully!")
         )
          form.reset();
          setSelectedImages([]);
          router.push("/hotel_owner/hotels");
      } else {
        toast.error(
          response?.message ||
            (formType === "edit"
              ? "Failed to update hotel. Please try again."
              : "Failed to create hotel. Please try again.")
        )
      }

      
    } catch (error : any) {
      console.error("Error submitting hotel form:", error)      
    } finally {
    
    }
  }

  return (
    <section className="rounded-lg border border-border bg-card p-4 shadow-sm sm:p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hotel Name</FormLabel>
                  <Input placeholder="Enter hotel name" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />

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
                  <p className="text-sm text-muted-foreground">Existing Images</p>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {existingImageUrls.map((imageUrl, index) => (
                      <div
                        key={`${imageUrl}-${index}`}
                        className="flex flex-col gap-2 rounded-md border border-border bg-background p-2"
                      >
                        <img
                          src={imageUrl}
                          alt={`Hotel image ${index + 1}`}
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
                  <p className="text-sm text-muted-foreground">New Selected Images</p>
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

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem className="md:col-span-1">
                    <FormLabel>City</FormLabel>
                    <Input placeholder="Enter city" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="md:col-span-1">
                    <FormLabel>Address</FormLabel>
                    <Input placeholder="Enter hotel address" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="md:col-span-1">
                    <FormLabel>Mobile</FormLabel>
                    <Input placeholder="Enter mobile number" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="md:col-span-1">
                    <FormLabel>Email</FormLabel>
                    <Input type="email" placeholder="Enter email address" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              className={cn("min-w-28", formType === "edit" && "min-w-32")}
            >
              {formType === "edit" ? "Update Hotel" : "Add Hotel"}
            </Button>
          </div>
        </form>
      </Form>
    </section>
  )
}

export default HotelForm