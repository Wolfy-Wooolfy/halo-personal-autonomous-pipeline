# DECISION_GATE_CONTRACT_v1

Document ID: DOC-34  
Status: EXECUTION-BOUND  
Authority Level: HARD (Fail-Closed)  
Applies To: SELF_BUILDING_SYSTEM  
Governed By: MODULE_ORCHESTRATION_GOVERNANCE_v1  

---

# 1. Purpose

The Decision Gate Module is the authoritative human-escalation
control point inside SELF_BUILDING_SYSTEM.

Its purpose is to:

- Prevent autonomous assumption
- Handle multi-path corrective scenarios
- Handle architectural tradeoffs
- Handle governance ambiguity
- Enforce single-question escalation rule

Decision Gate does NOT analyze.
Decision Gate does NOT repair.
Decision Gate only formalizes decision selection.

---

# 2. Activation Conditions

Decision Gate MUST activate if:

- gap_actions.requires_decision == true
OR
- At least one gap.severity == CRITICAL
OR
- Governance conflict detected
OR
- Stage interaction ambiguity exists

If none of the above → Decision Gate auto-pass.

---

# 3. Single Question Law

Decision Gate MUST:

- Produce exactly ONE blocking question
- Present deterministic options
- Avoid narrative persuasion
- Avoid subjective language

The question must be:

- Binary or enumerated
- Actionable
- Directly tied to gap_id(s)

Multiple simultaneous questions are strictly forbidden.

---

# 4. Decision Packet Construction

Decision Gate MUST generate:

artifacts/decisions/decision_packet.md  
artifacts/decisions/decision_packet.json  

Decision Packet MUST include:

- execution_id
- triggering_gap_ids
- context_summary
- deterministic_options
- impact_matrix
- required_confirmation_format

---

# 5. decision_packet.json Schema

{
  "execution_id": "",
  "triggering_gaps": [],
  "question": "",
  "options": [
    {
      "option_id": "",
      "description": "",
      "impact_scope": "",
      "risk_level": "",
      "downstream_effects": []
    }
  ],
  "confirmation_required_format": ""
}

---

# 6. Blocking State Enforcement

Upon Decision Gate activation:

System MUST:

- Write BLOCKED state into progress/status.json
- Suspend execution
- Prevent Backfill
- Prevent Execute
- Prevent Closure

No module may proceed until decision recorded.

---

# 7. Decision Confirmation Rule

Confirmation MUST:

- Match exactly one option_id
- Be explicit
- Be immutable
- Be logged

Upon confirmation:

System MUST generate:

artifacts/decisions/DECISION-<incremental_id>.md

Decision file MUST include:

- selected_option_id
- timestamp
- execution_id
- decision_scope
- decision_hash (optional)

---

# 8. Decision Immutability Rule

Once recorded:

- Decision file MUST NOT be modified
- Reversal requires new execution cycle
- New decision must reference previous decision

Silent overwriting is forbidden.

---

# 9. Auto-Pass Rule

If:

- requires_decision == false
AND
- No CRITICAL gaps

Decision Gate MUST:

- Generate decision_auto_pass.md
- Log no-decision-required state
- Allow progression to Backfill

---

# 10. Fail-Closed Conditions

Decision Gate MUST halt if:

- gap_actions.json missing
- Multiple independent question groups detected
- Duplicate option_id detected
- Empty options array
- Confirmation format ambiguous

Upon halt:

- artifacts/decisions/decision_error.md MUST be generated
- System remains BLOCKED
- Exactly ONE clarification question produced

---

# 11. Downstream Invalidation Rule

If new decision recorded:

Invalidate:

- backfill/
- execute/
- closure/

Trace and Gap remain valid unless repository changes.

---

# 12. Emergency Escalation Clause

If CRITICAL gap affects governance integrity:

Decision Gate MUST:

- Force human intervention
- Prevent auto-pass
- Explicitly state governance risk

No automation allowed in governance-critical cases.

---

# 13. Completion Criteria

Decision Gate is COMPLETE only when:

- Decision recorded
OR
- Auto-pass recorded

AND

- BLOCKED state cleared
- Confirmation stored
- Downstream invalidation performed

Only then may Backfill begin.

---

# 14. Governance Integrity Statement

Decision Gate guarantees:

- No silent assumption
- No hidden architectural choice
- No implicit correction
- Explicit accountability

SELF_BUILDING_SYSTEM may be autonomous,
but never ungoverned.

---

END OF DOCUMENT