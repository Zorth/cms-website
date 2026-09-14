import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Check for expired manual memberships daily at 02:00 UTC
crons.daily(
  "check-expired-memberships",
  { hourUTC: 2, minuteUTC: 0 },
  internal.users.checkExpiredMemberships
);

export default crons;
