"use client"

import Link from "next/link"
import { type LucideIcon } from "lucide-react"

type SidebarMenuItemProps = {
  label: string
  href?: string
  onClick?: () => void
  icon?: LucideIcon
  active?: boolean
  isLogout?: boolean
}

function SidebarMenuItem({
  href,
  label,
  onClick,
  icon: Icon,
  active = false,
  isLogout = false,
}: SidebarMenuItemProps) {
  const className = isLogout
    ? "bg-primary text-primary-foreground hover:bg-primary/90 block w-full rounded-md px-4 py-3 text-left text-base font-semibold transition-colors"
    : `hover:bg-accent hover:text-accent-foreground block w-full rounded-md px-4 py-3 text-left text-base font-medium transition-colors ${
        active ? "border border-ring" : ""
      }`

  const content = (
    <span className="flex items-center gap-3">
      {Icon ? <Icon className="size-5" /> : null}
      <span>{label}</span>
    </span>
  )

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={className}>
        {content}
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  )
}

export default SidebarMenuItem
