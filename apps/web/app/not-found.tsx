import Link from "next/link";
import { Home } from "lucide-react";

import { RouteState } from "@/shared/ui/route-state";
import { Button } from "@workspace/ui/components/button";

const NotFoundPage = () => (
  <RouteState
    actions={
      <Button asChild>
        <Link href="/dashboard">
          <Home aria-hidden="true" />
          Go to dashboard
        </Link>
      </Button>
    }
    description="The page you are looking for does not exist or is no longer available."
    eyebrow="404"
    title="Page not found"
  />
);

export default NotFoundPage;
