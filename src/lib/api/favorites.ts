import type { EquipmentCardItem } from "@/types/equipment"
import { apiRequestList, apiRequestMessage } from "./client"

export async function getFavorites(signal?: AbortSignal): Promise<EquipmentCardItem[]> {
  const { data } = await apiRequestList<EquipmentCardItem>("/api/favorites", { auth: "protected", signal })
  return data
}

export async function addFavorite(equipmentId: string): Promise<void> {
  await apiRequestMessage("/api/favorites", {
    auth: "protected", method: "POST", body: { equipmentId },
  })
}

export async function removeFavorite(equipmentId: string): Promise<void> {
  await apiRequestMessage(`/api/favorites/${encodeURIComponent(equipmentId)}`, {
    auth: "protected", method: "DELETE",
  })
}
