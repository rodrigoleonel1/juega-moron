export default function Loading() {
  return (
    <div aria-hidden="true" aria-busy="true" className="animate-pulse">
      <section className="animate-fade-in">
        <header className="mb-6 max-w-xl">
          <div className="h-24 sm:h-32 w-full max-w-sm bg-white/5 rounded-lg" />
        </header>

        <div className="card max-w-xl overflow-hidden">
          <div className="bg-white/5 px-4 py-3">
            <div className="grid grid-cols-3 items-center gap-3">
              <div className="flex flex-col items-center text-center gap-1.5">
                <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-white/10" />
                <div className="h-3 w-12 rounded bg-white/10" />
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="h-6 w-12 rounded bg-white/10" />
                <div className="h-5 w-20 rounded bg-white/10" />
              </div>
              <div className="flex flex-col items-center text-center gap-1.5">
                <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-white/10" />
                <div className="h-3 w-12 rounded bg-white/10" />
              </div>
            </div>
          </div>
          <div className="px-4 py-3 space-y-3">
            <div className="h-4 w-56 mx-auto rounded bg-white/10" />
            <div className="flex gap-4 justify-center pt-1">
              <div className="h-4 w-20 rounded bg-white/10" />
              <div className="h-4 w-20 rounded bg-white/10" />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 animate-fade-in" style={{ animationDelay: "0.15s" }}>
        <div className="max-w-xl">
          <div className="h-6 w-52 mb-3 rounded bg-white/5" />
          <div className="card overflow-hidden divide-y divide-border">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <div className="h-3.5 w-3.5 rounded bg-white/10" />
                  <div className="h-4 w-32 rounded bg-white/10" />
                </div>
                <div className="h-4 w-10 rounded bg-white/10" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}