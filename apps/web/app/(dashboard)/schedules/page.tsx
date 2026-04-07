"use client";

export default function SchedulesPage() {
  const schedules = [
    {
      id: "1",
      workflow: "Amazon Product Scraper",
      cron: "0 */6 * * *",
      cronLabel: "Every 6 hours",
      timezone: "America/New_York",
      isActive: true,
      lastRun: "2026-04-07T10:00:00Z",
      nextRun: "2026-04-07T16:00:00Z",
    },
    {
      id: "2",
      workflow: "Competitor Price Monitor",
      cron: "0 8 * * 1-5",
      cronLabel: "Weekdays at 8 AM",
      timezone: "America/Los_Angeles",
      isActive: true,
      lastRun: "2026-04-07T08:00:00Z",
      nextRun: "2026-04-08T08:00:00Z",
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Schedules</h1>
          <p className="mt-1 text-sm text-gray-400">
            Cron-based recurring workflow executions
          </p>
        </div>
        <button className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500">
          + New Schedule
        </button>
      </div>

      <div className="space-y-3">
        {schedules.map((schedule) => (
          <div
            key={schedule.id}
            className="rounded-xl border border-gray-800 bg-gray-900 p-5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`h-3 w-3 rounded-full ${
                    schedule.isActive ? "bg-green-500" : "bg-gray-600"
                  }`}
                />
                <div>
                  <div className="font-medium text-white">
                    {schedule.workflow}
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-gray-400">
                    <span className="rounded bg-gray-800 px-2 py-0.5 font-mono">
                      {schedule.cron}
                    </span>
                    <span>{schedule.cronLabel}</span>
                    <span>{schedule.timezone}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right text-xs text-gray-500">
                  <div>
                    Last: {new Date(schedule.lastRun).toLocaleString()}
                  </div>
                  <div>
                    Next: {new Date(schedule.nextRun).toLocaleString()}
                  </div>
                </div>
                <button className="rounded border border-gray-700 px-3 py-1 text-xs text-gray-400 hover:text-white">
                  Trigger Now
                </button>
                <button className="text-xs text-red-400 hover:text-red-300">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
