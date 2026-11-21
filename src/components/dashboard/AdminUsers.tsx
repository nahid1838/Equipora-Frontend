"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import { redirect } from "next/navigation"
import { Search } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EquipmentErrorState } from "@/components/equipment/EquipmentStates"
import TableSkeleton from "@/components/shared/TableSkeleton"
import { getAdminUsers, updateUserRole, USER_ROLES, type AdminUser, type UserRole } from "@/lib/api/dashboard"
import { ApiError } from "@/lib/api/errors"

const roleLabels = { customer: "Customer", owner: "Owner", admin: "Admin" }
const selectClass = "h-9 min-w-0 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-ring"
const dates = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" })

export default function AdminUsers({ viewerId, viewerEmail }: { viewerId: string; viewerEmail: string }) {
  const [search, setSearch] = useState("")
  const [query, setQuery] = useState({ search: "", role: "" as UserRole | "", page: 1 })
  const [result, setResult] = useState<Awaited<ReturnType<typeof getAdminUsers>> | ApiError | null>(null)
  const [selected, setSelected] = useState<AdminUser | null>(null)
  const [nextRole, setNextRole] = useState<UserRole>("customer")
  const [saving, setSaving] = useState(false)
  const [roleError, setRoleError] = useState<string | null>(null)
  const pending = useRef(false)
  const dialog = useRef<HTMLDialogElement>(null)
  const trigger = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    getAdminUsers(query, controller.signal)
      .then((response) => {
        if (controller.signal.aborted) return
        const lastPage = Math.max(1, response.pagination?.totalPages ?? 1)
        if (query.page > lastPage) {
          setQuery({ ...query, page: lastPage })
          return
        }
        setResult(response)
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setResult(error instanceof ApiError ? error : new ApiError("Could not load users."))
      })
    return () => controller.abort()
  }, [query])

  function load(next: typeof query) {
    setResult(null)
    setQuery({ ...next })
  }

  if (result instanceof ApiError) {
    if (result.status === 401) redirect("/sign-in?returnTo=%2Fdashboard%2Fadmin%2Fusers")
    if (result.status === 403) redirect("/dashboard")
  }

  function isSelf(user: AdminUser) {
    return user._id === viewerId || user.email.toLowerCase() === viewerEmail.toLowerCase()
  }

  async function saveRole(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selected || isSelf(selected) || nextRole === selected.role || pending.current) return
    pending.current = true
    setSaving(true)
    setRoleError(null)
    try {
      await updateUserRole(selected._id, nextRole)
      dialog.current?.close()
      toast.success("User role updated.")
      load(query)
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        dialog.current?.close()
        setResult(error)
      } else {
        setRoleError(error instanceof ApiError ? error.message : "Could not update the user role.")
      }
    } finally {
      pending.current = false
      setSaving(false)
    }
  }

  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border bg-card" aria-labelledby="users-heading">
      <div className="space-y-4 p-4 sm:p-6">
        <h2 id="users-heading" className="font-heading text-xl font-semibold">User accounts</h2>
        <div className="flex flex-wrap items-end gap-3">
          <form className="flex min-w-0 grow flex-wrap items-end gap-2" onSubmit={(event) => {
            event.preventDefault()
            load({ ...query, search: search.trim(), page: 1 })
          }}>
            <label className="min-w-0 grow space-y-1 text-sm font-medium">
              Search users
              <Input className="h-9" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name or email" />
            </label>
            <Button size="lg" type="submit" variant="outline"><Search aria-hidden="true" data-icon="inline-start" />Search</Button>
          </form>
          <label className="grid gap-1 text-sm font-medium">
            Role
            <select className={selectClass} value={query.role} onChange={(event) => {
              const role = USER_ROLES.find((value) => value === event.target.value) ?? ""
              load({ ...query, role, page: 1 })
            }}>
              <option value="">All roles</option>
              {USER_ROLES.map((role) => <option key={role} value={role}>{roleLabels[role]}</option>)}
            </select>
          </label>
        </div>
      </div>

      {!result ? (
        <div className="p-4 sm:p-6"><TableSkeleton label="Loading users…" /></div>
      ) : result instanceof ApiError ? (
        <div className="p-4 sm:p-6"><EquipmentErrorState title="Could not load users" message={result.message} onRetry={() => load(query)} /></div>
      ) : result.data.length === 0 ? (
        <div className="border-t px-5 py-10 text-center">
          <h3 className="font-heading font-semibold">{query.search || query.role ? "No users match the current filters" : "No user accounts to display"}</h3>
          {(query.search || query.role) && <Button type="button" variant="outline" className="mt-4" onClick={() => {
            setSearch("")
            load({ search: "", role: "", page: 1 })
          }}>Clear filters</Button>}
        </div>
      ) : (
        <>
          <div role="region" aria-labelledby="users-heading" tabIndex={0} className="overflow-x-auto border-t focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring">
            <table className="w-full min-w-[38rem] text-left text-sm">
              <thead className="border-b bg-muted/50">
                <tr>{["Name", "Email", "Role", "Registration date", "Actions"].map((label) => <th key={label} scope="col" className="px-4 py-3 font-medium whitespace-nowrap">{label}</th>)}</tr>
              </thead>
              <tbody className="divide-y">
                {result.data.map((user) => (
                  <tr key={user._id}>
                    <th scope="row" className="max-w-48 px-4 py-3 font-semibold break-words">{user.name}</th>
                    <td className="max-w-56 px-4 py-3 break-all text-muted-foreground">{user.email}</td>
                    <td className="px-4 py-3"><span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">{roleLabels[user.role]}</span></td>
                    <td className="px-4 py-3 whitespace-nowrap">{dates.format(new Date(user.createdAt))}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {isSelf(user) ? <span className="text-muted-foreground">Your account</span> : (
                        <Button type="button" variant="outline" onClick={(event) => {
                          trigger.current = event.currentTarget
                          setSelected(user)
                          setNextRole(user.role)
                          setRoleError(null)
                          dialog.current?.showModal()
                        }} aria-label={`Change role for ${user.name}`}>Change role</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {result.pagination && result.pagination.totalPages > 1 && (
            <nav aria-label="User pages" className="flex flex-wrap items-center justify-between gap-2 border-t p-4 text-sm">
              <Button type="button" variant="outline" disabled={query.page === 1} onClick={() => load({ ...query, page: query.page - 1 })}>Previous</Button>
              <span>Page {query.page} of {result.pagination.totalPages}</span>
              <Button type="button" variant="outline" disabled={query.page >= result.pagination.totalPages} onClick={() => load({ ...query, page: query.page + 1 })}>Next</Button>
            </nav>
          )}
        </>
      )}

      <dialog ref={dialog} aria-labelledby="change-role-title" onCancel={(event) => { if (pending.current) event.preventDefault() }} onClose={() => trigger.current?.focus()} className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-sm overflow-y-auto rounded-2xl border bg-card p-5 text-foreground shadow-xl backdrop:bg-black/50">
        <form onSubmit={saveRole} className="space-y-4">
          <h3 id="change-role-title" className="font-heading text-xl font-semibold">Change user role</h3>
          {selected && <p className="break-words text-sm text-muted-foreground">{selected.name} · {selected.email}</p>}
          <label className="grid gap-1 text-sm font-medium">
            New role
            <select value={nextRole} disabled={saving} onChange={(event) => {
              const role = USER_ROLES.find((value) => value === event.target.value)
              if (role) setNextRole(role)
              setRoleError(null)
            }} className={selectClass}>
              {USER_ROLES.map((role) => <option key={role} value={role}>{roleLabels[role]}</option>)}
            </select>
          </label>
          {nextRole === "admin" && selected?.role !== "admin" && <p className="text-sm text-muted-foreground">This grants access to marketplace administration.</p>}
          {roleError && <p role="alert" className="text-sm text-destructive">{roleError}</p>}
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" type="button" disabled={saving} onClick={() => dialog.current?.close()}>Cancel</Button>
            <Button type="submit" disabled={saving || !selected || nextRole === selected.role}>{saving ? "Saving…" : "Save role"}</Button>
          </div>
        </form>
      </dialog>
    </section>
  )
}
