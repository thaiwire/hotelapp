"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"

import { Button } from "@/components/ui/button"

export default function LogoutButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    Cookies.remove("token")
    setOpen(false)
    router.push("/login")
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Logout
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-lg">
            <h2 className="text-lg font-semibold">Confirm logout</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Are you sure you want to logout from your account?
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleLogout}>
                Confirm Logout
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
