export const PHONE_MAX_LENGTH = 32
export const ADDRESS_MAX_LENGTH = 500

export function validatePhoneNumber(value: unknown) {
  if (typeof value !== "string") return "Enter a valid phone number."

  const phone = value.trim()
  if (!phone) return

  const digits = phone.replace(/\D/g, "").length
  if (phone.length > PHONE_MAX_LENGTH || !/^\+?[0-9(). -]+$/.test(phone) || digits < 7 || digits > 15) {
    return "Enter a phone number with 7 to 15 digits. You can include a country code."
  }
}

export function validateAddress(value: unknown) {
  if (typeof value !== "string") return "Enter a valid address."
  if (value.trim().length > ADDRESS_MAX_LENGTH) return `Use ${ADDRESS_MAX_LENGTH} characters or fewer for your address.`
}
