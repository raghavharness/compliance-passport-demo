# Compliance Passport

================================================================

**Status: BLOCKED - 3 VIOLATION(S)**

| Field        | Value                                      |
| ------------ | ------------------------------------------ |
| Passport ID  | passport-CRA9nWxf-20260329                 |
| Generated    | 2026-03-29T14:25:00Z                       |
| Pipeline     | compliance_passport_ci (run #3)            |
| Execution    | CRA9nWxfRbWw_452NsMRJQ                     |
| Frameworks   | SOC 2 Type II, SLSA Level 3, PCI DSS v4.0 |
| Health Score | 81 / 100 (13/16 checks passed)            |
| Service      | payment-service v2.1.0                     |

================================================================

## 1. Change Record

| Field          | Value                                                  |
| -------------- | ------------------------------------------------------ |
| Commit         | 09fb7cdf087a4429eee50c4eaa05a225eadbdb50               |
| Author         | Raghav <raghav.gupta@harness.io>                       |
| Date           | 2026-03-29T19:44:46+05:30                              |
| Message        | Rebuild as enterprise payment-service microservice      |
| Branch         | main                                                   |
| Files Changed  | 31 files changed, 2994 insertions(+), 1220 deletions(-)|
| PR             | #2 - Add payment analytics endpoints                   |
| PR Author      | raghavharness                                           |
| PR Branch      | feature/add-payment-analytics                          |
| PR State       | OPEN                                                   |
| PR Created     | 2026-03-29T14:17:59Z                                   |
| PR Diff        | +159 / -0 across 3 files                               |

> Evidence source: Harness MCP `execution_log` (clone_repo step) + GitHub MCP `pull_request_read`

## 2. Code Review Evidence

| Requirement                 | Status | Evidence                                      |
| --------------------------- | ------ | --------------------------------------------- |
| PR created (no direct push) | PASS   | PR #2 exists (feature/add-payment-analytics)  |
| Min 1 approved reviewer     | FAIL   | No approved reviews found on PR #2            |
| Reviewer != Author          | FAIL   | Cannot verify - no reviews submitted          |

> Evidence source: GitHub MCP `pull_request_read` (method: get_reviews)

## 3. Test Attestation

| Requirement             | Status | Evidence                                   |
| ----------------------- | ------ | ------------------------------------------ |
| Unit tests passed       | PASS   | 36/36 passed, 0 failed (12 suites)        |
| Integration tests passed| PASS   | 9/9 passed, 0 failed (2 suites)           |
| All tests passed        | PASS   | 45/45 total tests passed                  |
| Test coverage           | INFO   | Coverage measurement not configured        |

> Evidence source: Harness MCP `execution_log` (unit_tests + integration_tests steps)

### Test Breakdown (from pipeline step logs)

**Unit Tests (36 tests):**
- Auth Middleware: 8 tests (authenticate: 5, authorize: 3)
- PaymentService: 11 tests (create: 3, get: 2, refund: 4, list: 2)
- Payment Validators: 17 tests (create: 10, refund: 4, list: 3)

**Integration Tests (9 tests):**
- Health Endpoints: 3 tests (healthy status, readiness check, 404 handling)
- Payment API: 6 tests (auth rejection, create, validation, list, refund, RBAC)

## 4. Lint Attestation

| Requirement        | Status | Evidence                          |
| ------------------ | ------ | --------------------------------- |
| ESLint passed      | PASS   | 0 errors, 0 warnings             |
| Code style         | PASS   | All files comply with .eslintrc   |

> Evidence source: Harness MCP `execution_log` (run_lint step)

## 5. Security Attestation

| Scan Type                   | Status | Findings                                       |
| --------------------------- | ------ | ---------------------------------------------- |
| SAST - Secret Detection     | PASS   | 0 hardcoded secrets in source code             |
| SAST - Dangerous Functions  | PASS   | 0 eval/Function/child_process usage            |
| SAST - .env.example Audit   | WARN   | Placeholder values match secret patterns       |
| SCA - Dependency Audit      | PASS   | 0 critical, 0 high, 0 moderate, 0 low vulns   |
| SCA - Total Vulnerabilities | PASS   | 0 total vulnerabilities across 221 packages    |

> Evidence source: Harness MCP `execution_log` (sast_scan + sca_scan steps)

### SAST Detail
The .env.example file contains placeholder values (`sk_live_your-stripe-key`, `whsec_your-webhook-secret`)
that match secret patterns. While these are placeholders (not real secrets), this triggers a warning.
The agent flagged this for review but did not count it as a violation since no actual secrets were exposed.

## 6. SBOM Summary

| Metric                        | Value                                         |
| ----------------------------- | --------------------------------------------- |
| Direct production dependencies| 8                                             |
| Dev dependencies              | 1 (eslint)                                    |
| Total components (transitive) | 221                                           |
| SBOM Format                   | CycloneDX v1.5                                |
| Generator                     | Harness CI SBOM Generator v1.0.0              |
| License compliance            | Standard OSS licenses (MIT, Apache-2.0, ISC)  |

> Evidence source: Harness MCP `execution_log` (generate_sbom step)

### Dependency Inventory
| Dependency        | Purpose                      |
| ----------------- | ---------------------------- |
| express           | HTTP framework               |
| jsonwebtoken      | JWT authentication           |
| helmet            | Security headers             |
| cors              | Cross-origin resource sharing|
| express-rate-limit| Rate limiting                |
| joi               | Input validation             |
| uuid              | UUID generation              |
| winston           | Structured logging           |

## 7. Container Security

| Check                     | Status | Evidence                          |
| ------------------------- | ------ | --------------------------------- |
| Non-root user             | PASS   | USER appuser configured           |
| Health check              | PASS   | HEALTHCHECK configured            |
| Multi-stage build         | PASS   | AS builder stage detected         |
| Dependency layer caching  | PASS   | COPY package*.json before src     |
| Dockerfile issues         | 0      | All best practices met            |

> Evidence source: Harness MCP `execution_log` (validate_dockerfile step)

## 8. Build Provenance (SLSA Level 3)

| Field              | Value                                                      |
| ------------------ | ---------------------------------------------------------- |
| Builder            | Harness CI - Cloud runner (Linux/Amd64)                    |
| Builder Image      | node:20                                                    |
| Pipeline           | compliance_passport_ci                                     |
| Execution ID       | CRA9nWxfRbWw_452NsMRJQ                                    |
| Run Sequence       | #3                                                         |
| Source repo        | github.com/raghavharness/compliance-passport-demo          |
| Source commit      | 09fb7cdf087a4429eee50c4eaa05a225eadbdb50                   |
| Build trigger      | MANUAL (raghav.gupta@harness.io)                           |
| Build started      | 2026-03-29T14:19:52Z                                      |
| Build completed    | 2026-03-29T14:21:08Z                                      |
| Build duration     | 1m 15s                                                     |
| Infrastructure     | Harness Hosted (ephemeral VM, medium class)                |
| SBOM attached      | Yes (CycloneDX v1.5, 221 components)                      |

> Evidence source: Harness MCP `harness_get` (execution) + `harness_diagnose`

## 9. Compliance Framework Results

### SOC 2 Type II

| Control  | Requirement                    | Status | Evidence                             |
| -------- | ------------------------------ | ------ | ------------------------------------ |
| CC6.1    | Change via Pull Request        | PASS   | PR #2 exists                         |
| CC6.1    | Reviewer != Author             | FAIL   | No reviews on PR #2                  |
| CC7.1    | All tests passed               | PASS   | 45/45 tests passed                   |
| CC7.2    | No critical/high vulns         | PASS   | 0 critical, 0 high (npm audit)       |
| CC7.2    | No hardcoded secrets           | PASS   | 0 secrets in source code             |
| CC8.1    | Code review approved           | FAIL   | No approved reviews on PR #2         |

**SOC 2 Result: FAIL** (2 violations)

### SLSA Level 3

| Control    | Requirement              | Status | Evidence                              |
| ---------- | ------------------------ | ------ | ------------------------------------- |
| Source     | Version controlled        | PASS   | Git commit 09fb7cd                    |
| Source     | Change reviewed           | WARN   | PR #2 exists but not reviewed         |
| Build      | Scripted build            | PASS   | Harness CI pipeline execution         |
| Build      | Isolated environment      | PASS   | Harness Cloud ephemeral VM            |
| Provenance | Build provenance          | PASS   | Passport serves as provenance record  |
| Provenance | SBOM generated            | PASS   | 221 components documented             |

**SLSA Level 3 Result: PASS** (with advisory warning)

### PCI DSS v4.0 (Payment Service)

| Requirement | Description                     | Status | Evidence                          |
| ----------- | ------------------------------- | ------ | --------------------------------- |
| 6.2.1       | Secure development practices    | PASS   | ESLint + SAST analysis passed     |
| 6.2.3       | Code review before release      | FAIL   | No review approval on PR #2      |
| 6.3.1       | Vulnerability identification    | PASS   | SCA + SAST scans completed        |
| 6.3.2       | Custom application code review  | PASS   | ESLint analysis: 0 errors         |

**PCI DSS v4.0 Result: FAIL** (1 violation)

## VIOLATIONS - ACTION REQUIRED

This build is **BLOCKED** due to 3 compliance violation(s):

| # | Framework  | Control | Violation                        | Severity |
| - | ---------- | ------- | -------------------------------- | -------- |
| 1 | SOC 2      | CC6.1   | No approved reviewer on PR #2    | Critical |
| 2 | SOC 2      | CC8.1   | Code review not approved         | Critical |
| 3 | PCI DSS    | 6.2.3   | No code review before release    | Critical |

### Remediation Steps

1. Request code review from at least 1 team member (not the PR author `raghavharness`)
2. Get the PR **approved** before merging to main
3. Re-run the pipeline after the PR is approved
4. The Compliance Passport Agent will re-evaluate and update the status

> In a production environment, this pipeline would FAIL at this stage,
> preventing non-compliant code from being deployed.

---

## Evidence Collection Method

This passport was generated by the **Compliance Passport Agent** using:

| Source           | Tool                                  | Data Collected                    |
| ---------------- | ------------------------------------- | --------------------------------- |
| Pipeline         | Harness MCP `harness_get` (execution) | Status, timing, trigger info      |
| Clone Step       | Harness MCP `execution_log`           | Commit SHA, author, branch        |
| Lint Step        | Harness MCP `execution_log`           | ESLint errors/warnings            |
| Unit Tests       | Harness MCP `execution_log`           | 36 test results (TAP output)      |
| Integration Tests| Harness MCP `execution_log`           | 9 test results (TAP output)       |
| SAST Scan        | Harness MCP `execution_log`           | Secret detection, dangerous funcs |
| SCA Scan         | Harness MCP `execution_log`           | npm audit vulnerability counts    |
| SBOM Generation  | Harness MCP `execution_log`           | Component count, format, deps     |
| Dockerfile       | Harness MCP `execution_log`           | Best practice validation results  |
| Pull Request     | GitHub MCP `pull_request_read`        | PR details, diff, state           |
| PR Reviews       | GitHub MCP `get_reviews`              | Review status, approvals          |
| Codebase         | Local filesystem analysis             | Project structure, config files   |

---

## Passport ID: passport-CRA9nWxf-20260329
Generated: 2026-03-29T14:25:00Z
Pipeline: compliance_passport_ci | Execution: CRA9nWxfRbWw_452NsMRJQ
Integrity: 1afa5607cfbc718435173402575c424f4fcf46c4e6549526881005c2ccee2307
