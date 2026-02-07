export default function DevicesPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Devices</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Your machines that run CLAW-FE agent work locally.
      </p>

      <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="text-sm font-medium">No devices connected</div>
        <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          We’ll add runner registration + heartbeat in Phase 5.
        </div>
      </div>
    </div>
  );
}
