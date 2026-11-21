"use client"

import { useState, type FormEvent } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"
import { ADDRESS_MAX_LENGTH, PHONE_MAX_LENGTH, validateAddress, validatePhoneNumber } from "@/lib/profile-fields"

type Props = { name: string; email: string; image: string; role: string; phoneNumber: string; address: string }

function isPhotoUrl(value: string) {
  try {
    const url = new URL(value)
    return (url.protocol === "https:" || url.protocol === "http:") && !url.username && !url.password
  } catch {
    return false
  }
}

export default function ProfileSettings({ name, email, image, role, phoneNumber, address }: Props) {
  const router = useRouter()
  const [draftName, setDraftName] = useState(name)
  const [draftImage, setDraftImage] = useState(image)
  const [draftPhone, setDraftPhone] = useState(phoneNumber)
  const [draftAddress, setDraftAddress] = useState(address)
  const [saved, setSaved] = useState({ name, image, phoneNumber, address })
  const [fieldErrors, setFieldErrors] = useState<{ phoneNumber?: string; address?: string }>({})
  const [failedImage, setFailedImage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null)

  const nameChanged = draftName.trim() !== saved.name
  const imageChanged = draftImage.trim() !== saved.image
  const phoneChanged = draftPhone.trim() !== saved.phoneNumber
  const addressChanged = draftAddress.trim() !== saved.address
  const hasChanges = nameChanged || imageChanged || phoneChanged || addressChanged
  const initials = (saved.name.trim() || email).split(/\s+/).slice(0, 2).map((word) => word[0]).join("").toUpperCase()

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSaving || !hasChanges) return

    const nextName = draftName.trim()
    const nextImage = draftImage.trim()
    const nextPhone = draftPhone.trim()
    const nextAddress = draftAddress.trim()
    const phoneError = validatePhoneNumber(nextPhone)
    const addressError = validateAddress(nextAddress)
    setMessage(null)
    setFieldErrors({ phoneNumber: phoneError, address: addressError })
    if (phoneError || addressError) {
      event.currentTarget.querySelector<HTMLElement>(phoneError ? '[name="phoneNumber"]' : '[name="address"]')?.focus()
      return
    }
    if (!nextName) {
      setMessage({ text: "Enter your name.", error: true })
      return
    }
    if (imageChanged && nextImage && !isPhotoUrl(nextImage)) {
      setMessage({ text: "Enter a valid HTTP or HTTPS photo URL.", error: true })
      return
    }

    setIsSaving(true)
    try {
      const { error } = await authClient.updateUser({
        ...(nameChanged ? { name: nextName } : {}),
        ...(imageChanged ? { image: nextImage || null } : {}),
        ...(phoneChanged ? { phoneNumber: nextPhone } : {}),
        ...(addressChanged ? { address: nextAddress } : {}),
      })
      if (error) {
        setMessage({ text: "Could not save your profile. Check your connection or sign in again if your session expired.", error: true })
        return
      }

      setSaved({ name: nextName, image: nextImage, phoneNumber: nextPhone, address: nextAddress })
      setDraftName(nextName)
      setDraftImage(nextImage)
      setDraftPhone(nextPhone)
      setDraftAddress(nextAddress)
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
        <fieldset disabled={isSaving} className="grid min-w-0 gap-4 sm:grid-cols-2">
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
          <label className="space-y-1.5 text-sm font-medium">
            Phone number <span className="font-normal text-muted-foreground">(optional)</span>
            <Input
              type="tel" name="phoneNumber" autoComplete="tel" maxLength={PHONE_MAX_LENGTH}
              value={draftPhone}
              onChange={(event) => {
                setDraftPhone(event.target.value)
                setFieldErrors((errors) => ({ ...errors, phoneNumber: undefined }))
                setMessage(null)
              }}
              aria-invalid={fieldErrors.phoneNumber ? true : undefined}
              aria-describedby={fieldErrors.phoneNumber ? "profile-phone-error" : undefined}
            />
            {fieldErrors.phoneNumber && <span id="profile-phone-error" role="alert" className="block text-xs text-destructive">{fieldErrors.phoneNumber}</span>}
          </label>
          <label className="space-y-1.5 text-sm font-medium">
            Address <span className="font-normal text-muted-foreground">(optional)</span>
            <textarea
              name="address" autoComplete="street-address" rows={2} maxLength={ADDRESS_MAX_LENGTH}
              className="min-h-16 w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-base outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive disabled:opacity-50 md:text-sm dark:bg-input/30"
              value={draftAddress}
              onChange={(event) => {
                setDraftAddress(event.target.value)
                setFieldErrors((errors) => ({ ...errors, address: undefined }))
                setMessage(null)
              }}
              aria-invalid={fieldErrors.address ? true : undefined}
              aria-describedby={fieldErrors.address ? "profile-address-error" : undefined}
            />
            {fieldErrors.address && <span id="profile-address-error" role="alert" className="block text-xs text-destructive">{fieldErrors.address}</span>}
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
