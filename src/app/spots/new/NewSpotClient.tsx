"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { PageHeader } from "@/components/ui/PageHeader";

export function NewSpotClient() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [mode, setMode] = useState<"discuss" | "execute">("discuss");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !goal.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/spots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), goal: goal.trim(), mode }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/spots/${data.id ?? ""}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="New SPOT"
        subtitle="Start a discussion or execution workspace."
      />

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Title"
            placeholder="e.g. Write 20 blog posts"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Textarea
            label="Goal"
            placeholder="What should this SPOT achieve?"
            rows={3}
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            required
          />

          <div className="grid gap-1.5">
            <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
              Mode
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode("discuss")}
                className={`flex-1 rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                  mode === "discuss"
                    ? "border-sky-300 bg-sky-50 text-sky-800 dark:border-sky-700 dark:bg-sky-950/40 dark:text-sky-200"
                    : "border-stone-200 hover:border-stone-300 dark:border-stone-800 dark:hover:border-stone-700"
                }`}
              >
                <div className="font-medium">Discuss</div>
                <div className="mt-0.5 text-xs opacity-70">
                  Chat &amp; voice only. No tool execution.
                </div>
              </button>
              <button
                type="button"
                onClick={() => setMode("execute")}
                className={`flex-1 rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                  mode === "execute"
                    ? "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200"
                    : "border-stone-200 hover:border-stone-300 dark:border-stone-800 dark:hover:border-stone-700"
                }`}
              >
                <div className="font-medium">Execute</div>
                <div className="mt-0.5 text-xs opacity-70">
                  Tools allowed. L1 auditor required.
                </div>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              as="link"
              href="/spots"
              variant="ghost"
            >
              Cancel
            </Button>
            <Button
              as="button"
              variant="primary"
              type="submit"
              disabled={isSubmitting || !title.trim() || !goal.trim()}
            >
              {isSubmitting ? "Creating..." : "Create SPOT"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
