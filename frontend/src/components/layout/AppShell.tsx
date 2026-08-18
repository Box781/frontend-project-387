import { NavLink, Outlet } from 'react-router'
import { CalendarClock } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { to: '/', label: 'Запись', end: true },
  { to: '/admin', label: 'Встречи', end: true },
  { to: '/admin/event-types', label: 'Типы событий', end: false },
]

export function AppShell() {
  return (
    <div className="min-h-svh bg-neutral-100 text-foreground">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <NavLink to="/" className="flex items-center gap-2 font-medium">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <CalendarClock className="size-4" />
            </span>
            Call Booking
          </NavLink>
          <nav className="flex items-center gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  cn(
                    'rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                    isActive && 'bg-muted font-medium text-foreground',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
