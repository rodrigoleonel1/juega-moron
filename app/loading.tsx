export default function Loading() {
  return (
    <section className="animate-pulse">
      <div className="mb-6 max-w-xl">
        <div className="h-24 sm:h-32 w-96 bg-white/5 rounded-lg" />
      </div>
      <div className="max-w-xl space-y-4">
        <div className="h-48 bg-white/5 rounded-2xl" />
        <div className="h-32 bg-white/5 rounded-2xl" />
      </div>
    </section>
  );
}
