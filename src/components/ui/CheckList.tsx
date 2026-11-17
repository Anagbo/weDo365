import { CheckIcon } from "./CheckIcon";

/** List with the green check icon in front of each item. */
export function CheckList({
  items,
  inline = false,
  className = "",
}: {
  items: string[];
  /** Wrap items in a row (trust checks) instead of stacking them. */
  inline?: boolean;
  className?: string;
}) {
  return (
    <ul
      className={`${
        inline ? "flex flex-wrap gap-x-6 gap-y-2.5" : "flex flex-col gap-2.5"
      } ${className}`}
    >
      {items.map((item) => (
        <li
          key={item}
          className={`flex gap-2.5 ${
            inline
              ? "items-center text-base font-medium"
              : "items-start leading-normal"
          }`}
        >
          <CheckIcon className={inline ? "" : "mt-0.5"} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
