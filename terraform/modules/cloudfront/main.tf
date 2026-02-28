# ─── Origin Access Control (OAC) ─────────────────────────────────────────────
# The "key card" that lets CloudFront authenticate itself to the private S3 bucket.
# Without this, S3 would reject CloudFront requests (public access is blocked).

resource "aws_cloudfront_origin_access_control" "this" {
  name                              = "${var.s3_bucket_id}-oac"
  description                       = "OAC for S3 bucket ${var.s3_bucket_id}"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"  # sign every request to S3
  signing_protocol                  = "sigv4"   # AWS Signature Version 4
}

# ─── CloudFront Function ──────────────────────────────────────────────────────

resource "aws_cloudfront_function" "append_index" {
  name    = "${var.environment}-append-index"
  runtime = "cloudfront-js-1.0"
  comment = "Appends index.html to request URIs for SPA routing"
  publish = true
  code    = file("${path.module}/append_index.js")
}

# ─── CloudFront Distribution ───────────────────────────────────────────────────

resource "aws_cloudfront_distribution" "this" {

  # ── Origin: where CloudFront fetches files from ──────────────────────────────
  origin {
    domain_name              = var.s3_bucket_regional_domain_name # e.g. bucket.s3.us-east-1.amazonaws.com
    origin_id                = "S3-${var.s3_bucket_id}"          # internal label, links to cache behaviors
    origin_access_control_id = aws_cloudfront_origin_access_control.this.id
  }

  # ── Basic settings ────────────────────────────────────────────────────────────
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"  # serve index.html when user visits /
  price_class         = var.price_class
  comment             = "${var.environment} frontend distribution"

  # ── Cache behavior 1: /assets/* (hashed JS/CSS/images) ───────────────────────
  # These files have a content hash in their filename (e.g. index-Abc123.js)
  # so they NEVER change. Cache them at the edge for 1 full year.
  ordered_cache_behavior {
    path_pattern           = "/assets/*"          # matches /assets/index-Abc123.js etc.
    target_origin_id       = "S3-${var.s3_bucket_id}"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true                 # Brotli/gzip at the edge

    allowed_methods = ["GET", "HEAD"]
    cached_methods  = ["GET", "HEAD"]

    forwarded_values {
      query_string = false          # don't forward query strings to S3
      cookies { forward = "none" }  # don't forward cookies to S3
    }

    min_ttl     = 31536000  # 1 year in seconds — never expire these from edge cache
    default_ttl = 31536000
    max_ttl     = 31536000
  }

  # ── Default cache behavior: everything else (HTML files) ──────────────────────
  # HTML files are NOT hashed — index.html changes on every deploy.
  # TTL = 0 means CloudFront always re-fetches from S3. Ensures users always
  # get the latest index.html after a deploy + CloudFront invalidation.
  default_cache_behavior {
    target_origin_id       = "S3-${var.s3_bucket_id}"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    allowed_methods = ["GET", "HEAD"]
    cached_methods  = ["GET", "HEAD"]

    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }

    min_ttl     = 0  # never cache HTML at edge
    default_ttl = 0
    max_ttl     = 0

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.append_index.arn
    }
  }

  # ── SPA routing fix ───────────────────────────────────────────────────────────
  # When a user navigates directly to /dashboard or refreshes a deep route,
  # S3 returns a 403 (file not found in bucket). We intercept that and
  # return index.html with a 200 — React Router then handles the route internally.
  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  # ── Restrictions ─────────────────────────────────────────────────────────────
  # Required block — "none" means no geo-blocking (serve to all countries)
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # ── TLS Certificate ───────────────────────────────────────────────────────────
  # "cloudfront_default_certificate = true" uses the free *.cloudfront.net cert.
  # If you add a custom domain later, set this to false and provide an ACM cert ARN.
  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}