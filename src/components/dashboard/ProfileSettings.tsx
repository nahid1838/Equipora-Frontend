"use client"

import { useState, type FormEvent } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"

type Props = { name: string; email: string; image: string; role: string }

function isPhotoUrl(value: string) {
  try {
    const url = new URL(value)
    return (url.protocol === "https:" || url.protocol === "http:") && !url.username && !url.password
  } catch {
    return false
  }
}

export default function ProfileSettings({ name, email, image, role }: Props) {
  const router = useRouter()
  const [draftName, setDraftName] = useState(name)
  const [draftImage, setDraftImage] = useState(image)
  const [saved, setSaved] = useState({ name, image })
  const [failedImage, setFailedImage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null)

  const nameChanged = draftName.trim() !== saved.name
  const imageChanged = draftImage.trim() !== saved.image
  const hasChanges = nameChanged || imageChanged
  const initials = (saved.name.trim() || email).split(/\s+/).slice(0, 2).map((word) => word[0]).join("").toUpperCase()

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSaving || !hasChanges) return

    const nextName = draftName.trim()
    const nextImage = draftImage.trim()
    if (!nextName) {
      setMessage({ text: "Enter your name.", error: true })
      return
    }
    if (imageChanged && nextImage && !isPhotoUrl(nextImage)) {
      setMessage({ text: "Enter a valid HTTP or HTTPS photo URL.", error: true })
      return
    }

    setIsSaving(true)
    setMessage(null)
    try {
      const { error } = await authClient.updateUser({
        ...(nameChanged ? { name: nextName } : {}),
        ...(imageChanged ? { image: nextImage || null } : {}),
      })
      if (error) {
        setMessage({ text: error.message || "Could not save your profile.", error: true })
        return
      }

      setSaved({ name: nextName, image: nextImage })
      setDraftName(nextName)
      setDraftImage(nextImage)
      setFailedImage(null)
      setMessage({ text: "Profile updated.", error: false })
      router.refresh()
    } catch {
      setMessage({ text: "Could not save your profile. Please try again.", error: true })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="max-w-3xl overflow-hidden rounded-2xl border bg-card">
      <div className="flex items-center gap-4 border-b bg-secondary/35 p-5 sm:p-7">
        <span className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-full bg-secondary font-heading text-xl font-semibold text-secondary-foreground">
          {saved.image !== failedImage && isPhotoUrl(saved.image) ? (
            <Image src={saved.image} alt="" fill unoptimized sizes="64px" referrerPolicy="no-referrer" className="object-cover" onError={() => setFailedImage(saved.image)} />
          ) : <span aria-hidden="true">{initials}</span>}
        </span>
        <div className="min-w-0">
          <h2 className="font-heading text-xl font-semibold break-words">{saved.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{role} account</p>
        </div>
      </div>

      <form className="p-5 sm:p-7" onSubmit={saveProfile} noValidate>
        <fieldset disabled={isSaving} className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-sm font-medium">
            Name
            <Input name="name" autoComplete="name" value={draftName} onChange={(event) => setDraftName(event.target.value)} required />
          </label>
          <label className="space-y-1.5 text-sm font-medium">
            Email address
            <Input type="email" value={email} readOnly className="bg-muted/50" />
          </label>
          <label className="space-y-1.5 text-sm font-medium sm:col-span-2">
            Profile photo URL
            <Input type="url" autoComplete="url" name="image" value={draftImage} onChange={(event) => setDraftImage(event.target.value)} placeholder="https://example.com/photo.jpg" aria-describedby="photo-url-help" />
            <span id="photo-url-help" className="block text-xs font-normal text-muted-foreground">Leave this field blank to remove your profile photo.</span>
          </label>
        </fieldset>

        {message && (
          <p role={message.error ? "alert" : "status"} className={`mt-4 text-sm ${message.error ? "text-destructive" : "text-foreground"}`}>
            {message.text}
          </p>
        )}
        <Button className="mt-5" size="lg" type="submit" disabled={isSaving || !hasChanges}>
          {isSaving ? "Saving…" : "Save changes"}
        </Button>
      </form>
    </section>
  )
}
