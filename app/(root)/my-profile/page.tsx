import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getBorrowedBooks } from "@/lib/actions/borrow";
import { getUserHolds } from "@/lib/actions/hold";
import ProfileClient from "@/components/ProfileClient";

export default async function MyProfile() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const borrowedBooksResult = await getBorrowedBooks(session.user.id);
  const borrowedBooks = borrowedBooksResult.success
    ? borrowedBooksResult.data
    : [];

  const holdsResult = await getUserHolds(session.user.id);
  const holds = holdsResult.success ? holdsResult.data : [];

  return (
    <ProfileClient
      borrowedBooks={borrowedBooks}
      userId={session.user.id}
      holds={holds}
    />
  );
}