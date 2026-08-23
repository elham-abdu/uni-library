import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getBorrowedBooks } from "@/lib/actions/borrow";
import ProfileClient from "@/components/ProfileClient";

export default async function MyProfile() {
  const session = await auth();

  // Redirect to sign-in if not authenticated
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const result = await getBorrowedBooks(session.user.id);
  const borrowedBooks = result.success ? result.data : [];

  return <ProfileClient borrowedBooks={borrowedBooks} userId={session.user.id} />;
}