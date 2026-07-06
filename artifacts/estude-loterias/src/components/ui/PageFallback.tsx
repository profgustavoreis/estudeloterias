import { Spinner } from "@/components/ui/spinner"

export function PageFallback() {
  return (
    <div className="flex items-center justify-center py-20" role="status" aria-label="Carregando…">
      <Spinner className="size-8" />
      <span className="sr-only">Carregando…</span>
    </div>
  )
}
