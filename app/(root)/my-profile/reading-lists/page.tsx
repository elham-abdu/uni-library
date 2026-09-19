import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getReadingList, getReadingListStats } from "@/lib/actions/reading-list";
import ReadingListsClient from "@/components/ReadingListsClient";

export default async function ReadingListsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const [listResult, stats] = await Promise.all([
    getReadingList({ userId: session.user.id }),
    getReadingListStats(session.user.id),
  ]);

  const allBooks = listResult.success ? listResult.data : [];

  return (
    <ReadingListsClient
      allBooks={allBooks}
      userId={session.user.id}
      stats={stats}
    />
  );
}