"use client";

import { useRef, useState } from "react";

type Status = "idle" | "sending" | "done" | "error";

export function useRsvpForm() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [attending, setAttending] = useState<boolean | null>(null);
  const [nameError, setNameError] = useState(false);
  const [choiceError, setChoiceError] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [submittedAttendance, setSubmittedAttendance] = useState(true);
  const inFlight = useRef(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    const trimmedName = name.trim();
    setNameError(!trimmedName);
    setChoiceError(attending === null);
    if (!trimmedName || attending === null) return;
    inFlight.current = true;
    setStatus("sending");
    setError("");
    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, message: message.trim(), attending }),
      });
      if (!response.ok) {
        if (response.status === 429) throw new Error("Too many responses. Please wait a few minutes and try again.");
        if (response.status === 400 || response.status === 413) throw new Error("Please check your name and message lengths, then try again.");
        throw new Error("We couldn’t send your response. Please check your connection and try again.");
      }
      setName(trimmedName);
      setSubmittedAttendance(attending);
      setStatus("done");
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Couldn’t send your response. Please try again.");
      setStatus("error");
    } finally { inFlight.current = false; }
  }

  return { name, setName, message, setMessage, attending, setAttending, nameError, setNameError,
    choiceError, setChoiceError, status, setStatus, submittedAttendance, submit, error };
}
