"use client"

import Image from "next/image"
import { useState } from "react"
import { cn } from "@/lib/utils"

export default function DashboardAvatar({ user, className }: {
  user: { name: string; email: string; image?: string | null }
  className?: string
}) {
  const [failedImage, setFailedImage] = useState<string | null>(null)
  const initials = (user.name.trim() || user.email).split(/\s+/).slice(0, 2)
    .map((word) => word.charAt(0)).join("").toUpperCase()
  const image = user.image?.trim()

  return (
    <span aria-hidden="true" className={cn("relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-full border border-primary/20 bg-secondary text-xs font-bold text-secondary-foreground", className)}>
      {image && /^https?:\/\//i.test(image) && failedImage !== image ? (
        <Image src={image} alt="" fill unoptimized sizes="64px" referrerPolicy="no-referrer" className="object-cover" onError={() => setFailedImage(image)} />
      ) : initials}
    </span>
  )
}
