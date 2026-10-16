import { format } from "date-fns";
import { es } from "date-fns/locale";

export function formatDateTime(value: string | Date) { return format(new Date(value), "d MMM, HH:mm", { locale: es }); }
export function toDateTimeLocal(value: Date) { const offset = value.getTimezoneOffset() * 60_000; return new Date(value.getTime() - offset).toISOString().slice(0, 16); }

