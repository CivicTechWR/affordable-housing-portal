import Link from "next/link";

const entryPoints = [
  {
    href: "/preview",
    title: "Component Preview",
    description: "Render the existing filters, cards, and map shell with mock data before wiring the full product flow.",
  },
  {
    href: "/listings",
    title: "Listings Prototype",
    description: "Open the assembled search layout that already uses the current component set.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(51,65,85,0.08),_transparent_45%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-6 py-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <div className="max-w-3xl space-y-4">
          <span className="inline-flex rounded-full border border-slate-300 bg-white/80 px-3 py-1 text-sm font-medium text-slate-700 backdrop-blur">
            Affordable Housing Portal
          </span>
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              The app shell exists. The home route was still pointing at the default starter page.
            </h1>
            <p className="text-lg text-slate-600">
              Use the preview route to inspect components in isolation, or jump into the assembled
              listings prototype.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {entryPoints.map((entryPoint) => (
            <Link
              key={entryPoint.href}
              href={entryPoint.href}
              className="group rounded-3xl border border-slate-200 bg-white/85 p-8 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="space-y-4">
                <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
                  {entryPoint.href}
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-slate-950">{entryPoint.title}</h2>
                  <p className="text-base leading-7 text-slate-600">{entryPoint.description}</p>
                </div>
                <span className="inline-flex items-center text-sm font-semibold text-sky-700 group-hover:text-sky-800">
                  Open route
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
