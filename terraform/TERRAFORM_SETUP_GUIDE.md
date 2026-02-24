# 🚀 Quick Guide to Running Terraform for This Project

This guide covers the simple steps to initialize and run the existing Terraform code for our AWS infrastructure (S3 & CloudFront), including how to set up the remote state file.

---

## Step 1: Prepare the Remote State Backend Bucket

Terraform state stores the current reality of your infrastructure. Instead of storing it on your laptop, we store it in AWS S3 so you don't lose it or overwrite your teammate's work.

You need to create this state storage bucket **manually (or via a quick CLI command) once** before Terraform can use it.

To create the backend bucket for the `dev` environment, open your terminal and run:

```bash
aws s3api create-bucket \
  --bucket apai-dev-frontend-terraform-state \
  --region us-east-1
```
*(If you are setting up `prod`, replace `dev` with `prod` in the bucket name above).*

---

## Step 2: Open the Environment Details

Next, navigate into the environment directory you want to deploy (`dev` or `prod`).

```bash
cd terraform/environments/dev
```

---

## Step 3: Check Environment Variables

Each environment has a `terraform.tfvars` file (or `terraform.tfvars.example` that you must copy/rename to `terraform.tfvars`).

Make sure `terraform.tfvars` has values that match what you want, like:

```hcl
environment          = "dev"
bucket_site_name     = "dev-app-frontend"
cors_allowed_origins = ["http://localhost:3000"]
price_class          = "PriceClass_100"
```

---

## Step 4: Initialize the Configuration

This step downloads the necessary AWS plugins and connects Terraform to your S3 remote state bucket created in Step 1.

```bash
terraform init
```

*Note: If Terraform complains about the state bucket not existing, double-check Step 1.*

---

## Step 5: Review the Plan

Before actually creating AWS resources, ask Terraform to show you a "Plan" of what it intends to build:

```bash
terraform plan
```
Read through the output. It will tell you exactly what is going to be created (a green `+` means a resource will be added).

---

## Step 6: Apply the Changes

If the plan looks great and you are ready to deploy to AWS, run the Apply command:

```bash
terraform apply -auto-approve
```

Terraform will show the plan one more time and prompt you to confirm. 
Type `yes` and press enter. 

Your S3 website bucket and CloudFront distribution will now be deployed!

---

## 🧹 Cleanup (Optional)

If you ever want to completely tear down these AWS resources (like deleting the dev environment to save money), run:

```bash
terraform destroy
```
Type `yes` when prompted. This removes everything **except** the remote state bucket you created in Step 1.
