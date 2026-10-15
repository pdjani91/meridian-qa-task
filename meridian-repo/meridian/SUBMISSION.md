# QA Developer - Technical Assessment Submission

## Time Log & Strategy
**Effort:** Under 2 hours.
**Approach:** Due to local system constraints with Git CLI, I completed the submission using the GitHub Web UI. I relied on GitHub Actions (CI) to validate the build. I focused entirely on high-risk backend logic rather than UI tests.

## Prioritization

**What I Prioritized:**
1. **Feature A1 (Rate Limit Override):** Completed API logic, database updates, and integration with the gateway rate limiter.
2. **Defect SUP-1051 (Revoked keys working):** Critical security flaw. Prioritized fixing this over building new features.
3. **CI/CD Pipeline:** Created a GitHub Action that automatically runs Docker Compose and verifies API health.

**What I Dropped & Why:**
1. **Feature A2 (Key Rotation):** Skipped due to strict time limits. Managing grace periods requires complex DB state tracking.
2. **E2E UI Tests:** Skipped. Backend gateway and billing logic hold the highest business risk. Securing the API was more critical than UI testing.

## Part A - Developer Decision
**Decision on A1:** I allowed the custom rate limit to be set *below* the plan default.
**Why:** This gives admins a secure way to throttle abusive tenants without completely suspending them or deleting their keys.

## Defect Summary (Part C)

| ID | Title | Severity | Diagnosis & Action |
|---|---|---|---|
| **SUP-1051** | Revoked key kept working | CRITICAL | **Cause:** `api-key.service.ts` used a 60-second memory cache. DB changes were ignored. <br>**Action:** Removed the memory cache to force real-time DB lookups. Fixed. |
| **SUP-1067** | Free tier exceeded limit | HIGH | **Cause:** `rate-limit.guard.ts` uses a fixed-window algorithm allowing burst traffic between minutes. <br>**Action:** Diagnosed. Needs migration to a Redis sliding-window algorithm. |

## Test Strategy
My strategy relies on Integration Testing via CI containerization. The GitHub Action proves the system builds successfully, connects to real PostgreSQL/Redis, and the API responds without errors after my schema changes.

## Release Recommendation
**Approved conditionally.** Feature A1 is ready and the critical security flaw (SUP-1051) is patched. However, the rate-limiter flaw (SUP-1067) must be fixed in the next sprint to prevent revenue leakage.

## AI Usage Disclosure
I used ChatGPT as a pair-programmer to assist with NestJS syntax, raw PostgreSQL schema alterations, and to quickly format this Markdown report to meet the deadline.
