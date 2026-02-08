"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";

interface Profile {
  id: string;
  email: string;
  display_name: string;
}

export function SettingsClient() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Preferences state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load profile and persisted preferences
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          setDisplayName(data.display_name ?? "");
        }
      } catch {
        // Network error — server may be restarting or unavailable
      } finally {
        setIsLoading(false);
      }
    }
    load();

    // Load dark mode from localStorage
    try {
      const savedTheme = localStorage.getItem("theme");
      setDarkMode(savedTheme === "dark" || (!savedTheme && document.documentElement.classList.contains("dark")));
    } catch { /* ignore */ }

    // Load email notifications preference
    try {
      const savedNotif = localStorage.getItem("emailNotifications");
      if (savedNotif !== null) setEmailNotifications(savedNotif === "true");
    } catch { /* ignore */ }
  }, []);

  const toggleDarkMode = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    if (next) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch { /* ignore */ }
  }, [darkMode]);

  const toggleEmailNotifications = useCallback(() => {
    const next = !emailNotifications;
    setEmailNotifications(next);
    try {
      localStorage.setItem("emailNotifications", String(next));
    } catch { /* ignore */ }
  }, [emailNotifications]);

  async function handleSave() {
    setIsSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_name: displayName }),
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      // Network error
    } finally {
      setIsSaving(false);
    }
  }

  function handleSignOut() {
    router.push("/logout");
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="h-10 w-48 animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800" />
        <div className="h-48 animate-pulse rounded-2xl bg-stone-100 dark:bg-stone-800" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Manage your profile, preferences, and API keys."
      />

      {/* Profile */}
      <Card>
        <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-stone-400">
          Profile
        </div>
        <div className="space-y-4">
          <Input
            label="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <Input
            label="Email"
            value={profile?.email ?? ""}
            disabled
          />
          <div className="flex items-center justify-end gap-3">
            {saved && (
              <span className="text-xs font-medium text-emerald-600">Saved!</span>
            )}
            <Button
              as="button"
              variant="primary"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Preferences */}
      <Card>
        <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-stone-400">
          Preferences
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Email Notifications</div>
              <div className="text-xs text-stone-500 dark:text-stone-400">
                Receive email for pending approvals and certifications.
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={emailNotifications}
              aria-label="Toggle email notifications"
              onClick={toggleEmailNotifications}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                emailNotifications
                  ? "bg-amber-500"
                  : "bg-stone-300 dark:bg-stone-700"
              }`}
            >
              <span
                className={`block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                  emailNotifications ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Dark Mode</div>
              <div className="text-xs text-stone-500 dark:text-stone-400">
                Toggle dark appearance.
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={darkMode}
              aria-label="Toggle dark mode"
              onClick={toggleDarkMode}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                darkMode
                  ? "bg-amber-500"
                  : "bg-stone-300 dark:bg-stone-700"
              }`}
            >
              <span
                className={`block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                  darkMode ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </Card>

      {/* API Keys */}
      <Card>
        <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-stone-400">
          API Keys
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-stone-200 px-4 py-3 dark:border-stone-800">
            <div>
              <div className="text-sm font-medium">CLI Access Token</div>
              <div className="font-mono text-xs text-stone-400">
                sk-••••••••••••••••
              </div>
            </div>
            <button
              className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-500 transition-colors dark:border-stone-700"
              disabled
              title="Coming soon"
            >
              Coming soon
            </button>
          </div>
        </div>
      </Card>

      {/* Account */}
      <Card>
        <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-stone-400">
          Account
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Sign Out</div>
              <div className="text-xs text-stone-500 dark:text-stone-400">
                Sign out of your account on this device.
              </div>
            </div>
            <Button as="button" variant="secondary" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="border-rose-200 dark:border-rose-900/50">
        <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-rose-500">
          Danger Zone
        </div>
        {!showDeleteConfirm ? (
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Delete Account</div>
              <div className="text-xs text-stone-500 dark:text-stone-400">
                Permanently remove your account and all associated data.
              </div>
            </div>
            <Button as="button" variant="danger" onClick={() => setShowDeleteConfirm(true)}>
              Delete Account
            </Button>
          </div>
        ) : (
          <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 dark:border-rose-900/50 dark:bg-rose-950/20">
            <p className="text-sm font-medium text-rose-700 dark:text-rose-300">
              Are you sure? This action cannot be undone.
            </p>
            <p className="mt-1 text-xs text-rose-600/70 dark:text-rose-400/70">
              All your SPOTs, agents, audit data, and settings will be permanently deleted.
            </p>
            <div className="mt-4 flex gap-2">
              <Button
                as="button"
                variant="danger"
                onClick={() => {
                  // TODO: Implement actual account deletion via Supabase Admin API
                  setShowDeleteConfirm(false);
                }}
              >
                Yes, Delete Everything
              </Button>
              <Button
                as="button"
                variant="ghost"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
