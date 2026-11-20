import { cn } from "cn"
import type { Equipment } from "@/types/equipment"
import EquipmentCard from "./EquipmentCard"

type EquipmentGridProps = {
  equipment: Equipment[]
  className?: string
}

// Responsive 1 / 2 / 3 column grid used by the All Equipment page.
const EquipmentGrid = ({ equipment, className }: EquipmentGridProps) => {
  return (
    <div
      className={cn(
        "grid gap-6 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {equipment.map((item) => (
        <EquipmentCard key={item._id} equipment={item} />
      ))}
    </div>
  )
}

export default EquipmentGrid
