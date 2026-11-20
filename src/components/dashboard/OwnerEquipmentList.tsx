"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { EquipmentErrorState } from "@/components/equipment/EquipmentStates"
import { deleteEquipment, getOwnedEquipment } from "@/lib/api/equipment"
import { ApiError } from "@/lib/api/errors"
import type { Equipment } from "@/types/equipment"
import OwnerEquipmentForm from "./OwnerEquipmentForm"

const statusClass = {
  approved: "bg-secondary text-secondary-foreground",
  pending: "bg-muted text-foreground",
  rejected: "bg-destructive/10 text-destructive",
}

type ListState = { items: Equipment[] } | { error: string } | null

export default function OwnerEquipmentList() {
  const [result, setResult] = useState<ListState>(null)
  const [attempt, setAttempt] = useState(0)
  const [editing, setEditing] = useState<Equipment | null>(null)
  const [confirming, setConfirming] = useState<Equipment | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const deleting = useRef(false)
  const confirmationRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const controller = new AbortController()
    getOwnedEquipment(controller.signal)
      .then((items) => {
        if (!controller.signal.aborted) setResult({ items })
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setResult({ error: error instanceof Error ? error.message : "Could not load your equipment." })
        }
      })
    return () => controller.abort()
  }, [attempt])

  useEffect(() => {
    if (confirming) confirmationRef.current?.focus()
  }, [confirming])

  if (!result) {
    return <p role="status" className="rounded-2xl border bg-card p-6 text-muted-foreground">Loading your equipment…</p>
  }
  if ("error" in result) {
    return <EquipmentErrorState message={result.error} onRetry={() => {
      setResult(null)
      setAttempt((current) => current + 1)
    }} />
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
        setDeleteError(error instanceof Error ? error.message : "Could not delete this equipment.")
      }
    } finally {
      deleting.current = false
      setIsDeleting(false)
    }
  }

  if (editing) {
    return <OwnerEquipmentForm equipment={editing} onCancel={() => setEditing(null)} onSaved={(updated) => {
      setResult({ items: result.items.map((item) => item._id === updated._id ? updated : item) })
      setEditing(null)
    }} />
  }

  return (
    <section className="overflow-hidden rounded-2xl border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 p-5 sm:px-7">
        <h2 id="owner-equipment" className="font-heading text-xl font-semibold">Your listings</h2>
        <Button size="lg" nativeButton={false} render={<Link href="/dashboard/owner/add-equipment" />}>
          <Plus aria-hidden="true" data-icon="inline-start" /> Add equipment
        </Button>
      </div>

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

      {result.items.length === 0 ? (
        <p className="border-t p-5 text-sm text-muted-foreground sm:px-7">Your equipment listings will appear here.</p>
      ) : (
        <div role="region" aria-labelledby="owner-equipment" tabIndex={0} className="overflow-x-auto border-t focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                {["Equipment", "Category", "Rental price", "Quantity", "Status", "Actions"].map((column) => (
                  <th key={column} scope="col" className="px-5 py-3 font-medium whitespace-nowrap">{column}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {result.items.map((item) => (
                <tr key={item._id}>
                  <th scope="row" className="min-w-36 px-5 py-3 text-left font-semibold">{item.name}</th>
                  <td className="px-5 py-3">{item.category}</td>
                  <td className="px-5 py-3 whitespace-nowrap">${item.price} · {item.rentalType}</td>
                  <td className="px-5 py-3">{item.availableQuantity}</td>
                  <td className="px-5 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusClass[item.status]}`}>{item.status}</span></td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="outline" nativeButton={false} render={<Link href={`/equipment/${item._id}`} />} aria-label={`View details for ${item.name}`}>View details</Button>
                      <Button type="button" size="sm" variant="outline" disabled={Boolean(confirming)} onClick={() => setEditing(item)} aria-label={`Edit ${item.name}`}>Edit</Button>
                      <Button type="button" size="sm" variant="destructive" disabled={Boolean(confirming)} onClick={() => {
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
