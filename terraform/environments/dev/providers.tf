terraform {
  required_version = ">=1.6"
  required_providers {
    aws = {
        source = "hashicorp/aws"
        version = "~> 5.0"
    }
  }
}
provider "aws" {
  region = var.aws_region

  default_tags {              # every resource gets these tags automatically
    tags = {
      Project   = "apai-frontend-dev"
      ManagedBy = "terraform"
    }
  }
}