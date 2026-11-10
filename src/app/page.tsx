import Link from "next/link";

const paths = [
  {
    href: "/marketing",
    title: "Subscribe to Marketing",
    body: "Pick the services you need (campaigning, SEO, social media), answer a few questions and get a tailored proposal from our team.",
    cta: "Build my plan",
  },
  {
    href: "/partners",
    title: "Become a Partner",
    body: "Refer clients, resell or white-label DF services. Chat with our partnerships assistant and we'll introduce you to Maia.",
    cta: "Start the conversation",
  },
];

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">How would you like to work with DF?</h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-600">
          Choose a path to get started. It only takes a few minutes.
        </p>
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        {paths.map((p) => (
          <Link
            key={p.href}
            href={p.href}
            className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-400 hover:shadow-md"
          >
            <h2 className="text-xl font-semibold">{p.title}</h2>
            <p className="mt-2 flex-1 text-sm text-slate-600">{p.body}</p>
            <span className="mt-6 text-sm font-semibold text-indigo-600 group-hover:underline">{p.cta} →</span>
          </Link>
        ))}
      </section>
    </div>
  );
}
