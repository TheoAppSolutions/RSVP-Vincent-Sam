import "server-only";

export type Rsvp = Readonly<{
  id: string;
  name: string;
  attending: boolean;
  message: string | null;
  created_at: string;
}>;

export const RSVPS: readonly Rsvp[] = [
  {
    "id": "rsvp-001",
    "name": "Test",
    "attending": true,
    "message": "Test message",
    "created_at": "2026-11-24T10:32:34.062398+00:00"
  }
];
