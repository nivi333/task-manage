# Security & Penetration Testing Guide

## Penetration Testing
- Use OWASP ZAP or Burp Suite to scan the running API at `http://localhost:8080`
- Test for common vulnerabilities:
  - SQL Injection (try payloads in all input fields)
  - XSS (try `<script>` tags in input)
  - CSRF (attempt cross-site POSTs)
  - Broken Authentication (try brute force, token reuse)
  - Insecure Direct Object References (IDOR)
- Document any findings and mitigation steps.

## Vulnerability Scanning
- Use `mvn dependency-check:check` to scan dependencies for CVEs
- Use Snyk or OWASP Dependency-Check for regular scans

## Compliance Testing
- Ensure API enforces HTTPS, rate limiting, CSRF, and secure headers
- Confirm all endpoints require authentication unless public
- Validate input and output for all endpoints

## Automation
- Integrate scans in CI/CD pipeline for every push
