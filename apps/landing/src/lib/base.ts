export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL
  if (path === "/") return base
  return `${base}${path.replace(/^\//, "")}`
}
