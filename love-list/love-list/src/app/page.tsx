import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/AppShell";
import { Dashboard } from "@/components/Dashboard";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <AppShell initiallyUnlocked={!!user}>
      <Dashboard />
    </AppShell>
  );
}
