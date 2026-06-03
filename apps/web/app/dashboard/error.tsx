"use client";

import { RotateCcw } from "lucide-react";

import { RouteState } from "@/shared/ui/route-state";
import { Button } from "@workspace/ui/components/button";

interface Props {
  reset: () => void;
}

const DashboardErrorPage = ({ reset }: Props) => (
  <RouteState
    actions={
      <Button onClick={reset} type="button">
        <RotateCcw aria-hidden="true" />
        Retry dashboard
      </Button>
    }
    description="The dashboard could not be loaded. Retry the request to fetch your boards again."
    eyebrow="Dashboard error"
    title="Could not load dashboard"
  />
);

export default DashboardErrorPage;
