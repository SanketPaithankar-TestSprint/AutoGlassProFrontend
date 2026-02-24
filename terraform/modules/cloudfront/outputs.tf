output "distribution_id" {
  description = "The ID of the CloudFront distribution (used for invalidations in GitHub Actions)"
  value       = aws_cloudfront_distribution.this.id
}

output "distribution_arn" {
  description = "The ARN of the CloudFront distribution (used in WAF and IAM policies)"
  value       = aws_cloudfront_distribution.this.arn
}

output "distribution_domain_name" {
  description = "The default CloudFront domain name (e.g. d1abc123.cloudfront.net)"
  value       = aws_cloudfront_distribution.this.domain_name
}
