export default function Loading() {
  return (
    <div aria-hidden="true" aria-busy="true" className="animate-pulse">
      <section className="animate-fade-in mx-auto max-w-7xl mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div className="h-10 sm:h-14 w-48 sm:w-64 rounded-lg bg-white/5" />
          <div className="flex items-center gap-2">
            <div className="h-9 w-14 rounded-lg bg-white/10" />
            <div className="h-9 w-14 rounded-lg bg-white/10" />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-3 mb-8">
          <div className="relative flex-grow">
            <div className="h-11 w-full rounded-lg bg-white/10" />
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="h-11 w-32 rounded-lg bg-white/10" />
            <div className="h-11 w-24 rounded-lg bg-white/10" />
          </div>
        </div>

        <ul className="grid list-none p-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(8)].map((_, i) => (
            <li key={i}>
              <div className="card overflow-hidden">
                <div className="grid grid-cols-3 items-center gap-2 p-4">
                  <div className="flex flex-col items-center text-center gap-1">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white/10" />
                    <div className="h-2.5 w-12 rounded bg-white/10" />
                  </div>
                  <div className="mx-auto h-6 w-10 rounded bg-white/10" />
                  <div className="flex flex-col items-center text-center gap-1">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white/10" />
                    <div className="h-2.5 w-12 rounded bg-white/10" />
                  </div>
                </div>

                <div className="px-4 pb-4 space-y-2">
                  <div className="flex items-center justify-center gap-1.5">
                    <div className="h-3.5 w-16 rounded bg-white/10" />
                    <div className="h-3.5 w-1 rounded bg-white/10" />
                    <div className="h-3.5 w-8 rounded bg-white/10" />
                  </div>
                  <div className="h-3 w-36 mx-auto rounded bg-white/10" />
                </div>

                <div className="px-4 pb-4">
                  <div className="h-8 w-full rounded-lg bg-white/10" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}