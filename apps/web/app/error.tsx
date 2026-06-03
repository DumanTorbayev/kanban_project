"use client";

import Link from "next/link";
import { Home, RotateCcw } from "lucide-react";

import { RouteState } from "@/shared/ui/route-state";
import { Button } from "@workspace/ui/components/button";

interface Props {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
}

const RootErrorPage = ({ error, reset }: Props) => (
  <RouteState
    actions={
      <>
        <Button onClick={reset} type="button">
          <RotateCcw aria-hidden="true" />
          Try again
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard">
            <Home aria-hidden="true" />
            Go to dashboard
          </Link>
        </Button>
      </>
    }
    description={
      error.digest
        ? `Something went wrong while rendering this page. Reference: ${error.digest}.`
        : "Something went wrong while rendering this page. Try again or return to the dashboard."
    }
    eyebrow="Application error"
    title="Something went wrong"
  />
);

export default RootErrorPage;
