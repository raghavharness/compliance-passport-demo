# Compliance Passport

================================================================

**Status: BLOCKED - 3 VIOLATION(S)**

| Field        | Value                                      |
| ------------ | ------------------------------------------ |
| Passport ID  | passport-NTjONCtn-20260329                 |
| Generated    | 2026-03-29T15:00:00Z                       |
| Pipeline     | compliance_passport_ci (run #6)            |
| Execution    | NTjONCtnQ0mNfjDR-H4Fgg                    |
| Connector    | RaghavPrivateGithub (implicit clone)       |
| Frameworks   | SOC 2 Type II, SLSA Level 3, PCI DSS v4.0 |
| Health Score | 81 / 100 (13/16 checks passed)            |
| Service      | payment-service v2.1.0                     |

================================================================

## 1. Change Record

| Field          | Value                                                              |
| -------------- | ------------------------------------------------------------------ |
| Commit         | 0abb51dc6ecf50d77bae2fc5cb984b022ca84708                           |
| Author         | Raghav (via `<+codebase.gitUser>`)                                 |
| Message        | Add compliance passport agent and first real passport report       |
| Branch         | main (via `<+codebase.branch>`)                                    |
| Repo URL       | https://github.com/raghavharness/compliance-passport-demo          |
| Files Changed  | 3 files changed, 414 insertions(+)                                |
| Trigger        | MANUAL (via `<+pipeline.triggerType>`)                             |
| PR             | #2 - Add payment analytics endpoints                              |
| PR Author      | raghavharness                                                      |
| PR Branch      | feature/add-payment-analytics -> main                              |
| PR State       | OPEN                                                               |
| PR Diff        | +159 / -0 across 3 files                                          |

> Evidence: Harness MCP `execution_log` (build_info step, codebase variables) + GitHub MCP `pull_request_read`

## 2. Code Review Evidence

| Requirement                 | Status | Evidence                                      |
| --------------------------- | ------ | --------------------------------------------- |
| PR created (no direct push) | PASS   | PR #2 exists (feature/add-payment-analytics)  |
| Min 1 approved reviewer     | FAIL   | No approved reviews found on PR #2            |
| Reviewer != Author          | FAIL   | Cannot verify - no reviews submitted          |

> Evidence: GitHub MCP `pull_request_read` (method: get_reviews) - returned empty array

## 3. Test Attestation

| Requirement              | Status | Evidence                              |
| ------------------------ | ------ | ------------------------------------- |
| Unit tests passed        | PASS   | 36/36 passed, 0 failed (12 suites)   |
| Integration tests passed | PASS   | 9/9 passed, 0 failed (2 suites)      |
| All tests passed         | PASS   | 45/45 total, 0 failures              |
| Test coverage            | INFO   | Coverage measurement not configured   |

> Evidence: Harness MCP `execution_log` (unit_tests step: `UNIT_TEST_TOTAL=36, UNIT_TEST_PASSED=36, UNIT_TEST_FAILED=0` | integration_tests step: `INT_TEST_TOTAL=9, INT_TEST_PASSED=9, INT_TEST_FAILED=0`)

### Test Breakdown (parsed from TAP output in step logs)

**Unit Tests (36 tests, 12 suites):**
- Auth Middleware / authenticate: 5 tests (reject no header, invalid format, accept valid JWT, reject expired, reject wrong secret)
- Auth Middleware / authorize: 3 tests (correct role, insufficient role, no user)
- PaymentService / createPayment: 3 tests (success, exceed limit, idempotency)
- PaymentService / getPayment: 2 tests (found, not found)
- PaymentService / refundPayment: 4 tests (full refund, partial, exceeds amount, wrong status)
- PaymentService / listPayments: 2 tests (pagination, filter by status)
- Payment Validators / createPaymentSchema: 10 tests
- Payment Validators / refundPaymentSchema: 4 tests
- Payment Validators / listPaymentsSchema: 3 tests

**Integration Tests (9 tests, 2 suites):**
- Health Endpoints: 3 tests (healthy, readiness, 404)
- Payment API: 6 tests (auth rejection, create, validation, list, refund, RBAC)

## 4. Lint Attestation

| Requirement   | Status | Evidence                        |
| ------------- | ------ | ------------------------------- |
| ESLint passed | PASS   | 0 errors, 0 warnings           |

> Evidence: Harness MCP `execution_log` (run_lint step: `LINT_ERRORS=0, LINT_WARNINGS=0, LINT_STATUS=passed`)

## 5. Security Attestation

| Scan Type                  | Status | Findings                                     |
| -------------------------- | ------ | -------------------------------------------- |
| SAST - Secret Detection    | PASS   | 0 hardcoded secrets in source code           |
| SAST - Dangerous Functions | PASS   | 0 eval/Function/child_process usage          |
| SAST - .env.example Audit  | WARN   | Placeholder values match secret patterns     |
| SCA - Dependency Audit     | PASS   | 0 critical, 0 high, 0 moderate, 0 low vulns |
| SCA - Total Vulnerabilities| PASS   | 0 total vulnerabilities across 221 packages  |

> Evidence: Harness MCP `execution_log` (sast_scan: `SAST_SECRETS_FOUND=0, SAST_STATUS=passed` | sca_scan: `SCA_CRITICAL=0, SCA_HIGH=0, SCA_TOTAL=0, SCA_STATUS=passed`)

## 6. SBOM Summary

| Metric                         | Value                                        |
| ------------------------------ | -------------------------------------------- |
| Direct production dependencies | 8                                            |
| Dev dependencies               | 1 (eslint)                                   |
| Total components (transitive)  | 221                                          |
| SBOM Format                    | CycloneDX v1.5                               |
| Generator                      | Harness CI SBOM Generator v1.0.0             |

> Evidence: Harness MCP `execution_log` (generate_sbom step: `SBOM_COMPONENTS=221, SBOM_DIRECT_DEPS=8, SBOM_DEV_DEPS=1`)

## 7. Container Security

| Check                    | Status | Evidence                    |
| ------------------------ | ------ | --------------------------- |
| Non-root user            | PASS   | USER appuser configured     |
| Health check             | PASS   | HEALTHCHECK configured      |
| Multi-stage build        | PASS   | AS builder stage detected   |
| Dependency layer caching | PASS   | COPY package*.json present  |

> Evidence: Harness MCP `execution_log` (validate_dockerfile step: `DOCKERFILE_STATUS=passed, DOCKERFILE_ISSUES=0`)

## 8. Build Provenance (SLSA Level 3)

| Field             | Value                                                     |
| ----------------- | --------------------------------------------------------- |
| Builder           | Harness CI - Cloud runner (Linux/Amd64)                   |
| Builder Image     | node:20 (v20.20.2)                                       |
| Pipeline          | compliance_passport_ci                                    |
| Execution ID      | NTjONCtnQ0mNfjDR-H4Fgg                                   |
| Run Sequence      | #6                                                        |
| Codebase Connector| RaghavPrivateGithub (implicit clone)                      |
| Source repo       | https://github.com/raghavharness/compliance-passport-demo |
| Source commit     | 0abb51dc6ecf50d77bae2fc5cb984b022ca84708                  |
| Build trigger     | MANUAL (raghav.gupta@harness.io)                          |
| Build started     | 2026-03-29T14:58:04Z                                     |
| Build completed   | 2026-03-29T14:59:22Z                                     |
| Build duration    | 1m 17s                                                    |
| Infrastructure    | Harness Hosted (ephemeral VM, medium class)               |
| SBOM attached     | Yes (CycloneDX v1.5, 221 components)                     |

> Evidence: Harness MCP `harness_get` (execution) + `harness_diagnose` + `execution_log` (build_info + build_summary steps)

## 9. Compliance Framework Results

### SOC 2 Type II

| Control | Requirement                 | Status | Evidence                           |
| ------- | --------------------------- | ------ | ---------------------------------- |
| CC6.1   | Change via Pull Request     | PASS   | PR #2 exists                       |
| CC6.1   | Reviewer != Author          | FAIL   | No reviews on PR #2                |
| CC7.1   | All tests passed            | PASS   | 45/45 tests passed                 |
| CC7.2   | No critical/high vulns      | PASS   | 0 critical, 0 high (npm audit)     |
| CC7.2   | No hardcoded secrets        | PASS   | 0 secrets in source code           |
| CC8.1   | Code review approved        | FAIL   | No approved reviews on PR #2       |

**SOC 2 Result: FAIL** (2 violations)

### SLSA Level 3

| Control    | Requirement           | Status | Evidence                             |
| ---------- | --------------------- | ------ | ------------------------------------ |
| Source     | Version controlled     | PASS   | Git commit 0abb51d                   |
| Source     | Change reviewed        | WARN   | PR #2 exists but not reviewed        |
| Build      | Scripted build         | PASS   | Harness CI pipeline via connector    |
| Build      | Isolated environment   | PASS   | Harness Cloud ephemeral VM           |
| Provenance | Build provenance       | PASS   | Passport serves as provenance record |
| Provenance | SBOM generated         | PASS   | 221 components documented            |

**SLSA Level 3 Result: PASS** (with advisory warning)

### PCI DSS v4.0 (Payment Service)

| Req   | Description                    | Status | Evidence                      |
| ----- | ------------------------------ | ------ | ----------------------------- |
| 6.2.1 | Secure development practices   | PASS   | ESLint + SAST analysis passed |
| 6.2.3 | Code review before release     | FAIL   | No review approval on PR #2   |
| 6.3.1 | Vulnerability identification   | PASS   | SCA + SAST scans completed    |
| 6.3.2 | Custom application code review | PASS   | ESLint analysis: 0 errors     |

**PCI DSS v4.0 Result: FAIL** (1 violation)

## VIOLATIONS - ACTION REQUIRED

This build is **BLOCKED** due to 3 compliance violation(s):

| # | Framework | Control | Violation                     | Severity |
| - | --------- | ------- | ----------------------------- | -------- |
| 1 | SOC 2     | CC6.1   | No approved reviewer on PR #2 | Critical |
| 2 | SOC 2     | CC8.1   | Code review not approved      | Critical |
| 3 | PCI DSS   | 6.2.3   | No code review before release | Critical |

### Remediation Steps

1. Request code review from at least 1 team member (not the PR author `raghavharness`)
2. Get the PR **approved** before merging to main
3. Re-run the pipeline after the PR is approved
4. The Compliance Passport Agent will re-evaluate and update the status

---

## Evidence Collection Method

| Source            | Tool                                  | Data Collected                       |
| ----------------- | ------------------------------------- | ------------------------------------ |
| Execution         | Harness MCP `harness_get` (execution) | Status, timing, trigger, run #6      |
| Execution         | Harness MCP `harness_diagnose`        | Duration, stage results              |
| Build Info        | Harness MCP `execution_log`           | Codebase vars (commit, branch, repo) |
| Lint              | Harness MCP `execution_log`           | ESLint errors/warnings               |
| Unit Tests        | Harness MCP `execution_log`           | 36 test results (TAP output)         |
| Integration Tests | Harness MCP `execution_log`           | 9 test results (TAP output)          |
| SAST              | Harness MCP `execution_log`           | Secret detection, dangerous funcs    |
| SCA               | Harness MCP `execution_log`           | npm audit vulnerability counts       |
| SBOM              | Harness MCP `execution_log`           | Component count, format, deps        |
| Dockerfile        | Harness MCP `execution_log`           | Best practice validation             |
| Pull Request      | GitHub MCP `pull_request_read`        | PR #2 details, diff, state           |
| PR Reviews        | GitHub MCP `get_reviews`              | Review status (empty)                |

**Total MCP calls: 11** (9 Harness + 2 GitHub)

---

## Passport ID: passport-NTjONCtn-20260329
Generated: 2026-03-29T15:00:00Z
Pipeline: compliance_passport_ci | Execution: NTjONCtnQ0mNfjDR-H4Fgg
Connector: RaghavPrivateGithub | Branch: main
Integrity: 8745c57167551e012dc45280b0dd961f5d4337c0e7dcc87f20062f4d6b3e59de
