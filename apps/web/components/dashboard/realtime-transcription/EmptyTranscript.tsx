export function EmptyTranscript() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <div className="h-6 w-6 animate-pulse rounded-full bg-primary" />
      </div>
      <h3 className="mb-2 text-xl font-semibold text-foreground">
        Listening...
      </h3>
      <p className="text-muted-foreground">
        Start speaking to see your words appear here
      </p>
    </div>
  )
}
