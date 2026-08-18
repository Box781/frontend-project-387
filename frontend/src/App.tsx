import { BrowserRouter, Route, Routes } from 'react-router'
import { ThemeProvider } from 'next-themes'
import { AppShell } from '@/components/layout/AppShell'
import { Toaster } from '@/components/ui/sonner'
import { AdminBookingsPage } from '@/pages/AdminBookingsPage'
import { AdminEventTypesPage } from '@/pages/AdminEventTypesPage'
import { BookingConfirmedPage } from '@/pages/BookingConfirmedPage'
import { GuestBookPage } from '@/pages/GuestBookPage'
import { GuestEventTypesPage } from '@/pages/GuestEventTypesPage'

export function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<GuestEventTypesPage />} />
            <Route path="/book/:eventTypeId" element={<GuestBookPage />} />
            <Route path="/booked" element={<BookingConfirmedPage />} />
            <Route path="/admin" element={<AdminBookingsPage />} />
            <Route path="/admin/event-types" element={<AdminEventTypesPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </ThemeProvider>
  )
}
