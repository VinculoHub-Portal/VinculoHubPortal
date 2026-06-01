const FORMULA_INJECTION_PREFIX_RE = /^[=+\-@]/

function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return ""
  const str = String(value)
  // Formula injection protection
  const safe = FORMULA_INJECTION_PREFIX_RE.test(str) ? `'${str}` : str
  // Quote cells that contain commas, double-quotes, or newlines
  if (safe.includes(",") || safe.includes('"') || safe.includes("\n")) {
    return `"${safe.replace(/"/g, '""')}"`
  }
  return safe
}

export function downloadCsv(
  filename: string,
  rows: object[],
  headers: Record<string, string>,
): void {
  const keys = Object.keys(headers)
  const headerRow = keys.map((k) => escapeCell(headers[k])).join(",")
  const dataRows = rows.map((row) =>
    keys.map((k) => escapeCell((row as Record<string, unknown>)[k])).join(","),
  )

  // UTF-8 BOM ensures Excel opens the file with correct encoding for accented characters
  const bom = "﻿"
  const csv = bom + [headerRow, ...dataRows].join("\r\n")

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.rel = "noopener noreferrer"
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
