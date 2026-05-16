"use client";

import { useState } from "react";
import { User, Shield, Cpu, Database } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import { formatBytes } from "@/lib/utils/format";
import { AVAILABLE_MODELS } from "@/lib/services/inferenceService";
import type { Profile } from "@/types/database";
import toast from "react-hot-toast";

interface SettingsViewProps {
  profile: Profile;
}

export function SettingsView({ profile }: SettingsViewProps) {
  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl space-y-6 px-5 py-8">
        <ProfileSection profile={profile} />
        <PlanSection profile={profile} />
        <ModelSection />
        <DangerSection />
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, description }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-canvas-200">
        <Icon className="h-4 w-4 text-ink-muted" />
      </div>
      <div>
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-ink-muted">{description}</p>}
      </div>
    </div>
  );
}

function ProfileSection({ profile }: { profile: Profile }) {
  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName } as never)
      .eq("id", profile.id);

    if (error) toast.error("Failed to save profile");
    else toast.success("Profile updated");
    setSaving(false);
  };

  return (
    <Card>
      <SectionHeader icon={User} title="Profile" description="Your personal information" />
      <div className="flex flex-col gap-4">
        <Input
          label="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Your name"
        />
        <div>
          <label className="text-xs font-medium text-ink-muted">Email</label>
          <p className="mt-1.5 text-sm text-ink-faint">{profile.email}</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          loading={saving}
          onClick={handleSave}
          className="self-start"
        >
          Save changes
        </Button>
      </div>
    </Card>
  );
}

function PlanSection({ profile }: { profile: Profile }) {
  const usedPct = Math.round((profile.storage_used / (100 * 1024 * 1024)) * 100);

  return (
    <Card>
      <SectionHeader icon={Database} title="Plan & Usage" description="Storage and document limits" />
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-ink-muted">Current plan</span>
          <Badge variant="amber">{profile.plan.toUpperCase()}</Badge>
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-ink-muted">Storage used</span>
            <span className="text-ink-faint">
              {formatBytes(profile.storage_used)} / 100 MB
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-canvas-300">
            <div
              className="h-full rounded-full bg-amber transition-all"
              style={{ width: `${Math.min(usedPct, 100)}%` }}
            />
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink-muted">Documents</span>
          <span className="text-ink-faint">{profile.doc_count} / 50</span>
        </div>
      </div>
    </Card>
  );
}

function ModelSection() {
  const [selectedModel, setSelectedModel] = useState("llama-3.3-70b-versatile");

  return (
    <Card>
      <SectionHeader
        icon={Cpu}
        title="AI Model"
        description="Default model for new chat sessions (Groq free tier)"
      />
      <div className="flex flex-col gap-2">
        {AVAILABLE_MODELS.map((model) => (
          <button
            key={model.id}
            onClick={() => setSelectedModel(model.id)}
            className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-all ${
              selectedModel === model.id
                ? "border-amber/40 bg-amber/5 text-ink"
                : "border-[var(--border)] text-ink-muted hover:border-[var(--border-hover)]"
            }`}
          >
            <div>
              <p className="text-sm font-medium">{model.name}</p>
              <p className="text-2xs text-ink-faint">{model.id}</p>
            </div>
            <Badge variant={model.speed === "fast" ? "success" : "default"}>
              {model.speed}
            </Badge>
          </button>
        ))}
        <p className="mt-1 text-2xs text-ink-faint">
          All models via Groq free tier · No API cost
        </p>
      </div>
    </Card>
  );
}

function DangerSection() {
  return (
    <Card>
      <SectionHeader
        icon={Shield}
        title="Account"
        description="Irreversible actions"
      />
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between rounded-lg border border-danger/20 bg-danger/5 px-3 py-2.5">
          <div>
            <p className="text-sm text-ink">Delete all documents</p>
            <p className="text-xs text-ink-muted">
              Permanently deletes all documents and chat history
            </p>
          </div>
          <Button variant="danger" size="sm">
            Delete all
          </Button>
        </div>
      </div>
    </Card>
  );
}
