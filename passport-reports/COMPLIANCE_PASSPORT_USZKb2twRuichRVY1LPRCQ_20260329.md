# Compliance Passport
================================================================

**Status: BLOCKED - 1 VIOLATION(S)**

| Field | Value |
|-------|-------|
| Passport ID | passport-USZKb2tw-20260329 |
| Generated | 2026-03-29T10:42:10Z |
| Pipeline | compliance_passport_ci |
| Execution | USZKb2twRuichRVY1LPRCQ |
| Frameworks | soc2,slsa_l3 |
| Health Score | 83 / 100 (10/12 checks passed) |

================================================================

## 1. Change Record

| Field | Value |
|-------|-------|
| Commit | 082220c909be008abbee2b6f6e337aa76bf01c46 |
| Author | Raghav <raghav.gupta@harness.io> |
| Date | 2026-03-29T16:07:30+05:30 |
| Message | Initial commit: Calculator API with tests |
| Files Changed | unknown |
| PR | #1 - Add health endpoint documentation |
| PR Author | raghavharness |
| PR Branch | feature/add-health-endpoint |
| PR State | OPEN |
| PR Created | 2026-03-29T10:39:03Z |
| Diff | +1 / -0 across 1 files |


## 2. Code Review Evidence

| Requirement | Status | Evidence |
|-------------|--------|----------|
| PR created (no direct push) | PASS | PR #1 (review: ) |
| Min 1 approved reviewer | FAIL | No approved reviews found |
| Reviewer != Author | FAIL | Cannot verify - no reviews |

## 3. Test Attestation

| Requirement | Status | Evidence |
|-------------|--------|----------|
| All tests passed | PASS | 15/15 passed, 0 failed |
| Test coverage | INFO | Coverage measurement not configured |


## 4. Security Attestation

| Scan Type | Status | Findings |
|-----------|--------|----------|
| SAST (Static Analysis) | PASS | No issues found |
| SCA (Dependency Scan) | PASS | 0 critical, 0 high vulnerabilities |
| Secret Detection | PASS | No hardcoded secrets detected |


## 5. SBOM Summary

| Metric | Value |
|--------|-------|
| Direct dependencies | 1 |
| Total components (transitive) | 68 |
| SBOM Format | CycloneDX v1.5 |
| License compliance | All MIT/Apache-2.0 |


## 6. Build Provenance (SLSA Level 3)

| Field | Value |
|-------|-------|
| Builder | Harness CI - Cloud runner (Linux/Amd64) |
| Pipeline | compliance_passport_ci |
| Execution ID | USZKb2twRuichRVY1LPRCQ |
| Source repo | github.com/raghavharness/compliance-passport-demo |
| Source commit | 082220c909be008abbee2b6f6e337aa76bf01c46 |
| Build trigger | Manual |
| SBOM attached | Yes |


## 7. Compliance Framework Results

| Framework | Status | Checks Passed | Details |
|-----------|--------|---------------|---------|
| SOC 2 Type II | FAIL | See checks above | Change mgmt, access control, vulnerability mgmt |
| SLSA Level 3 | PASS | See checks above | Source, build, provenance verified |

## VIOLATIONS - ACTION REQUIRED

This build is **BLOCKED** due to 1 compliance violation(s).

### Remediation Steps:
1. Create a Pull Request for all code changes (do not push directly to main)
2. Request code review from at least 1 team member (not the author)
3. Get the PR approved before merging
4. Re-run the pipeline after addressing all violations

> The pipeline should FAIL when violations are detected, preventing non-compliant code from shipping.


----------------------------------------------------------------
Passport ID: passport-USZKb2tw-20260329
Generated: 2026-03-29T10:42:10Z
Integrity: bfffb34bdff0c5422205cbbcb818b34d8da7c0be4e3bfea6ceef3d3182012205
----------------------------------------------------------------
