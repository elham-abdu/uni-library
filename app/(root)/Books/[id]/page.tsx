import React from "react";
import { sampleBooks } from "@/constants";
import BookOverview from "@/components/BookOverview";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  // Robust string matching for ID
  const bookDetails = sampleBooks.find(
    (book) => String(book.id) === String(id)
  );

  if (!bookDetails) {
    return (
      <div className="text-white p-10">
        <h1 className="text-2xl font-bold">Book Not Found</h1>
        <p className="mt-2 text-light-100">
          No book matching ID <code className="bg-dark-100 px-2 py-1 rounded">{id}</code> found.
        </p>
      </div>
    );
  }

  return (
    <>
      <BookOverview {...bookDetails} />

      <div className="book-details mt-10 flex flex-col gap-16 lg:flex-row">
        <div className="flex-[2]">
          <section className="flex flex-col gap-7">
            <h3 className="text-xl font-semibold text-white">Summary</h3>

            <div className="space-y-5 text-xl leading-7 text-light-100">
              {(bookDetails.summary || bookDetails.description || "")
                .split("\n")
                .map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default Page;