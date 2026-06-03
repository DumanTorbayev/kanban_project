"use client";

import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";

import { RouteState } from "@/shared/ui/route-state";
import { Button } from "@workspace/ui/components/button";

interface Props {
  reset: () => void;
}

const BoardErrorPage = ({ reset }: Props) => (
  <RouteState
    actions={
      <>
        <Button onClick={reset} type="button">
          <RotateCcw aria-hidden="true" />
          Retry board
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard">
            <ArrowLeft aria-hidden="true" />
            Back to dashboard
          </Link>
        </Button>
      </>
    }
    description="The board could not be loaded. Retry the request or return to your dashboard."
    eyebrow="Board error"
    title="Could not load board"
  />
);

export default BoardErrorPage;
