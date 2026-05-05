# AWS Parameters and Secrets (Issue 007)

Region for all commands in this document: ap-southeast-2

## SSM Parameter Names

These parameters are read by Serverless services at deploy/runtime:

- /grill-customers/supabase-url
- /grill-customers/supabase-anon-key
- /grill-customers/supabase-service-role-key

## HITL Required Inputs

A human must collect and provide:

- Supabase project URL
- Supabase anon key
- Supabase service role key

## Create or Update SSM Parameters (HITL)

Run these commands with real values (replace placeholders):

```bash
aws ssm put-parameter \
  --region ap-southeast-2 \
  --name /grill-customers/supabase-url \
  --type String \
  --value "https://YOUR_PROJECT_REF.supabase.co" \
  --overwrite

aws ssm put-parameter \
  --region ap-southeast-2 \
  --name /grill-customers/supabase-anon-key \
  --type SecureString \
  --value "YOUR_SUPABASE_ANON_KEY" \
  --overwrite

aws ssm put-parameter \
  --region ap-southeast-2 \
  --name /grill-customers/supabase-service-role-key \
  --type SecureString \
  --value "YOUR_SUPABASE_SERVICE_ROLE_KEY" \
  --overwrite
```

## Verify SSM Parameters Exist (HITL)

```bash
aws ssm get-parameters \
  --region ap-southeast-2 \
  --names \
    /grill-customers/supabase-url \
    /grill-customers/supabase-anon-key \
    /grill-customers/supabase-service-role-key \
  --with-decryption
```

## IAM Minimum Access for Deployment Principal (HITL)

Deployment user/role should allow at least:

- cloudformation:CreateStack
- cloudformation:UpdateStack
- cloudformation:DescribeStacks
- cloudformation:DescribeStackEvents
- cloudformation:DeleteStack (optional but useful for rollback/remove)
- lambda:CreateFunction
- lambda:UpdateFunctionCode
- lambda:UpdateFunctionConfiguration
- lambda:PutProvisionedConcurrencyConfig
- lambda:GetProvisionedConcurrencyConfig
- lambda:DeleteProvisionedConcurrencyConfig
- apigateway:GET
- apigateway:POST
- apigateway:PATCH
- apigateway:DELETE
- events:PutRule
- events:PutTargets
- events:DescribeRule
- events:DeleteRule
- events:RemoveTargets
- iam:PassRole
- iam:GetRole
- logs:CreateLogGroup
- logs:CreateLogStream
- logs:PutLogEvents
- s3:CreateBucket
- s3:PutObject
- s3:GetObject
- s3:ListBucket
- ssm:GetParameter
- ssm:GetParameters

Notes:

- Least privilege is required; scope Resource ARNs to this project where possible.
- If a permissions boundary or org SCP exists, verify it permits CloudFormation + Lambda + API Gateway + EventBridge flows.
