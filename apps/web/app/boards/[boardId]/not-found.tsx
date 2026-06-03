import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { RouteState } from "@/shared/ui/route-state";
import { Button } from "@workspace/ui/components/button";

const BoardNotFoundPage = () => (
  <RouteState
    actions={
      <Button asChild>
        <Link href="/dashboard">
          <ArrowLeft aria-hidden="true" />
          Back to dashboard
        </Link>
      </Button>
    }
    description="This board does not exist, was deleted, or your account no longer has access to it."
    eyebrow="Board unavailable"
    title="Board not found"
  />
);

export default BoardNotFoundPage;
