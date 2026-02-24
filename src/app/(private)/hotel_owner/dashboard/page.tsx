import LogoutButton from "@/components/logout-button"
import { getLoggedInUser } from "@/actions/users"
import { getDateFormat, getTimeFormat } from "@/helpers"

export default async function HotelOwnerDashboardPage() {
  const currentUserResponse = await getLoggedInUser()
  const user = currentUserResponse.success ? currentUserResponse.user : null

  return (
    <main className="min-h-screen bg-background p-6 md:p-10">
      <section className="mx-auto max-w-6xl space-y-6">
        <header className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Hotel Owner Dashboard</p>
            <h1 className="text-3xl font-bold">Manage your properties</h1>
            <p className="text-muted-foreground">
              Keep room inventory, reservations, and property performance in one place.
            </p>
          </div>
          <LogoutButton />
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">Listed Hotels</p>
            <p className="mt-2 text-2xl font-semibold">0</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">Today Check-ins</p>
            <p className="mt-2 text-2xl font-semibold">0</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">Pending Requests</p>
            <p className="mt-2 text-2xl font-semibold">0</p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-lg font-semibold">Owner Profile</h2>

          {user ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{user.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="font-medium">{user.role || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium">{user.status || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created at</p>
                <p className="font-medium">{getDateFormat(user.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created time</p>
                <p className="font-medium">{getTimeFormat(user.created_at)}</p>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-destructive">
              {currentUserResponse.message || "Unable to fetch user profile"}
            </p>
          )}
        </div>
      </section>
    </main>
  )
}
