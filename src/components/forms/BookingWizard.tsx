"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { ServiceId } from "@/config/site";
import {
  DEFAULT_FREQUENCY,
  LIMITS,
  MAX,
  type FrequencyId,
  type SlotId,
} from "@/lib/forms/constants";
import { formatDate, todayInStockholm } from "@/lib/forms/date";
import {
  fieldErrors,
  homeContactStep,
  homeDetailsStep,
  homeRequestSchema,
  homeServiceStep,
  homeTimePlaceStep,
  type ErrorKey,
} from "@/lib/forms/schemas";
import { postRequest } from "@/lib/forms/submit";
import { linkText } from "@/lib/link-text";
import { buttonClasses } from "@/components/ui/button";
import { cardClasses } from "@/components/ui/card";
import { CheckIcon } from "@/components/ui/CheckIcon";
import {
  focusFirstError,
  FormAlert,
  TextAreaField,
  TextField,
  ToggleGroup,
} from "./fields";

type Values = {
  service: ServiceId;
  size: string;
  windows: string;
  frequency: FrequencyId;
  date: string;
  slot: SlotId | "";
  street: string;
  zip: string;
  city: string;
  notes: string;
  name: string;
  email: string;
  phone: string;
};

type Field = keyof Values;

/** Fields in screen order, per step (used to focus the first error). */
const STEP_FIELDS: readonly (readonly Field[])[] = [
  ["service"],
  ["size", "windows", "frequency"],
  ["date", "slot", "street", "zip", "city", "notes"],
  ["name", "email", "phone"],
];

const STEP_SCHEMAS = [
  homeServiceStep,
  homeDetailsStep,
  homeTimePlaceStep,
  homeContactStep,
] as const;

function emptyValues(service: ServiceId): Values {
  return {
    service,
    size: "",
    windows: "",
    frequency: DEFAULT_FREQUENCY,
    date: "",
    slot: "",
    street: "",
    zip: "",
    city: "",
    notes: "",
    name: "",
    email: "",
    phone: "",
  };
}

type Props = {
  initialService: ServiceId;
  /** Consent sentence, with the privacy link already in place. */
  consent: ReactNode;
};

export function BookingWizard({ initialService, consent }: Props) {
  const t = useTranslations("book");
  const te = useTranslations("errors");
  const ui = useTranslations("ui");
  const meta = useTranslations("meta");
  const locale = useLocale();
  const router = useRouter();
  const uid = useId();

  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Values>(() =>
    emptyValues(initialService),
  );
  const [errors, setErrors] = useState<Partial<Record<Field, ErrorKey>>>({});
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);

  const headingRef = useRef<HTMLHeadingElement>(null);
  const stepChanged = useRef(false);
  const submitted = useRef(false);

  // Move focus to the new step's heading, but not on first render.
  useEffect(() => {
    if (!stepChanged.current) return;
    headingRef.current?.focus();
  }, [step]);

  // After a successful send we navigate to the thank-you page. Next.js keeps
  // this page alive but hidden (<Activity>), which runs effect cleanups, so
  // start over here. Coming back to the page then shows an empty wizard.
  useEffect(() => {
    return () => {
      if (!submitted.current) return;
      submitted.current = false;
      stepChanged.current = false;
      setStep(0);
      setValues(emptyValues(initialService));
      setErrors({});
      setSending(false);
      setFailed(false);
    };
  }, [initialService]);

  const steps = t.raw("steps") as string[];
  const services = t.raw("services") as {
    id: ServiceId;
    name: string;
    sub: string;
  }[];
  const freqs = t.raw("freqs") as { id: FrequencyId; label: string }[];
  const slots = t.raw("slots") as { id: SlotId; label: string; time: string }[];

  const serviceName = services.find((s) => s.id === values.service)?.name;
  const isWindows = values.service === "fonster";

  function set<K extends Field>(field: K, value: Values[K]) {
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function errorText(field: Field): string | undefined {
    const key = errors[field];
    if (!key) return undefined;
    if (key === "range") {
      const limits = field === "windows" ? LIMITS.windows : LIMITS.size;
      return te("range", limits);
    }
    return te(key);
  }

  /** Validates the current step; shows errors and returns false if invalid. */
  function validateStep(): boolean {
    const result = STEP_SCHEMAS[step].safeParse(values);
    if (result.success) {
      setErrors({});
      return true;
    }
    const found = fieldErrors(result.error);
    setErrors(found);
    focusFirstError(STEP_FIELDS[step], found);
    return false;
  }

  function goTo(next: number) {
    stepChanged.current = true;
    setErrors({});
    setFailed(false);
    setStep(next);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (sending || !validateStep()) return;
    if (step < STEP_SCHEMAS.length - 1) {
      goTo(step + 1);
      return;
    }

    const parsed = homeRequestSchema.safeParse({
      ...values,
      kind: "home",
      locale,
    });
    if (!parsed.success) {
      // Should not happen once every step has passed; show the first problem.
      setFailed(true);
      return;
    }

    setSending(true);
    setFailed(false);
    const ok = await postRequest(parsed.data);
    if (ok) {
      submitted.current = true;
      router.push("/tack");
    } else {
      setSending(false);
      setFailed(true);
    }
  }

  // Summary rows: only what the customer has filled in so far.
  const sizeValue = isWindows ? values.windows : values.size;
  const slot = slots.find((s) => s.id === values.slot);
  const timeParts = [
    values.date ? formatDate(values.date, locale) : "",
    slot ? `${slot.label} ${slot.time}` : "",
  ].filter(Boolean);
  const summary: [string, string][] = [
    [t("summaryService"), serviceName ?? ""],
    [
      isWindows ? t("summaryWindows") : t("summarySize"),
      sizeValue ? `${sizeValue} ${isWindows ? t("unitPcs") : t("unitM2")}` : "",
    ],
    [
      t("summaryFreq"),
      values.service === "hem"
        ? (freqs.find((f) => f.id === values.frequency)?.label ?? "")
        : "",
    ],
    [t("summarySlot"), timeParts.join(", ")],
  ];

  const headingId = `${uid}-heading`;
  const headingClass = "text-[24px] leading-tight focus:outline-none";
  const stepHeading = [t("serviceQuestion"), serviceName, steps[2], steps[3]][
    step
  ];

  return (
    <div className="flex flex-col gap-7">
      {/* Step indicator */}
      <ol
        aria-label={t("stepLabel")}
        className="flex flex-wrap gap-x-6 gap-y-2"
      >
        {steps.map((label, i) => {
          const done = i < step;
          const current = i === step;
          return (
            <li
              key={label}
              aria-current={current ? "step" : undefined}
              className="flex items-center gap-2.5 text-[15px]"
            >
              <span
                aria-hidden="true"
                className={`grid size-8 place-items-center rounded-full font-bold ${
                  current
                    ? "bg-green text-white"
                    : done
                      ? "border-[1.5px] border-green bg-tint text-green"
                      : "border-[1.5px] border-field font-semibold text-muted"
                }`}
              >
                {done ? <CheckIcon className="size-4" /> : i + 1}
              </span>
              <span className={current ? "font-semibold" : "text-muted"}>
                {label}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <form
          noValidate
          onSubmit={onSubmit}
          className={`flex min-w-0 flex-col gap-6 ${cardClasses}`}
        >
          <div className="flex flex-col gap-5">
            <h2
              id={headingId}
              ref={headingRef}
              tabIndex={-1}
              className={headingClass}
            >
              {stepHeading}
            </h2>

            {step === 0 ? (
              <ToggleGroup
                id="service"
                labelledBy={headingId}
                options={services.map((s) => ({
                  value: s.id,
                  label: s.name,
                  sub: s.sub,
                }))}
                value={values.service}
                onChange={(v) => set("service", v as ServiceId)}
                error={errorText("service")}
              />
            ) : null}

            {step === 1 ? (
              <>
                {isWindows ? (
                  <TextField
                    id="windows"
                    label={t("windowsLabel")}
                    type="number"
                    inputMode="numeric"
                    min={LIMITS.windows.min}
                    max={LIMITS.windows.max}
                    value={values.windows}
                    onChange={(e) => set("windows", e.target.value)}
                    error={errorText("windows")}
                    className="max-w-[280px]"
                  />
                ) : (
                  <TextField
                    id="size"
                    label={t("sizeLabel")}
                    type="number"
                    inputMode="numeric"
                    min={LIMITS.size.min}
                    max={LIMITS.size.max}
                    value={values.size}
                    onChange={(e) => set("size", e.target.value)}
                    error={errorText("size")}
                    className="max-w-[280px]"
                  />
                )}
                {values.service === "hem" ? (
                  <ToggleGroup
                    id="frequency"
                    legend={t("freqLabel")}
                    options={freqs.map((f) => ({
                      value: f.id,
                      label: f.label,
                    }))}
                    value={values.frequency}
                    onChange={(v) => set("frequency", v as FrequencyId)}
                    error={errorText("frequency")}
                    columns="grid-cols-2 md:grid-cols-4"
                  />
                ) : null}
              </>
            ) : null}

            {step === 2 ? (
              <>
                <TextField
                  id="date"
                  label={t("dateLabel")}
                  type="date"
                  min={todayInStockholm()}
                  value={values.date}
                  onChange={(e) => set("date", e.target.value)}
                  error={errorText("date")}
                  className="max-w-[280px]"
                />
                <ToggleGroup
                  id="slot"
                  legend={t("slotLabel")}
                  options={slots.map((s) => ({
                    value: s.id,
                    label: s.label,
                    sub: s.time,
                  }))}
                  value={values.slot}
                  onChange={(v) => set("slot", v as SlotId)}
                  error={errorText("slot")}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    id="street"
                    label={t("streetLabel")}
                    autoComplete="street-address"
                    maxLength={MAX.street}
                    value={values.street}
                    onChange={(e) => set("street", e.target.value)}
                    error={errorText("street")}
                    className="sm:col-span-2"
                  />
                  <TextField
                    id="zip"
                    label={t("zipLabel")}
                    inputMode="numeric"
                    autoComplete="postal-code"
                    maxLength={6}
                    value={values.zip}
                    onChange={(e) => set("zip", e.target.value)}
                    error={errorText("zip")}
                  />
                  <TextField
                    id="city"
                    label={t("cityLabel")}
                    autoComplete="address-level2"
                    maxLength={MAX.city}
                    value={values.city}
                    onChange={(e) => set("city", e.target.value)}
                    error={errorText("city")}
                  />
                </div>
                <TextAreaField
                  id="notes"
                  label={t("notesLabel")}
                  rows={3}
                  maxLength={MAX.notes}
                  value={values.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  error={errorText("notes")}
                />
              </>
            ) : null}

            {step === 3 ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    id="name"
                    label={t("nameLabel")}
                    autoComplete="name"
                    maxLength={MAX.name}
                    value={values.name}
                    onChange={(e) => set("name", e.target.value)}
                    error={errorText("name")}
                    className="sm:col-span-2"
                  />
                  <TextField
                    id="email"
                    label={t("emailLabel")}
                    type="email"
                    autoComplete="email"
                    maxLength={MAX.email}
                    value={values.email}
                    onChange={(e) => set("email", e.target.value)}
                    error={errorText("email")}
                  />
                  <TextField
                    id="phone"
                    label={t("phoneLabel")}
                    type="tel"
                    autoComplete="tel"
                    value={values.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    error={errorText("phone")}
                  />
                </div>
                <p className="text-sm text-muted">{consent}</p>
              </>
            ) : null}
          </div>

          {failed ? (
            <FormAlert>
              {linkText(
                te("submitFailed", { phone: meta("phone") }),
                meta("phone"),
                (m) => (
                  <a
                    href={meta("phoneHref")}
                    className="whitespace-nowrap text-error underline underline-offset-4"
                  >
                    {m}
                  </a>
                ),
              )}
            </FormAlert>
          ) : null}

          <div className="flex flex-wrap justify-between gap-3 border-t border-line pt-6">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => goTo(step - 1)}
                className={buttonClasses("secondary")}
              >
                <span aria-hidden="true">←</span>
                {t("back")}
              </button>
            ) : (
              <span />
            )}
            <button
              type="submit"
              disabled={sending}
              className={buttonClasses("primary", "disabled:opacity-70")}
            >
              {step < STEP_SCHEMAS.length - 1 ? (
                <>
                  {t("next")}
                  <span aria-hidden="true">→</span>
                </>
              ) : sending ? (
                ui("sending")
              ) : (
                t("submit")
              )}
            </button>
          </div>
        </form>

        <aside
          aria-labelledby={`${uid}-summary`}
          className="flex flex-col gap-3.5 rounded-card bg-tint p-7"
        >
          <h2 id={`${uid}-summary`} className="text-[22px] leading-tight">
            {t("summaryTitle")}
          </h2>
          <dl className="flex flex-col gap-2.5">
            {summary
              .filter(([, value]) => value)
              .map(([label, value]) => (
                <div key={label} className="flex justify-between gap-3">
                  <dt className="shrink-0 text-muted">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
          </dl>
          <p className="border-t border-ink/15 pt-3.5 text-[15px] leading-[1.55]">
            {t("summaryNote")}
          </p>
        </aside>
      </div>
    </div>
  );
}
