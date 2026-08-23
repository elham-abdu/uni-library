import { getBookById } from "@/lib/actions/book";
import BookOverview from "@/components/BookOverview";
import { notFound } from "next/navigation";
import { auth } from "@/auth";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BookDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  
  const result = await getBookById(id);

  if (!result.success || !result.data) {
    notFound();
  }

  return <BookOverview {...result.data} userId={session?.user?.id || ""} />;
}