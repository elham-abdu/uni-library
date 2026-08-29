import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserById } from "@/lib/actions/user";
import SettingsClient from "@/components/SettingsClient";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const user = await getUserById(session.user.id);

  if (!user) {
    redirect("/sign-in");
  }

  return <SettingsClient user={user} />;
}