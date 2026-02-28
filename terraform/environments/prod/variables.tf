variable "aws_region" {
  description = "The AWS region to deploy resources in"
  type        = string
  default     = "us-east-1"
}
variable "bucket_name" {
    description = "The name of the S3 bucket to create."
    type        = string
    default = "autopaneai-frontend-prod"
}
variable "environment" {
    description = "The environment name (e.g., dev, staging, prod)."
    type        = string
    default = "prod"
}
variable "cors_allowed_origins" {
    description = "The list of allowed origins for CORS."
    type        = list(string)
    default = [ ]
}
variable "price_class" {
    description = "Price class of cloudfront"
    type        = string
    default = "PriceClass_100"  # cheapest option: only US, Canada, Europe
}