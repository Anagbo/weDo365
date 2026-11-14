import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

/*
 * Form building blocks. Every field gets a visible <label>, and an error is
 * linked to its control with aria-describedby (plus aria-invalid).
 */

export const errorId = (id: string) => `${id}-error`;

const labelClass = "flex flex-col gap-1.5 text-[15px] font-medium text-ink";

const controlClass =
  "w-full min-h-12 rounded-field border-[1.5px] border-field bg-white px-3.5 py-3 text-base font-normal text-ink aria-invalid:border-error";

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p
      id={errorId(id)}
      className="flex items-start gap-1.5 text-sm font-medium text-error"
    >
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        aria-hidden="true"
        focusable="false"
        className="mt-0.5 shrink-0"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7.5v5.5M12 16.5v.01" />
      </svg>
      {message}
    </p>
  );
}

type Common = {
  id: string;
  label: string;
  error?: string;
  className?: string;
};

function a11y(id: string, error?: string) {
  return {
    id,
    name: id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? errorId(id) : undefined,
  } as const;
}

export function TextField({
  id,
  label,
  error,
  className = "",
  ...input
}: Common & Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "name">) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <input {...input} {...a11y(id, error)} className={controlClass} />
      <FieldError id={id} message={error} />
    </div>
  );
}

export function TextAreaField({
  id,
  label,
  error,
  className = "",
  ...textarea
}: Common & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id" | "name">) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <textarea
        {...textarea}
        {...a11y(id, error)}
        className={`${controlClass} min-h-24`}
      />
      <FieldError id={id} message={error} />
    </div>
  );
}

export function SelectField({
  id,
  label,
  error,
  className = "",
  options,
  placeholder,
  ...select
}: Common &
  Omit<SelectHTMLAttributes<HTMLSelectElement>, "id" | "name"> & {
    options: { value: string; label: string }[];
    /** First, empty option ("Välj …"); it cannot be chosen again. */
    placeholder?: string;
  }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <select {...select} {...a11y(id, error)} className={controlClass}>
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <FieldError id={id} message={error} />
    </div>
  );
}

export type ToggleOption = { value: string; label: string; sub?: string };

/**
 * A set of toggle cards (buttons with aria-pressed) where exactly one is
 * chosen. The first button carries `id`, so it can receive focus on error.
 */
export function ToggleGroup({
  id,
  legend,
  labelledBy,
  options,
  value,
  onChange,
  error,
  columns = "sm:grid-cols-2",
}: {
  id: string;
  /** Visible legend. Leave out when a heading labels the group instead. */
  legend?: string;
  labelledBy?: string;
  options: ToggleOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  columns?: string;
}) {
  return (
    <fieldset
      aria-labelledby={labelledBy}
      aria-describedby={error ? errorId(id) : undefined}
      className="flex flex-col"
    >
      {legend ? (
        <legend className="mb-2.5 text-[15px] font-medium">{legend}</legend>
      ) : null}
      <div className={`grid gap-3 ${columns}`}>
        {options.map((o, i) => {
          const pressed = o.value === value;
          return (
            <button
              key={o.value}
              id={i === 0 ? id : undefined}
              type="button"
              aria-pressed={pressed}
              onClick={() => onChange(o.value)}
              className={`flex min-h-11 w-full flex-col items-start gap-1 rounded-toggle px-[18px] py-4 text-left text-ink ${
                pressed
                  ? "border-2 border-green bg-tint"
                  : "border-[1.5px] border-field bg-white hover:border-green"
              }`}
            >
              <span className="font-bold">{o.label}</span>
              {o.sub ? (
                <span className="text-sm text-muted">{o.sub}</span>
              ) : null}
            </button>
          );
        })}
      </div>
      {error ? (
        <div className="mt-2">
          <FieldError id={id} message={error} />
        </div>
      ) : null}
    </fieldset>
  );
}

/** Focuses the first field with an error, in the order given. */
export function focusFirstError(
  order: readonly string[],
  errors: Record<string, unknown>,
) {
  const first = order.find((field) => errors[field]);
  if (first) document.getElementById(first)?.focus();
}

export function FormAlert({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      className="rounded-field border-[1.5px] border-error bg-white px-4 py-3 font-medium text-error"
    >
      {children}
    </div>
  );
}
