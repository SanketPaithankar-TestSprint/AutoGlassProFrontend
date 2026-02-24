terraform {
  backend "s3" {
    bucket = "apai-dev-frontend-terraform-state"
    key    = "dev/terraform.tfstate"
    region = "us-east-1"
    encrypt = true

  }
}