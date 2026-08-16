import { getBookById } from "@/lib/actions/book";
import { sampleBooks } from "@/constants";
import { notFound } from "next/navigation";
import BookOverview from "@/components/BookOverview";
import { auth } from "@/auth";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const session = await auth();

  // 1. Fetch book from database
  const result = await getBookById(id);

  let book = result?.success ? result.data : null;

  // 2. Fallback to sampleBooks if not found in database
  if (!book) {
    book = sampleBooks.find((b) => b.id === id) || null;
  }

  // 3. Trigger 404 if not found in sampleBooks either
  if (!book) return notFound();

  return (
    <>
      <BookOverview {...book} userId={session?.user?.id || ""} />

      <div className="book-details mt-10">
        <section className="flex flex-col gap-7 font-ibm-plex-sans">
          <h3 className="text-xl font-semibold text-white">Summary</h3>
          <p className="text-light-100 text-base leading-7">{book.summary}</p>
        </section>
      </div>
    </>
  );
};

export default Page;