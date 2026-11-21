"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { EquipmentErrorState } from "@/components/equipment/EquipmentStates"
import TableSkeleton from "@/components/shared/TableSkeleton"
import { deleteEquipment, getAdminEquipment, getOwnedEquipment, moderateEquipment } from "@/lib/api/equipment"
import { ApiError } from "@/lib/api/errors"
import { EQUIPMENT_STATUSES, type Equipment, type EquipmentStatus } from "@/types/equipment"
import OwnerEquipmentForm from "./OwnerEquipmentForm"

const statusClass = {
  approved: "bg-secondary text-secondary-foreground",
  pending: "bg-muted text-foreground",
  rejected: "bg-destructive/10 text-destructive",
}

type ListState = { items: Equipment[] } | { error: string } | null

export default function EquipmentManagementList({ mode }: { mode: "owner" | "admin" }) {
  const admin = mode === "admin"
  const [result, setResult] = useState<ListState>(null)
  const [attempt, setAttempt] = useState(0)
  const [editing, setEditing] = useState<Equipment | null>(null)
  const [confirming, setConfirming] = useState<Equipment | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [moderating, setModerating] = useState(false)
  const [moderationError, setModerationError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<EquipmentStatus | "">("")
  const deleting = useRef(false)
  const moderationPending = useRef(false)
  const confirmationRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const controller = new AbortController()
    const load = admin ? getAdminEquipment : getOwnedEquipment
    load(controller.signal)
      .then((items) => {
        if (!controller.signal.aborted) setResult({ items })
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setResult({ error: error instanceof ApiError ? error.message : "Could not load equipment." })
        }
      })
    return () => controller.abort()
  }, [admin, attempt])

  useEffect(() => {
    if (confirming) confirmationRef.current?.focus()
  }, [confirming])

  if (!result) {
    return <TableSkeleton label="Loading equipment listings…" />
  }
  if ("error" in result) {
    return <EquipmentErrorState message={result.error} onRetry={() => {
      setResult(null)
      setAttempt((current) => current + 1)
    }} />
  }

  function replaceListing(updated: Equipment) {
    setResult((current) => current && "items" in current
      ? { items: current.items.map((item) => item._id === updated._id ? updated : item) }
      : current)
  }
  function removeFromList(id: string) {
    setResult((current) => current && "items" in current
      ? { items: current.items.filter((item) => item._id !== id) }
      : current)
  }

  async function handleDelete(item: Equipment) {
    if (deleting.current) return
    deleting.current = true
    setIsDeleting(true)
    setDeleteError(null)
    try {
      await deleteEquipment(item._id)
      removeFromList(item._id)
      setConfirming(null)
      toast.success("Equipment deleted.")
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        removeFromList(item._id)
        setConfirming(null)
        toast.info("This listing has already been removed.")
      } else {
        const message = error instanceof ApiError ? error.message : "Could not delete this equipment."
        setDeleteError(message)
        toast.error("Could not delete equipment.", { description: message })
      }
    } finally {
      deleting.current = false
      setIsDeleting(false)
    }
  }

  async function handleModeration(item: Equipment, status: Exclude<EquipmentStatus, "pending">) {
    if (moderationPending.current) return
    moderationPending.current = true
    setModerating(true)
    setModerationError(null)
    try {
      replaceListing(await moderateEquipment(item._id, status))
      toast.success(status === "approved" ? "Equipment approved." : "Equipment rejected.")
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) removeFromList(item._id)
      const message = error instanceof ApiError ? error.message : "Could not change the approval status."
      setModerationError(message)
      toast.error("Could not change listing approval.", { description: message })
    } finally {
      moderationPending.current = false
      setModerating(false)
    }
  }

  if (editing) {
    return <OwnerEquipmentForm equipment={editing} onCancel={() => setEditing(null)} onSaved={(updated) => {
      replaceListing(updated)
      setEditing(null)
    }} />
  }

  const items = statusFilter ? result.items.filter((item) => item.status === statusFilter) : result.items
  const actionsDisabled = Boolean(confirming) || moderating

  return (
    <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 p-5 sm:px-7">
        <h2 id="equipment-listings" className="font-heading text-xl font-semibold">{admin ? "Equipment listings" : "Your listings"}</h2>
        {admin ? (
          <label className="flex items-center gap-2 text-sm font-medium">
            Status
            <select className="h-9 rounded-lg border bg-background px-3" value={statusFilter} onChange={(event) => {
              setStatusFilter(EQUIPMENT_STATUSES.find((status) => status === event.target.value) ?? "")
            }}>
              <option value="">All statuses</option>
              {EQUIPMENT_STATUSES.map((status) => <option key={status} value={status}>{status[0].toUpperCase() + status.slice(1)}</option>)}
            </select>
          </label>
        ) : (
          <Button size="lg" nativeButton={false} render={<Link href="/dashboard/owner/add-equipment" />}>
            <Plus aria-hidden="true" data-icon="inline-start" /> Add equipment
          </Button>
        )}
      </div>

      {moderating && <p role="status" className="px-5 pb-4 text-sm text-muted-foreground sm:px-7">Updating approval status…</p>}
      {moderationError && <p role="alert" className="px-5 pb-4 text-sm text-destructive sm:px-7">{moderationError}</p>}

      {confirming && (
        <div ref={confirmationRef} tabIndex={-1} role="group" aria-labelledby="delete-listing-title" className="mx-5 mb-5 space-y-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 sm:mx-7">
          <p id="delete-listing-title" className="text-sm font-semibold">Delete {confirming.name}?</p>
          <p className="text-sm text-muted-foreground">This permanently removes the listing.</p>
          {deleteError && <p role="alert" className="text-sm text-destructive">{deleteError}</p>}
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="destructive" disabled={isDeleting} onClick={() => void handleDelete(confirming)}>
              {isDeleting ? "Deleting…" : "Delete listing"}
            </Button>
            <Button type="button" variant="outline" disabled={isDeleting} onClick={() => setConfirming(null)}>Cancel</Button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="border-t px-5 py-10 text-center">
          <h3 className="font-heading font-semibold">{statusFilter ? "No listings match this status" : "No equipment listed yet"}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{statusFilter ? "Choose another status or clear the filter." : admin ? "New equipment listings will appear here for review." : "Use Add equipment to submit your first listing."}</p>
          {statusFilter && <Button type="button" variant="outline" className="mt-4" onClick={() => setStatusFilter("")}>Clear status filter</Button>}
        </div>
      ) : (
        <div role="region" aria-labelledby="equipment-listings" tabIndex={0} className="dashboard-table border-t focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                {["Equipment", ...(admin ? ["Owner"] : []), "Category", "Rental price", "Quantity", "Status", "Actions"].map((column) => (
                  <th key={column} scope="col" className="px-5 py-3 font-medium whitespace-nowrap">{column}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((item) => (
                <tr key={item._id}>
                  <th scope="row" className="min-w-36 px-5 py-3 text-left font-semibold">{item.name}</th>
                  {admin && <td className="min-w-36 px-5 py-3">{item.ownerName}</td>}
                  <td className="px-5 py-3">{item.category}</td>
                  <td className="px-5 py-3 whitespace-nowrap">${item.price} · {item.rentalType}</td>
                  <td className="px-5 py-3">{item.availableQuantity}</td>
                  <td className="px-5 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusClass[item.status]}`}>{item.status}</span></td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="outline" nativeButton={false} render={<Link href={`/equipment/${item._id}`} />} aria-label={`View details for ${item.name}`}>View details</Button>
                      {admin && item.status !== "approved" && <Button type="button" size="sm" variant="secondary" disabled={actionsDisabled} onClick={() => void handleModeration(item, "approved")} aria-label={`Approve ${item.name}`}>Approve</Button>}
                      {admin && item.status !== "rejected" && <Button type="button" size="sm" variant="outline" disabled={actionsDisabled} onClick={() => void handleModeration(item, "rejected")} aria-label={`Reject ${item.name}`}>Reject</Button>}
                      <Button type="button" size="sm" variant="outline" disabled={actionsDisabled} onClick={() => setEditing(item)} aria-label={`Edit ${item.name}`}>Edit</Button>
                      <Button type="button" size="sm" variant="destructive" disabled={actionsDisabled} onClick={() => {
                        setDeleteError(null)
                        setConfirming(item)
                      }} aria-label={`Delete ${item.name}`}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
