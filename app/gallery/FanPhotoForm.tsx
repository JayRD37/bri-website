"use client";

import { FormEvent, useState } from "react";
import styles from "./gallery.module.css";

type SubmitState = {
  kind: "idle" | "sending" | "success" | "error";
  message: string;
};

export default function FanPhotoForm() {
  const [state, setState] = useState<SubmitState>({ kind: "idle", message: "" });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const photo = data.get("photo");

    if (!(photo instanceof File) || photo.size === 0) {
      setState({ kind: "error", message: "Choose a photo first." });
      return;
    }

    if (photo.size > 8 * 1024 * 1024) {
      setState({ kind: "error", message: "That photo is larger than 8 MB." });
      return;
    }

    setState({ kind: "sending", message: "Sending your photo…" });

    try {
      const response = await fetch("/api/fan-photos", { method: "POST", body: data });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "The photo could not be submitted.");
      }

      form.reset();
      setState({ kind: "success", message: result.message });
    } catch (error) {
      setState({
        kind: "error",
        message: error instanceof Error ? error.message : "The photo could not be submitted.",
      });
    }
  }

  return (
    <form className={styles.fanForm} onSubmit={handleSubmit} encType="multipart/form-data">
      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className={styles.formGrid}>
        <label>
          <span>Your name or photo credit</span>
          <input name="credit" type="text" maxLength={80} autoComplete="name" required />
        </label>
        <label>
          <span>Email</span>
          <input name="email" type="email" maxLength={160} autoComplete="email" required />
        </label>
      </div>

      <label>
        <span>Photo</span>
        <input name="photo" type="file" accept="image/jpeg,image/png,image/webp" required />
        <small>JPG, PNG, or WebP. Maximum 8 MB.</small>
      </label>

      <label>
        <span>Caption</span>
        <textarea name="caption" maxLength={400} rows={3} placeholder="Where was this taken?" />
      </label>

      <label className={styles.checkRow}>
        <input name="adult" type="checkbox" value="yes" required />
        <span>I am at least 18 years old.</span>
      </label>

      <label className={styles.checkRow}>
        <input name="consent" type="checkbox" value="yes" required />
        <span>
          I took this photo or have permission to share it, everyone pictured has consented
          (including parent or guardian permission for anyone under 18), and Briella Steiner
          may display it on this website.
        </span>
      </label>

      <p className={styles.reviewNote}>
        Your photo and public text will be processed by OpenAI&apos;s automated safety service,
        then reviewed by a person. Your email stays private. Nothing appears publicly unless
        it is approved.
      </p>

      <button className="western-button western-button-gold" type="submit" disabled={state.kind === "sending"}>
        {state.kind === "sending" ? "Submitting…" : "Submit photo"}
      </button>

      <p
        className={`${styles.formStatus} ${state.kind === "error" ? styles.formError : ""}`}
        role="status"
        aria-live="polite"
      >
        {state.message}
      </p>
    </form>
  );
}
