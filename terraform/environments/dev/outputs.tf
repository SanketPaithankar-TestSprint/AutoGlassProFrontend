output "s3_bucket_name" {
  description = "S3 bucket name — used in GitHub Actions: aws s3 sync dist/ s3://<this value>/"
  value       = module.s3.bucket_id
}

output "s3_bucket_arn" {
  description = "S3 bucket ARN — used in IAM policies"
  value       = module.s3.bucket_arn
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID — used in GitHub Actions for cache invalidation"
  value       = module.cloudfront.distribution_id
}

output "cloudfront_domain_name" {
  description = "CloudFront default domain — visit this URL to see your deployed app"
  value       = module.cloudfront.distribution_domain_name
}
