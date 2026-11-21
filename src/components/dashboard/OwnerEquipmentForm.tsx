"use client"

import { ApiError } from "@/lib/api/errors"
import { useRef, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createEquipment, updateEquipment, uploadEquipmentImage } from "@/lib/api/equipment"
import {
  EQUIPMENT_CATEGORIES, EQUIPMENT_CONDITIONS, RENTAL_TYPES,
  type CreateEquipmentPayload, type Equipment,
} from "@/types/equipment"

const selectClass = "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-ring"
const textareaClass = "min-h-24 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-ring"
const imageTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"]

function readImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => typeof reader.result === "string"
      ? resolve(reader.result)
      : reject(new Error("Could not read the selected image."))
    reader.onerror = () => reject(new Error("Could not read the selected image."))
    reader.readAsDataURL(file)
  })
}

type Props = {
  equipment?: Equipment
  onSaved?: (equipment: Equipment) => void
  onCancel?: () => void
}

export default function OwnerEquipmentForm({ equipment, onSaved, onCancel }: Props) {
  const router = useRouter()
  const [image, setImage] = useState<File | null>(null)
  const uploadedImage = useRef<string | null>(null)
  const saving = useRef(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving.current) return

    const fields = new FormData(event.currentTarget)
    const text = (field: string) => String(fields.get(field) ?? "").trim()
    const category = EQUIPMENT_CATEGORIES.find((value) => value === text("category"))
    const rentalType = RENTAL_TYPES.find((value) => value === text("rentalType"))
    const condition = EQUIPMENT_CONDITIONS.find((value) => value === text("condition"))
    const price = Number(text("price"))
    const quantity = text("availableQuantity")
    const availableQuantity = Number(quantity)
    const { name, location, description, terms, brand, model } = {
      name: text("name"), location: text("location"), description: text("description"),
      terms: text("terms"), brand: text("brand"), model: text("model"),
    }

    if (!name || !location || !description || !terms || !category || !rentalType || !condition) {
      setError("Complete all required equipment fields.")
      return
    }
    if (!Number.isFinite(price) || price <= 0 || !quantity || !Number.isSafeInteger(availableQuantity) || availableQuantity < 0) {
      setError("Enter a price above zero and a whole available quantity of zero or more.")
      return
    }
    if (image && (!imageTypes.includes(image.type) || image.size === 0 || image.size > 3 * 1024 * 1024)) {
      setError("Choose a PNG, JPEG, GIF, or WebP image up to 3 MB.")
      return
    }
    if (!image && !equipment) {
      setError("Choose an equipment image.")
      return
    }
    if ((equipment?.brand && !brand) || (equipment?.model && !model)) {
      setError("Enter a value for any existing brand or model.")
      return
    }

    saving.current = true
    setIsSaving(true)
    setError(null)
    let created = false
    try {
      if (image && !uploadedImage.current) {
        uploadedImage.current = await uploadEquipmentImage(await readImage(image))
      }

      const payload: CreateEquipmentPayload = {
        name, location, description, terms, category, rentalType, condition,
        price, availableQuantity, brand: brand || undefined, model: model || undefined,
        imageUrl: uploadedImage.current ?? equipment?.imageUrl ?? "",
      }

      if (equipment) {
        const changes = Object.fromEntries(
          (Object.keys(payload) as (keyof CreateEquipmentPayload)[])
            .filter((key) => payload[key] !== undefined && payload[key] !== equipment[key])
            .map((key) => [key, payload[key]])
        )
        if (Object.keys(changes).length === 0) {
          onCancel?.()
          return
        }
        const updated = await updateEquipment(equipment._id, changes)
        toast.success("Equipment updated.")
        onSaved?.(updated)
      } else {
        await createEquipment(payload)
        created = true
        toast.success("Equipment submitted for approval.")
        router.push("/dashboard/owner/equipment")
      }
    } catch (error) {
      setError(error instanceof ApiError ? error.message : "Could not save this equipment.")
    } finally {
      if (!created) {
        saving.current = false
        setIsSaving(false)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border bg-card p-5 sm:p-7">
      <h2 className="font-heading text-xl font-semibold">{equipment ? "Edit equipment" : "Equipment listing"}</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {equipment ? "Update the listing information below." : "Your listing will be visible to customers after it is approved."}
      </p>

      <fieldset disabled={isSaving} className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5 text-sm font-medium">Equipment name<Input name="name" required defaultValue={equipment?.name} /></label>
        <label className="space-y-1.5 text-sm font-medium">Location<Input name="location" required defaultValue={equipment?.location} /></label>
        <label className="space-y-1.5 text-sm font-medium">Category
          <select name="category" className={selectClass} required defaultValue={equipment?.category ?? ""}>
            <option value="" disabled>Select category</option>
            {EQUIPMENT_CATEGORIES.map((value) => <option key={value}>{value}</option>)}
          </select>
        </label>
        <label className="space-y-1.5 text-sm font-medium">Rental period
          <select name="rentalType" className={selectClass} required defaultValue={equipment?.rentalType ?? ""}>
            <option value="" disabled>Select period</option>
            {RENTAL_TYPES.map((value) => <option key={value} value={value}>{value[0].toUpperCase() + value.slice(1)}</option>)}
          </select>
        </label>
        <label className="space-y-1.5 text-sm font-medium">Rental price ($)<Input name="price" type="number" min="0" step="any" required defaultValue={equipment?.price} /></label>
        <label className="space-y-1.5 text-sm font-medium">Available quantity<Input name="availableQuantity" type="number" min="0" step="1" required defaultValue={equipment?.availableQuantity} /></label>
        <label className="space-y-1.5 text-sm font-medium">Condition
          <select name="condition" className={selectClass} required defaultValue={equipment?.condition ?? ""}>
            <option value="" disabled>Select condition</option>
            {EQUIPMENT_CONDITIONS.map((value) => <option key={value} value={value}>{value[0].toUpperCase() + value.slice(1)}</option>)}
          </select>
        </label>
        <label className="space-y-1.5 text-sm font-medium">Brand{equipment?.brand ? "" : " (optional)"}<Input name="brand" required={Boolean(equipment?.brand)} defaultValue={equipment?.brand} /></label>
        <label className="space-y-1.5 text-sm font-medium">Model{equipment?.model ? "" : " (optional)"}<Input name="model" required={Boolean(equipment?.model)} defaultValue={equipment?.model} /></label>
        <label className="space-y-1.5 text-sm font-medium">{equipment ? "Replace image (optional)" : "Equipment image"}
          <Input type="file" accept={imageTypes.join(",")} required={!equipment} onChange={(event) => {
            uploadedImage.current = null
            setImage(event.target.files?.[0] ?? null)
          }} />
          <span className="block text-xs font-normal text-muted-foreground">PNG, JPEG, GIF, or WebP up to 3 MB.</span>
        </label>
        <label className="space-y-1.5 text-sm font-medium sm:col-span-2">Description<textarea name="description" className={textareaClass} required defaultValue={equipment?.description} /></label>
        <label className="space-y-1.5 text-sm font-medium sm:col-span-2">Rental terms<textarea name="terms" className={textareaClass} required defaultValue={equipment?.terms} /></label>
      </fieldset>

      {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
      <div className="mt-6 flex flex-wrap gap-2">
        <Button type="submit" size="lg" disabled={isSaving}>{isSaving ? "Saving…" : equipment ? "Save changes" : "Submit for approval"}</Button>
        {onCancel && <Button type="button" variant="outline" size="lg" disabled={isSaving} onClick={onCancel}>Cancel</Button>}
      </div>
    </form>
  )
}
