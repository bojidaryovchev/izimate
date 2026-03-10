# Bootstrap script for Pulumi S3 backend
# Run this ONCE before first `pulumi up`
#
# Prerequisites:
#   - AWS CLI installed and configured
#   - AWS SSO session active: aws sso login --profile izimate
#
# Usage:
#   .\bootstrap.ps1

$ErrorActionPreference = "Stop"

$BUCKET_NAME = "izimate-pulumi-state"
$REGION = "eu-central-1"
$PROFILE = "izimate"

Write-Host "Creating S3 bucket for Pulumi state..." -ForegroundColor Cyan

# Create bucket
aws s3api create-bucket `
    --bucket $BUCKET_NAME `
    --region $REGION `
    --create-bucket-configuration LocationConstraint=$REGION `
    --profile $PROFILE

Write-Host "Enabling versioning..." -ForegroundColor Cyan

# Enable versioning (important for state recovery)
aws s3api put-bucket-versioning `
    --bucket $BUCKET_NAME `
    --versioning-configuration Status=Enabled `
    --profile $PROFILE

Write-Host "Blocking public access..." -ForegroundColor Cyan

# Block all public access
aws s3api put-public-access-block `
    --bucket $BUCKET_NAME `
    --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true" `
    --profile $PROFILE

Write-Host "Enabling server-side encryption..." -ForegroundColor Cyan

# Enable default encryption (use temp file to avoid PowerShell JSON escaping issues)
$tempFile = [System.IO.Path]::GetTempFileName()
@'
{
    "Rules": [{
        "ApplyServerSideEncryptionByDefault": {
            "SSEAlgorithm": "AES256"
        },
        "BucketKeyEnabled": true
    }]
}
'@ | Set-Content -Path $tempFile

aws s3api put-bucket-encryption `
    --bucket $BUCKET_NAME `
    --server-side-encryption-configuration "file://$tempFile" `
    --profile $PROFILE

Remove-Item $tempFile

Write-Host ""
Write-Host "Bootstrap complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Bucket created: s3://$BUCKET_NAME" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. cd infra"
Write-Host "  2. pulumi login s3://izimate-pulumi-state --cloud-url s3://izimate-pulumi-state"
Write-Host "  3. pulumi stack init staging"
Write-Host "  4. pulumi preview"
