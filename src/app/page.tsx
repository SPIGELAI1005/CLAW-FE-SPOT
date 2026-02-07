import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function Home() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-16 px-6 py-14 sm:py-20">
      {/* HERO */}
      <section className="grid items-center gap-10 lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="neutral">CLAW:FE SPOT</Badge>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Single Point Of Truth for execution
            </span>
          </div>

          <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
            The AI workroom that ships.
            <span className="block text-zinc-500">Audited outcomes, not chat logs.</span>
          </h1>

          <p className="max-w-xl text-lg leading-8 text-zinc-700 dark:text-zinc-300">
            Create a table. Define success criteria. Run specialist agents.
            Capture artifacts. Pass an audit gate. Ship.
          </p>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Button as="link" href="/tables" variant="primary">
              Enter SPOT
            </Button>
            <Button as="link" href="/recipes" variant="secondary">
              See Recipes
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap gap-3 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 dark:border-zinc-800 dark:bg-zinc-950">
              Supabase Auth + RLS
            </span>
            <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 dark:border-zinc-800 dark:bg-zinc-950">
              Local-first runner (planned)
            </span>
            <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 dark:border-zinc-800 dark:bg-zinc-950">
              CLI access
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-2 -z-10 rounded-[2rem] bg-gradient-to-b from-zinc-200/60 to-transparent blur-2xl dark:from-zinc-800/40" />
          <div className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <Image
              src="/brand/clawfe-spot-hero.jpg"
              alt="CLAW:FE SPOT hero"
              width={1400}
              height={788}
              priority
              className="h-auto w-full"
            />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="text-sm font-semibold">Tables</div>
          <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            One workroom per problem: goal, tasks, artifacts, and decisions.
          </div>
        </Card>
        <Card>
          <div className="text-sm font-semibold">Roles</div>
          <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Driver + Specialists + Auditor. Built for outcomes.
          </div>
        </Card>
        <Card>
          <div className="text-sm font-semibold">Audit gate</div>
          <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Nothing is “done” until it passes criteria. Logs stay attached.
          </div>
        </Card>
        <Card>
          <div className="text-sm font-semibold">Local-first</div>
          <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Agents run on your machine (planned). You keep control.
          </div>
        </Card>
      </section>

      {/* SOCIAL PROOF (placeholder, commercial feel) */}
      <section className="grid gap-4 lg:grid-cols-3">
        <Card>
          <div className="text-sm font-semibold">“Finally: execution.”</div>
          <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Tables make progress visible. The audit gate prevents fake-done.
          </div>
          <div className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
            — Founder, automation-heavy startup
          </div>
        </Card>
        <Card>
          <div className="text-sm font-semibold">“Feels like a product.”</div>
          <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Clean UI, simple flow, and a CLI that actually integrates.
          </div>
          <div className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
            — Engineer, multi-agent workflows
          </div>
        </Card>
        <Card>
          <div className="text-sm font-semibold">“Security-first by default.”</div>
          <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            RLS from day one. Localhost-only callbacks. No surprise data leaks.
          </div>
          <div className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
            — Operator, on-prem mindset
          </div>
        </Card>
      </section>

      {/* SECURITY */}
      <section className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Security isn’t a feature. It’s the default.
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
            CLAW:FE SPOT is designed to stay sane under real-world conditions:
            untrusted content, tool access, and “AI says so” failure modes.
          </p>

          <ul className="mt-5 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
            <li className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-zinc-400" />
              Supabase RLS scopes every row to the signed-in owner.
            </li>
            <li className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-zinc-400" />
              Prompt injection hygiene: external text is treated as untrusted.
            </li>
            <li className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-zinc-400" />
              CLI authorization only allows localhost callbacks.
            </li>
            <li className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-zinc-400" />
              Audit gate: PASS/FAIL with issues list (coming next).
            </li>
          </ul>
        </div>

        <Card className="border-zinc-200/70 bg-white/70 backdrop-blur dark:border-zinc-800/70 dark:bg-zinc-950/60">
          <div className="text-sm font-semibold">Quick start</div>
          <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Apply schema → login → enter SPOT → authorize CLI.
          </div>

          <div className="mt-4 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
            <div className="font-mono">claw-fe login</div>
            <div className="mt-1 font-mono">claw-fe spot</div>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <Button as="link" href="/login" variant="primary">
              Login
            </Button>
            <Button as="link" href="/tables" variant="secondary">
              Open Tables
            </Button>
          </div>
        </Card>
      </section>

      <footer className="border-t border-zinc-200 pt-8 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        CLAW:FE SPOT • Built for execution • Local-first agents (planned)
      </footer>
    </main>
  );
}
