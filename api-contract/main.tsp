import "@typespec/http";
import "@typespec/openapi";
import "@typespec/openapi3";

using TypeSpec.Http;
using TypeSpec.OpenAPI;

/**
 * Call Booking API — Design First contract for a Cal.com-like scheduler.
 *
 * There is no registration or authentication. Roles are separated by URL:
 * `/public/*` is the guest flow, `/admin/*` is the single predefined owner.
 *
 * Domain:
 * - Owner: one hardcoded calendar owner. Used by the admin UI; not a user account.
 * - EventType: a bookable meeting template (id, title, description, duration).
 * - Slot: a free [startAt, endAt) interval generated for an event type.
 * - Booking: a guest reservation of one slot.
 *
 * Booking window:
 * available slots cover 14 calendar days starting from the server's current
 * UTC date (today inclusive, the 15th day exclusive). A guest may book only a
 * free slot from this window.
 *
 * Occupancy:
 * at most one booking may cover any instant. Intervals [startAt, endAt) must
 * not overlap, even when event types differ.
 *
 * Slot generation (fixed availability):
 * - Timezone: UTC
 * - Days: Monday–Friday
 * - Hours: 09:00 inclusive – 18:00 exclusive
 * - Grid: starts at 09:00, then every `durationMinutes`, while endAt <= 18:00
 * - Hide slots whose startAt is not strictly in the future
 */
@service(#{
  title: "Call Booking API",
})
@server("http://localhost:3000", "Local development")
namespace CallBooking;

// ---------------------------------------------------------------------------
// Domain models
// ---------------------------------------------------------------------------

/** Allowed meeting lengths in minutes. */
enum DurationMinutes {
  fifteen: 15,
  thirty: 30,
  fortyFive: 45,
  sixty: 60,
}

/**
 * The single predefined calendar owner.
 * Not created via API; the admin UI reads this profile as-is.
 */
@example(#{
  id: "owner",
  displayName: "Анна Ковалева",
  timezone: "UTC",
})
model Owner {
  /** Stable identifier of the hardcoded owner. */
  id: string;

  displayName: string;

  /** Slot math and the 14-day window use this timezone. Always UTC. */
  timezone: "UTC";
}

/** Bookable meeting template created by the owner. */
@example(#{
  id: "intro-call",
  title: "Знакомство",
  description: "Короткий звонок, чтобы обсудить задачу.",
  durationMinutes: DurationMinutes.thirty,
})
model EventType {
  /**
   * Owner-chosen identifier (slug). Unique among event types.
   * Pattern: lowercase letters, digits, hyphens.
   */
  @pattern("^[a-z0-9]+(?:-[a-z0-9]+)*$")
  @minLength(1)
  @maxLength(64)
  id: string;

  @minLength(1)
  @maxLength(120)
  title: string;

  @maxLength(2000)
  description: string;

  durationMinutes: DurationMinutes;
}

/** Body for creating an event type. The owner supplies the id. */
model CreateEventTypeRequest {
  @pattern("^[a-z0-9]+(?:-[a-z0-9]+)*$")
  @minLength(1)
  @maxLength(64)
  id: string;

  @minLength(1)
  @maxLength(120)
  title: string;

  @maxLength(2000)
  description: string;

  durationMinutes: DurationMinutes;
}

/**
 * A free interval the guest may book.
 * `endAt` is always `startAt` plus the event type duration.
 */
@example(#{
  startAt: utcDateTime.fromISO("2026-08-18T09:00:00.000Z"),
  endAt: utcDateTime.fromISO("2026-08-18T09:30:00.000Z"),
})
model Slot {
  startAt: utcDateTime;
  endAt: utcDateTime;
}

/** Guest request to reserve a slot. */
model CreateBookingRequest {
  @pattern("^[a-z0-9]+(?:-[a-z0-9]+)*$")
  eventTypeId: string;

  /**
   * Must equal `startAt` of a slot currently returned by
   * `GET /public/event-types/{eventTypeId}/slots`.
   */
  startAt: utcDateTime;

  @minLength(1)
  @maxLength(120)
  guestName: string;

  @format("email")
  guestEmail: string;
}

/** Confirmed reservation. `endAt` is computed from the event type duration. */
@example(#{
  id: "bkg_01",
  eventTypeId: "intro-call",
  eventTypeTitle: "Знакомство",
  startAt: utcDateTime.fromISO("2026-08-19T10:00:00.000Z"),
  endAt: utcDateTime.fromISO("2026-08-19T10:30:00.000Z"),
  guestName: "Иван Петров",
  guestEmail: "ivan@example.com",
})
model Booking {
  id: string;

  eventTypeId: string;
  eventTypeTitle: string;

  startAt: utcDateTime;
  endAt: utcDateTime;

  guestName: string;
  guestEmail: string;
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

@error
model BadRequestError {
  @statusCode _: 400;
  code: "VALIDATION_ERROR" | "SLOT_OUTSIDE_WINDOW" | "SLOT_NOT_AVAILABLE";
  message: string;
}

@error
model NotFoundError {
  @statusCode _: 404;
  code: "NOT_FOUND";
  message: string;
}

@error
model ConflictError {
  @statusCode _: 409;
  code: "SLOT_OCCUPIED" | "EVENT_TYPE_ID_TAKEN";
  message: string;
}

// ---------------------------------------------------------------------------
// Guest (public) — no account
// ---------------------------------------------------------------------------

@tag("Guest")
@route("/public")
interface Guest {
  /** Booking-types page: title, description, duration for every event type. */
  @get
  @route("/event-types")
  @opExample(#{
    returnType: #[
      #{
        id: "intro-call",
        title: "Знакомство",
        description: "Короткий звонок, чтобы обсудить задачу.",
        durationMinutes: DurationMinutes.thirty,
      },
      #{
        id: "demo",
        title: "Демо продукта",
        description: "Покажем, как устроен сервис, и ответим на вопросы.",
        durationMinutes: DurationMinutes.fortyFive,
      },
    ],
  })
  listEventTypes(): EventType[];

  /** Open one event type before showing its calendar. */
  @get
  @route("/event-types/{eventTypeId}")
  getEventType(
    @path eventTypeId: string,
  ): EventType | NotFoundError;

  /**
   * Free slots for the next 14 UTC days for this event type.
   * Occupied time (any event type) is excluded.
   */
  @get
  @route("/event-types/{eventTypeId}/slots")
  @opExample(#{
    parameters: #{ eventTypeId: "intro-call" },
    returnType: #[
      #{
        startAt: utcDateTime.fromISO("2026-08-18T09:00:00.000Z"),
        endAt: utcDateTime.fromISO("2026-08-18T09:30:00.000Z"),
      },
      #{
        startAt: utcDateTime.fromISO("2026-08-18T09:30:00.000Z"),
        endAt: utcDateTime.fromISO("2026-08-18T10:00:00.000Z"),
      },
      #{
        startAt: utcDateTime.fromISO("2026-08-19T10:00:00.000Z"),
        endAt: utcDateTime.fromISO("2026-08-19T10:30:00.000Z"),
      },
      #{
        startAt: utcDateTime.fromISO("2026-08-20T14:00:00.000Z"),
        endAt: utcDateTime.fromISO("2026-08-20T14:30:00.000Z"),
      },
    ],
  })
  listSlots(@path eventTypeId: string): Slot[] | NotFoundError;

  /**
   * Book a free slot.
   * 400 SLOT_OUTSIDE_WINDOW — startAt is outside the 14-day window
   * 400 SLOT_NOT_AVAILABLE — startAt is not a generated slot (wrong grid/hours)
   * 409 SLOT_OCCUPIED — the interval overlaps an existing booking
   */
  @post
  @route("/bookings")
  createBooking(@body body: CreateBookingRequest): {
    @statusCode _: 201;
    @body booking: Booking;
  } | BadRequestError | NotFoundError | ConflictError;
}

// ---------------------------------------------------------------------------
// Owner (admin) — single predefined profile, no login
// ---------------------------------------------------------------------------

@tag("Owner")
@route("/admin")
interface OwnerAdmin {
  /** The hardcoded owner profile used by the admin UI. */
  @get
  @route("/owner")
  getOwner(): Owner;

  /** Event types the owner has created. */
  @get
  @route("/event-types")
  @opExample(#{
    returnType: #[
      #{
        id: "intro-call",
        title: "Знакомство",
        description: "Короткий звонок, чтобы обсудить задачу.",
        durationMinutes: DurationMinutes.thirty,
      },
      #{
        id: "demo",
        title: "Демо продукта",
        description: "Покажем, как устроен сервис, и ответим на вопросы.",
        durationMinutes: DurationMinutes.fortyFive,
      },
    ],
  })
  listEventTypes(): EventType[];

  /**
   * Create an event type.
   * 409 EVENT_TYPE_ID_TAKEN — id already exists.
   */
  @post
  @route("/event-types")
  createEventType(@body body: CreateEventTypeRequest): {
    @statusCode _: 201;
    @body eventType: EventType;
  } | BadRequestError | ConflictError;

  /**
   * Upcoming meetings across all event types, ordered by startAt ascending.
   * Only bookings with startAt in the future are returned.
   */
  @get
  @route("/bookings")
  @opExample(#{
    returnType: #[
      #{
        id: "bkg_01",
        eventTypeId: "intro-call",
        eventTypeTitle: "Знакомство",
        startAt: utcDateTime.fromISO("2026-08-19T10:00:00.000Z"),
        endAt: utcDateTime.fromISO("2026-08-19T10:30:00.000Z"),
        guestName: "Иван Петров",
        guestEmail: "ivan@example.com",
      },
    ],
  })
  listUpcomingBookings(): Booking[];
}
