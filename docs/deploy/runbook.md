# Deployment Runbook (Issue 007)

This runbook separates human-in-the-loop (HITL) tasks from executable deploy steps.

Region standard for this project: ap-southeast-2.

## 1) HITL-Only Prerequisites

Complete these manually before deploy commands:

1. IAM
- Create/select an AWS deployment user or role.
- Attach least-privilege permissions needed for CloudFormation, Lambda, API Gateway, EventBridge, SSM, CloudWatch Logs, and deployment S3 access.
- Confirm the principal can assume/use credentials in ap-southeast-2.

2. SSM Parameter Store
- Create/update SSM parameters in ap-southeast-2:
  - /grill-customers/supabase-url
  - /grill-customers/supabase-anon-key
  - /grill-customers/supabase-service-role-key
- See docs/deploy/aws-params.md for exact commands.

3. Amplify
- Create Amplify app and connect repo/branch.
- Capture final Amplify app domain, example:
  - https://your-real-domain.amplifyapp.com

4. CORS placeholder replacement
- Replace the placeholder origin in both serverless files with the real Amplify domain:
  - services/events/serverless.yml
  - services/signups/serverless.yml

## 2) In-Repo Config Status (already prepared)

- Region pinned to ap-southeast-2.
- Supabase values pulled from SSM parameters.
- API Gateway HTTP API CORS is explicit and origin-restricted by config.
- Events function concurrency set to PRD target where practical:
  - provisionedConcurrency: 10
  - reservedConcurrency: 200
- Signups function uses shared concurrency pool (no reservedConcurrency).
- Signups warm-up schedule present (rate 5 minutes), and warm-up remains signups-only.

## 3) Deploy Commands

Run from repository root.

1. Deploy Events service

```bash
cd services/events
npx serverless deploy --stage prod --region ap-southeast-2
```

2. Deploy Signups service

```bash
cd ../signups
npx serverless deploy --stage prod --region ap-southeast-2
```

3. Return to repo root

```bash
cd ../../
```

## 4) Post-Deploy Checks

1. Verify stack outputs and endpoints:

```bash
cd services/events
npx serverless info --stage prod --region ap-southeast-2

cd ../signups
npx serverless info --stage prod --region ap-southeast-2
cd ../../
```

2. Verify EventBridge warm-up rule exists for signups service only.
3. Verify Lambda concurrency on events function:
- Provisioned concurrency configured.
- Reserved concurrency is 200.
4. Verify signups lambda has no reserved concurrency configured.

## 5) Smoke Test (HITL execution)

1. Open Amplify production URL.
2. Browse events page and confirm event list renders.
3. Login with a valid customer account.
4. Sign up for an event.
5. Confirm dashboard reflects the sign-up.
6. Confirm browser network calls to events/signups APIs return success and CORS allows only the configured Amplify origin.

## 6) Troubleshooting Shortlist

- AccessDenied during deploy:
  - Re-check IAM permissions and permission boundaries.
- Missing SSM parameter errors:
  - Confirm names and region ap-southeast-2.
  - Confirm deploy principal has ssm:GetParameter and ssm:GetParameters.
- CORS failures:
  - Ensure placeholder domain has been replaced in both serverless files.
  - Redeploy both services after change.
- Provisioned concurrency errors:
  - Check account concurrency limits and retry after quota adjustment.
