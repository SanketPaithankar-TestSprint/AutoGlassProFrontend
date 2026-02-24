variable "s3_bucket_regional_domain_name" {
  description = "The regional domain name of the S3 bucket."
  type        = string
}
variable "s3_bucket_id"{
    description = "S3 bucket ID"
    type = string
}
variable "environment" {
  description = "The environment name."
  type        = string
}
variable "price_class" {
  description = "Price class of cloudfront"
  type        = string
  default = "PriceClass_100"  # cheapest option: only US, Canada, Europe
}
variable "custom_domain" {
  description = "Custom domain name for CloudFront distribution"
  type        = string
  default = ""
}
variable "acm_certificate_arn" {
  description = "The ARN of the ACM certificate for the custom domain"
  type        = string
  default = ""
}