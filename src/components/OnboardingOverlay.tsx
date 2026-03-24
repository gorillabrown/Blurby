import { useState, useEffect, useRef, useCallback } from "react";
import { useFocusTrap } from "../hooks/useFocusTrap";

const api = window.electronAPI;

interface OnboardingOverlayProps {
  onComplete: () => void;
}

const TOUR_STEPS = [
  {
    id: "library",
    title: "Your reading library",
    body: "Add documents, articles, and books here. Drag and drop files or paste a URL to get started.",
    arrowDir: "top" as const,
  },
  {
    id: "doccard",
    title: "Open any document",
    body: "Click a card to open it in Page view — a clean, paginated reading experience.",
    arrowDir: "top" as const,
  },
  {
    id: "modes",
    title: "Three reading modes",
    body: "Switch between Focus (RSVP speed reading) and Flow (guided scroll) using the buttons in the bottom bar.",
    arrowDir: "bottom" as const,
  },
] as const;

export default function OnboardingOverlay({ onComplete }: OnboardingOverlayProps) {
  const [phase, setPhase] = useState<"welcome" | "tour">("welcome");
  const [step, setStep] = useState(0);
  const overlayRef = useRef<HTMLDivElement>(null);
  const firstFocusRef = useRef<HTMLButtonElement>(null);

  useFocusTrap(overlayRef, [phase, step]);

  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") handleSkip();
    }
    el.addEventListener("keydown", handleKeyDown);
    if (firstFocusRef.current) firstFocusRef.current.focus();
    return () => el.removeEventListener("keydown", handleKeyDown);
  }, [phase, step, handleSkip]);

  const handleComplete = useCallback(async () => {
    await api.saveSettings({ firstRunCompleted: true } as any);
    onComplete();
  }, [onComplete]);

  const handleSkip = useCallback(async () => {
    await api.saveSettings({ firstRunCompleted: true } as any);
    onComplete();
  }, [onComplete]);

  const handleStartTour = useCallback(() => {
    setPhase("tour");
    setStep(0);
  }, []);

  const handleNext = useCallback(() => {
    if (step < TOUR_STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      handleComplete();
    }
  }, [step, handleComplete]);

  const currentStep = TOUR_STEPS[step];
  const isLastStep = step === TOUR_STEPS.length - 1;

  return (
    <div
      className="onboarding-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={phase === "welcome" ? "Welcome to Blurby" : `Onboarding step ${step + 1} of ${TOUR_STEPS.length}`}
      ref={overlayRef}
    >
      {phase === "welcome" ? (
        <div className="onboarding-welcome">
          <div className="onboarding-logo-mark" aria-hidden="true">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="48" height="48" rx="10" fill="#D04716" />
              <text x="50%" y="58%" dominantBaseline="middle" textAnchor="middle" fill="#fff" fontSize="26" fontWeight="700" fontFamily="Georgia, serif">B</text>
            </svg>
          </div>
          <h1 className="onboarding-heading">Welcome to Blurby</h1>
          <p className="onboarding-tagline">Blurby helps you read faster and remember more.</p>
          <p className="onboarding-sub">A sample document has been added to your library so you can try it right away.</p>
          <div className="onboarding-actions">
            <button
              ref={firstFocusRef}
              className="onboarding-btn-primary"
              onClick={handleStartTour}
              autoFocus
            >
              Get Started
            </button>
            <button className="onboarding-btn-skip" onClick={handleSkip}>
              Skip tour
            </button>
          </div>
        </div>
      ) : (
        <div className={`onboarding-tooltip onboarding-tooltip--${currentStep.arrowDir} onboarding-tooltip--${currentStep.id}`}>
          <div className="onboarding-tooltip-step-indicator" aria-hidden="true">
            {TOUR_STEPS.map((_, i) => (
              <span
                key={i}
                className={`onboarding-step-dot${i === step ? " onboarding-step-dot--active" : ""}`}
              />
            ))}
          </div>
          <h2 className="onboarding-tooltip-title">{currentStep.title}</h2>
          <p className="onboarding-tooltip-body">{currentStep.body}</p>
          <div className="onboarding-tooltip-actions">
            <button
              ref={firstFocusRef}
              className="onboarding-btn-primary"
              onClick={handleNext}
              autoFocus
            >
              {isLastStep ? "Done" : "Next"}
            </button>
            <button className="onboarding-btn-skip" onClick={handleSkip}>
              Skip
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
