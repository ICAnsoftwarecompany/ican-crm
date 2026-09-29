# features/service/scheduling — Scheduling & resource capacity (F4)

Spec §19. One engine for anything with time and capacity: technicians, couriers, guides, rooms, vehicles, seats.
Services hub tab **Scheduling** (`/service/scheduling`, shown with the `scheduling`, `workOrders` or `courierAssignment` feature).

| Path | Role |
|---|---|
| `api/schedulingApi.js` | `GET/POST /reservations`, `POST /reservations/{id}/confirm`, `DELETE /reservations/{id}` (release), `GET /scheduling/availability`. |
| `components/SchedulingWorkspace.jsx` | Day picker + resource type filter + board + new reservation. |
| `components/ResourceDayBoard.jsx` | Resources × 07:00–20:00 in the calendar time zone; bookings solid, holds dashed, expired faded. |
| `components/SlotPicker.jsx` | **Reusable** slot finder (date, type, skill, zone, duration → server slots). Used by reservations and work orders. |
| `components/NewReservationDialog.jsx`, `ReservationDialog.jsx` | Hold (2h–7d) or book a slot; confirm a hold, release a manual booking. |
| `utils/zonedTime.js` | Formats and positions times in the calendar zone (not the browser's). |

Resources are a settings resource (`settings/resources/schedulingResources.js`, `/scheduling-resources`): type, capacity,
business calendar (working hours + holidays reused from SLA calendars), skills, zones, courier vehicle / daily capacity.

Rules (server-enforced, mirrored by `mocks/state/schedulingEngine.js` + tests):
- No double booking: overlapping active reservations may not exceed the resource capacity → 409 `RESERVATION_CONFLICT`.
- Holds carry `hold_expires_at`; the scheduler expires them (`ReservationExpired`) — the mock does it on read.
- Slots = working hours of the resource's calendar on that local date, minus holidays, bookings and past times.
- A booking owned by a work order can't be released directly (409 `RESERVATION_OWNED`); reschedule / cancel the work order.

Proposed (confirm with backend): `/scheduling/resources` CRUD and `POST /reservations/{id}/confirm`.
