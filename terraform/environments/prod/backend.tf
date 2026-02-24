terraform {
  backend "s3" {
    bucket = "apai-prod-frontend-terraform-state"
    key    = "prod/terraform.tfstate"
    region = "us-east-1"
    encrypt = true

  }
}