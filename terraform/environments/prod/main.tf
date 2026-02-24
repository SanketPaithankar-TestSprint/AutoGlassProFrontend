# ─── S3 Module ────────────────────────────────────────────────────────────────
# Creates the private S3 bucket that holds the built frontend files.
# Note: cloudfront_distribution_arn is left empty here and patched in below
# via a two-step approach (S3 needs CF ARN, CF needs S3 domain — chicken & egg).

module "s3" {
  source = "../../modules/s3"

  bucket_name          = var.bucket_name
  environment          = var.environment
  cors_allowed_origins = var.cors_allowed_origins
}

# ─── CloudFront Module ────────────────────────────────────────────────────────
# Creates the CDN distribution in front of S3.
# It receives the S3 bucket's domain name as its origin.

module "cloudfront" {
  source = "../../modules/cloudfront"

  s3_bucket_id                   = module.s3.bucket_id
  s3_bucket_regional_domain_name = module.s3.bucket_regional_domain_name
  environment                    = var.environment
  price_class                    = var.price_class
}

# ─── S3 Bucket Policy (OAC) ───────────────────────────────────────────────────
# Defined here (not in the S3 module) because it needs CloudFront's ARN which
# is only known after the CloudFront distribution is created. Defining it in
# the root avoids the "count on unknown value" plan error.

resource "aws_s3_bucket_policy" "frontend" {
  bucket = module.s3.bucket_id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid    = "AllowCloudFrontOAC"
      Effect = "Allow"
      Principal = {
        Service = "cloudfront.amazonaws.com"
      }
      Action   = "s3:GetObject"
      Resource = "${module.s3.bucket_arn}/*"
      Condition = {
        StringEquals = {
          "AWS:SourceArn" = module.cloudfront.distribution_arn
        }
      }
    }]
  })
}
