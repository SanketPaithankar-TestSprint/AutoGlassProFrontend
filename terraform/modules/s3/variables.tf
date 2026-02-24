variable "bucket_name" {
  description = "Globally unique name for the S3 bucket"
  type        = string
}

variable "environment" {
  description = "Deployment environment (e.g. prod, staging)"
  type        = string
}

variable "cors_allowed_origins" {
  description = "Origins allowed for CORS (leave empty to disable CORS)"
  type        = list(string)
  default     = []
}
