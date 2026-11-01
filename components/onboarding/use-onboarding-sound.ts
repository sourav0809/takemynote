"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * One heartbeat, "dhuk-dhuk": a felt-drum thump generated with Google's Lyria
 * model, muffled and shortened so it reads as a pulse rather than a drum, then
 * doubled into a lub-dub with a little room around it. Used only in the
 * welcome flow: the rest of the app is silent on purpose.
 */
const SOUND_URL = "/sounds/onboarding-heartbeat.mp3";
const VOLUME = 0.7;
/** Going back is the same beat, quieter. */
const BACK_VOLUME = VOLUME * 0.6;
/** "Start writing" plays two heartbeats in a row, at a calm resting pulse. */
const FINISH_BEAT_GAP_SECONDS = 0.62;
/** Lets the last sound finish before the audio context is closed. */
const CLOSE_DELAY_MS = 1500;

export type OnboardingSound = "forward" | "back" | "finish";

/**
 * Loads the sound while the welcome dialog is open and plays it on demand.
 * Call `play` from a click handler: browsers only start audio after a gesture.
 */
export function useOnboardingSound(isOpen: boolean) {
  const contextRef = useRef<AudioContext | null>(null);
  const bufferRef = useRef<AudioBuffer | null>(null);

  useEffect(() => {
    if (!isOpen || typeof AudioContext === "undefined") return;
    const context = new AudioContext();
    contextRef.current = context;
    let isCancelled = false;

    fetch(SOUND_URL)
      .then((response) => response.arrayBuffer())
      .then((data) => context.decodeAudioData(data))
      .then((buffer) => {
        if (!isCancelled) bufferRef.current = buffer;
      })
      .catch(() => {
        // No sound is fine; onboarding works the same without it.
      });

    return () => {
      isCancelled = true;
      contextRef.current = null;
      bufferRef.current = null;
      window.setTimeout(() => void context.close(), CLOSE_DELAY_MS);
    };
  }, [isOpen]);

  const beat = useCallback((volume: number, delay = 0) => {
    const context = contextRef.current;
    const buffer = bufferRef.current;
    if (!context || !buffer) return;

    const source = context.createBufferSource();
    source.buffer = buffer;
    const gain = context.createGain();
    gain.gain.value = volume;
    source.connect(gain).connect(context.destination);
    source.start(context.currentTime + delay);
  }, []);

  const play = useCallback(
    (sound: OnboardingSound) => {
      void contextRef.current?.resume();
      if (sound === "forward") beat(VOLUME);
      else if (sound === "back") beat(BACK_VOLUME);
      else {
        beat(VOLUME);
        beat(VOLUME, FINISH_BEAT_GAP_SECONDS);
      }
    },
    [beat]
  );

  return play;
}
