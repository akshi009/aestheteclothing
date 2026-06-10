// Dynamic currency formatter — current code/locale is set when settings load.
let CURRENT_CODE = "INR";
let CURRENT_LOCALE = "en-IN";

const LOCALE_BY_CODE: Record<string, string> = {
  INR: "en-IN",
  USD: "en-US",
  EUR: "en-IE",
  GBP: "en-GB",
  AED: "en-AE",
  SGD: "en-SG",
  AUD: "en-AU",
  CAD: "en-CA",
  JPY: "ja-JP",
};

export function setCurrencyFormat(code?: string | null, locale?: string | null) {
  if (code) CURRENT_CODE = code.toUpperCase();
  CURRENT_LOCALE = locale || LOCALE_BY_CODE[CURRENT_CODE] || "en-US";
  if (typeof window !== "undefined") {
    try { localStorage.setItem("cms-currency", JSON.stringify({ code: CURRENT_CODE, locale: CURRENT_LOCALE })); } catch {}
  }
}

// Hydrate from localStorage so first paint matches admin settings
if (typeof window !== "undefined") {
  try {
    const raw = localStorage.getItem("cms-currency");
    if (raw) {
      const v = JSON.parse(raw);
      if (v?.code) CURRENT_CODE = v.code;
      if (v?.locale) CURRENT_LOCALE = v.locale;
    }
  } catch {}
}

export const getCurrencyCode = () => CURRENT_CODE;
export const getCurrencyLocale = () => CURRENT_LOCALE;

export const currency = (n: number | string | null | undefined) => {
  const v = typeof n === "string" ? parseFloat(n) : (n ?? 0);
  try {
    return new Intl.NumberFormat(CURRENT_LOCALE, {
      style: "currency",
      currency: CURRENT_CODE,
      maximumFractionDigits: 0,
    }).format(v || 0);
  } catch {
    return `${CURRENT_CODE} ${(v || 0).toLocaleString(CURRENT_LOCALE)}`;
  }
};

export const dateShort = (d: string | Date) =>
  new Date(d).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });

export const dateTime = (d: string | Date) =>
  new Date(d).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
