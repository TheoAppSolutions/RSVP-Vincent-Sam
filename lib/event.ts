export type Venue = { name: string; address: string };

const dateISO = "2027-02-20T15:00:00+08:00";
const eventDate = new Date(dateISO);
const timeZone = "Asia/Manila";
const formatDate = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-US", { timeZone, ...options }).format(eventDate);

export const EVENT = {
  honoree: "Vincent & Sam",
  groom: "Vincent",
  bride: "Sam",
  dateLong: formatDate({ weekday: "long", month: "long", day: "numeric", year: "numeric" }),
  dateLabel: formatDate({ month: "long", day: "numeric", year: "numeric" }),
  time: formatDate({ hour: "numeric", minute: "2-digit", hour12: true }),
  dateISO,
  rsvpDeadline: "January 5, 2027",
  dressCode: "Semi-formal",
  venue: { name: "Pacific Point", address: "Tacloban City, Leyte" },
};

export const EVENT_TIMESTAMP = new Date(EVENT.dateISO).getTime();

export const MEDIA = {
  hero: "/hero.webp",
  music: { src: "/music/background_music.mp3", volume: 0.5 },
};

export const GIFT = {
  message: "Your presence at our wedding is the greatest gift of all. Should you wish to bless us further, a monetary gift would be warmly appreciated as we begin our life together.",
  qr: "/gift-qr.webp" as string | null,
  qrLabel: "Gift QR Code",
};
