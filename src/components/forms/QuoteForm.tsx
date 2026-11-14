"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  LIMITS,
  MAX,
  PREMISES_IDS,
  QUOTE_FREQUENCY_IDS,
  type PremisesId,
  type QuoteFrequencyId,
} from "@/lib/forms/constants";
import {
  businessRequestSchema,
  fieldErrors,
  type ErrorKey,
} from "@/lib/forms/schemas";
import { postRequest } from "@/lib/forms/submit";
import { linkText } from "@/lib/link-text";
import { buttonClasses } from "@/components/ui/button";
import { cardClasses } from "@/components/ui/card";
import {
  focusFirstError,
  FormAlert,
  SelectField,
  TextAreaField,
  TextField,
} from "./fields";

type Values = {
  premises: PremisesId | "";
  area: string;
  frequency: QuoteFrequencyId | "";
  company: string;
  contactName: string;
  email: string;
  phone: string;
  message: string;
};

type Field = keyof Values;

/** Screen order, used to focus the first error. */
const FIELD_ORDER: readonly Field[] = [
  "premises",
  "area",
  "frequency",
  "company",
  "contactName",
  "email",
  "phone",
  "message",
];

/** The selects start on their "Välj …" placeholder (empty value). */
function emptyValues(): Values {
  return {
    premises: "",
    area: "",
    frequency: "",
    company: "",
    contactName: "",
    email: "",
    phone: "",
    message: "",
  };
}

export function QuoteForm({ consent }: { consent: ReactNode }) {
  const t = useTranslations("quote");
  const te = useTranslations("errors");
  const ui = useTranslations("ui");
  const meta = useTranslations("meta");
  const locale = useLocale();
  const router = useRouter();

  const [values, setValues] = useState<Values>(emptyValues);
  const [errors, setErrors] = useState<Partial<Record<Field, ErrorKey>>>({});
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const submitted = useRef(false);

  // After a successful send this page is kept alive but hidden (<Activity>),
  // which runs effect cleanups: start over, so coming back shows an empty form.
  useEffect(() => {
    return () => {
      if (!submitted.current) return;
      submitted.current = false;
      setValues(emptyValues());
      setErrors({});
      setSending(false);
      setFailed(false);
    };
  }, []);

  // Labels come from the messages files in the same order as the ids.
  const typeLabels = t.raw("types") as string[];
  const freqLabels = t.raw("freqs") as string[];

  function set<K extends Field>(field: K, value: Values[K]) {
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function errorText(field: Field) {
    const key = errors[field];
    if (!key) return undefined;
    return key === "range" ? te("range", LIMITS.area) : te(key);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (sending) return;

    const parsed = businessRequestSchema.safeParse({
      ...values,
      kind: "business",
      locale,
    });
    if (!parsed.success) {
      const found = fieldErrors(parsed.error);
      setErrors(found);
      focusFirstError(FIELD_ORDER, found);
      return;
    }

    setErrors({});
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

  const field = (name: Field) => ({
    id: name,
    error: errorText(name),
  });

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className={`flex flex-col gap-5 ${cardClasses}`}
    >
      <div className="grid gap-[18px] md:grid-cols-2">
        <SelectField
          {...field("premises")}
          label={t("typeLabel")}
          placeholder={ui("choose")}
          value={values.premises}
          onChange={(e) => set("premises", e.target.value as PremisesId)}
          options={PREMISES_IDS.map((value, i) => ({
            value,
            label: typeLabels[i],
          }))}
        />
        <TextField
          {...field("area")}
          label={t("sizeLabel")}
          type="number"
          inputMode="numeric"
          min={LIMITS.area.min}
          max={LIMITS.area.max}
          value={values.area}
          onChange={(e) => set("area", e.target.value)}
        />
        <SelectField
          {...field("frequency")}
          label={t("freqLabel")}
          placeholder={ui("choose")}
          value={values.frequency}
          onChange={(e) => set("frequency", e.target.value as QuoteFrequencyId)}
          options={QUOTE_FREQUENCY_IDS.map((value, i) => ({
            value,
            label: freqLabels[i],
          }))}
        />
      </div>

      <div className="grid gap-[18px] md:grid-cols-2">
        <TextField
          {...field("company")}
          label={t("companyLabel")}
          autoComplete="organization"
          maxLength={MAX.company}
          value={values.company}
          onChange={(e) => set("company", e.target.value)}
        />
        <TextField
          {...field("contactName")}
          label={t("personLabel")}
          autoComplete="name"
          maxLength={MAX.name}
          value={values.contactName}
          onChange={(e) => set("contactName", e.target.value)}
        />
      </div>

      <div className="grid gap-[18px] md:grid-cols-2">
        <TextField
          {...field("email")}
          label={t("emailLabel")}
          type="email"
          autoComplete="email"
          maxLength={MAX.email}
          value={values.email}
          onChange={(e) => set("email", e.target.value)}
        />
        <TextField
          {...field("phone")}
          label={t("phoneLabel")}
          type="tel"
          autoComplete="tel"
          value={values.phone}
          onChange={(e) => set("phone", e.target.value)}
        />
      </div>

      <TextAreaField
        {...field("message")}
        label={t("messageLabel")}
        rows={4}
        maxLength={MAX.message}
        value={values.message}
        onChange={(e) => set("message", e.target.value)}
      />

      <p className="text-sm text-muted">{consent}</p>

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

      <button
        type="submit"
        disabled={sending}
        className={buttonClasses("primary", "self-start disabled:opacity-70")}
      >
        {sending ? ui("sending") : t("submit")}
      </button>
    </form>
  );
}
