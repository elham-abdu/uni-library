import { getBookById } from "@/lib/actions/book";
import { getUserHoldForBook } from "@/lib/actions/hold";
import { getBookReadingListStatus } from "@/lib/actions/reading-list";
import {
  getBookReviews,
  getRatingBreakdown,
  getUserReview,
  canReview,
  hasVoted,
} from "@/lib/actions/review";
import BookOverview from "@/components/BookOverview";
import BookReviews from "@/components/BookReviews";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/database/drizzle";
import { reviews as reviewsTable } from "@/database/schema";
import { eq } from "drizzle-orm";

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

  // User-specific data
  let existingHold = null;
  let readingListStatus = null;
  let userReview = null;
  let userCanReview = false;

  if (session?.user?.id) {
    const [holdResult, readingListResult, userReviewResult, canReviewResult] =
      await Promise.all([
        getUserHoldForBook({
          userId: session.user.id,
          bookId: id,
        }),
        getBookReadingListStatus({
          userId: session.user.id,
          bookId: id,
        }),
        getUserReview({
          userId: session.user.id,
          bookId: id,
        }),
        canReview({
          userId: session.user.id,
          bookId: id,
        }),
      ]);

    existingHold = holdResult.data;
    readingListStatus = readingListResult.data?.status || null;
    userReview = userReviewResult.data
      ? {
          id: userReviewResult.data.id,
          rating: userReviewResult.data.rating,
          title: userReviewResult.data.title,
          body: userReviewResult.data.body,
        }
      : null;
    userCanReview = canReviewResult.canReview;
  }

  // Reviews data (for all users)
  const [reviewsResult, breakdownResult] = await Promise.all([
    getBookReviews(id),
    getRatingBreakdown(id),
  ]);

  const reviews = reviewsResult.success ? reviewsResult.data : [];
  const breakdown = breakdownResult.data;

  // Get user votes (if signed in)
  let userVotes: string[] = [];
  if (session?.user?.id && reviews.length > 0) {
    const reviewIds = reviews.map((r) => r.id);
    const voteChecks = await Promise.all(
      reviewIds.map((reviewId) =>
        hasVoted({ reviewId, userId: session.user!.id! })
      )
    );
    userVotes = reviewIds.filter((_, i) => voteChecks[i].hasVoted);
  }

  return (
    <>
      <BookOverview
        {...result.data}
        userId={session?.user?.id || ""}
        existingHold={existingHold}
        readingListStatus={readingListStatus}
      />

      <div className="book-details mt-10 pb-20">
        <section className="flex flex-col gap-7 font-ibm-plex-sans">
          <h3 className="text-xl font-semibold text-white">Summary</h3>
          <p className="text-light-100 text-base leading-7">
            {result.data.summary}
          </p>
        </section>
      </div>

      {/* ✅ Reviews Section */}
      <BookReviews
        bookId={id}
        bookTitle={result.data.title}
        userId={session?.user?.id}
        reviews={reviews}
        breakdown={breakdown}
        userReview={userReview}
        canReview={userCanReview}
        userVotes={userVotes}
      />
    </>
  );
}