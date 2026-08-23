"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useSession, signOut } from 'next-auth/react';

const Header = () => {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // Show loading state
  if (status === "loading") {
    return (
      <header className="my-10 flex justify-between gap-5">
        <Link href="/">
          <Image src="/icons/logo.svg" alt="logo" width={40} height={40} />
        </Link>
        <div className="text-light-100">Loading...</div>
      </header>
    );
  }

  // If not authenticated, only show logo and sign in link
  if (!session?.user) {
    return (
      <header className="my-10 flex justify-between gap-5">
        <Link href="/">
          <Image src="/icons/logo.svg" alt="logo" width={40} height={40} />
        </Link>
        <ul className="flex flex-row items-center gap-8">
          <li>
            <Link
              href="/sign-in"
              className="text-base cursor-pointer capitalize text-light-100 hover:text-light-200 transition-colors"
            >
              Sign In
            </Link>
          </li>
        </ul>
      </header>
    );
  }

  // Authenticated user - show full navigation
  return (
    <header className="my-10 flex justify-between gap-5">
      <Link href="/">
        <Image src="/icons/logo.svg" alt="logo" width={40} height={40} />
      </Link>

      <ul className="flex flex-row items-center gap-8">
        <li>
          <Link
            href="/library"
            className={cn(
              'text-base cursor-pointer capitalize',
              pathname === '/library' ? 'text-light-200' : 'text-light-100'
            )}
          >
            Library
          </Link>
        </li>
        <li>
          <Link
            href="/my-profile"
            className={cn(
              'text-base cursor-pointer capitalize',
              pathname === '/my-profile' ? 'text-light-200' : 'text-light-100'
            )}
          >
            My Profile
          </Link>
        </li>
        <li>
          <button
            onClick={() => signOut()}
            className="text-base cursor-pointer capitalize text-light-100 hover:text-light-200 transition-colors"
          >
            Sign Out
          </button>
        </li>
      </ul>
    </header>
  );
};

export default Header;