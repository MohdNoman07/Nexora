# Week 3 — P3: Attack-Chain Pattern Matching

## Objective

Extend and validate the correlation engine's attack-chain pattern matching using the event graph and canonical event schema established during the previous weeks.

## Work Completed

- Extended the attack-chain template definitions for the selected attack scenarios.
- Tested the correlation engine against multiple mock attack-event sequences.
- Verified that events are grouped using shared entities such as user, IP, and session.
- Added and tested temporal constraints between consecutive attack steps.
- Tested minimum event-count requirements for burst-based attack patterns.
- Verified that matched events are reconstructed into a single incident.
- Tested negative scenarios where the required attack pattern is incomplete or occurs outside the allowed time window.
- Continued using the canonical event schema to keep the correlation module compatible with the rest of the system.

## Attack-Chain Scenarios Tested

### 1. Credential Compromise

Failed-login burst → successful login → suspicious resource access → data transfer

### 2. Network / Port Scan

Multiple connection attempts from the same source IP within a short time window.

### 3. Data Exfiltration

Suspicious login/activity → database access → large file download.

### 4. API Request Burst

A large number of API requests from the same user/source within a short time window.

## Testing

The matcher was tested using both valid and invalid event sequences.

### Valid cases
- Complete attack-chain sequence.
- Correct entity shared across events.
- Events occurring within the configured time window.

### Invalid cases
- Insufficient number of events.
- Events belonging to different entities.
- Events occurring outside the allowed time window.
- Incomplete attack-chain sequences.

## Key Concepts Learned

- Sequential attack-pattern matching.
- Temporal constraints in event correlation.
- Entity-based grouping of security events.
- Difference between individual alerts and reconstructed incidents.
- Importance of negative test cases when validating correlation rules.

## Current Limitations

- The matcher currently uses predefined attack-chain templates rather than learned patterns.
- Testing is still primarily based on controlled/mock event sequences.
- Complex overlapping attack chains and noisy event sequences require further testing.
- Severity scoring and complete incident prioritization will be refined in later stages.

## Next Steps

- Test the matcher against more varied and noisy event sequences.
- Refine attack-chain templates based on observed false positives and false negatives.
- Improve handling of overlapping or closely related incidents.
- Continue development of severity/risk scoring.
- Prepare the correlation engine for further integration with the backend and detection pipeline.