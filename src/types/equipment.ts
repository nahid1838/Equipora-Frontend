// Values must match the Express backend (src/models/equipment.ts).

export const EQUIPMENT_CATEGORIES = [
  "Construction",
  "Photography",
  "Vehicles & Transportation",
  "Agriculture",
  "Electronics",
  "Event",
] as const

export const RENTAL_TYPES = ["daily", "weekly", "monthly"] as const

export const EQUIPMENT_CONDITIONS = ["excellent", "good", "fair"] as const

export const EQUIPMENT_STATUSES = ["pending", "approved", "rejected"] as const

export type EquipmentCategory = (typeof EQUIPMENT_CATEGORIES)[number]
export type RentalType = (typeof RENTAL_TYPES)[number]
export type EquipmentCondition = (typeof EQUIPMENT_CONDITIONS)[number]
export type EquipmentStatus = (typeof EQUIPMENT_STATUSES)[number]

// Full equipment document as returned by the API.
// MongoDB ObjectIds and dates are serialized as strings in JSON.
export type Equipment = {
  _id: string
  name: string
  description: string
  category: EquipmentCategory
  location: string
  price: number
  rentalType: RentalType
  availableQuantity: number
  condition: EquipmentCondition
  brand?: string
  model?: string
  imageUrl: string
  terms: string
  status: EquipmentStatus
  ownerId: string
  ownerName: string
  ownerEmail: string
  createdAt: string
  updatedAt: string
}

export type EquipmentCardItem = Pick<Equipment,
  "_id" | "name" | "category" | "location" | "price" | "rentalType" | "availableQuantity" | "imageUrl"
>

// Fields an owner sends when creating equipment.
// Server-controlled fields (status, owner info, timestamps) are excluded.
export type CreateEquipmentPayload = {
  name: string
  description: string
  category: EquipmentCategory
  location: string
  price: number
  rentalType: RentalType
  availableQuantity: number
  condition: EquipmentCondition
  brand?: string
  model?: string
  imageUrl: string
  terms: string
}

// PATCH sends only the fields that changed.
export type UpdateEquipmentPayload = Partial<CreateEquipmentPayload>

export type EquipmentSort = "price_asc" | "price_desc" | "newest"

// Query parameters accepted by GET /api/equipment.
export type EquipmentQuery = {
  search?: string
  category?: EquipmentCategory
  rentalType?: RentalType
  minPrice?: number
  maxPrice?: number
  available?: boolean
  sort?: EquipmentSort
  page?: number
  limit?: number
}
