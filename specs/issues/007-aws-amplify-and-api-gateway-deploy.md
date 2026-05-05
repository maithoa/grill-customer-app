## What to build

Deploy the full application to AWS. This is a HITL slice: it requires human decisions and manual steps (IAM setup, SSM secrets provisioning, Amplify project creation) before automated deployment can run.

Deploy the Events and Signups Lambdas via Serverless Framework with production CORS, SSM-backed secrets, and correct concurrency settings. Host the Next.js frontend on AWS Amplify. Verify the end-to-end login → browse → sign-up flow works in production.

## Acceptance criteria

- [ ] AWS IAM user/role created with least-privilege permissions for Lambda, API Gateway, SSM, and CloudWatch
- [ ] SSM Parameter Store populated with `/grill-customers/supabase-url` and `/grill-customers/supabase-anon-key` in `ap-southeast-2`
- [ ] `serverless deploy` succeeds for `services/events/` — Events Lambda live behind API Gateway
- [ ] `serverless deploy` succeeds for `services/signups/` — Signups Lambda live with EventBridge warm-up rule
- [ ] Concurrency settings applied: Auth Lambda PC=60/RC=100; Events Lambda PC=10/RC=200; Signups draws from shared pool
- [ ] CORS on API Gateway allows requests only from the Amplify domain
- [ ] Next.js app deployed to AWS Amplify — build succeeds, CloudFront distribution active
- [ ] End-to-end smoke test: visit prod URL → browse events → login → sign up for an event → dashboard reflects sign-up
- [ ] `serverless-offline` still works locally after production config is in place

## Blocked by

- #003 (Upcoming Events page must be complete)
- #004 (Event Detail page must be complete)
- #005 (Home Dashboard must be complete)
- #006 (Sign-Up flow must be complete)
