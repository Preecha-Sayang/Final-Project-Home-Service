// สไตล์และ util กลาง เอาไว้ reuse ทุก input
import type { HTMLAttributes } from "react";

export type InputStatus = "default" | "success" | "error" | "disabled";

export const base =
  "block w-full rounded-md border bg-white px-3 py-2 text-sm outline-none transition";

export const ring =
  "focus:ring-2 focus:ring-offset-0 focus:ring-blue-500 focus:border-blue-500";

export const state: Record<InputStatus, string> = {
  default:
    "border-gray-300 text-gray-900 placeholder:text-gray-400 hover:border-gray-400",
  success:
    "border-emerald-500 text-gray-900 placeholder:text-gray-400 focus:ring-emerald-500",
  error:
    "border-red-500 text-gray-900 placeholder:text-red-400 focus:ring-red-500",
  disabled:
    "border-gray-200 bg-gray-100 text-gray-400 placeholder:text-gray-400 cursor-not-allowed",
};

export function cn(...classes: Array<string | number | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}

export function labelCls(extra?: HTMLAttributes<HTMLLabelElement>["className"]) {
  return cn("mb-1 block text-sm font-medium text-gray-700", extra);
}

export function messageCls(err?: boolean) {
  return cn("mt-1 text-xs", err ? "text-red-600" : "text-gray-500");
}