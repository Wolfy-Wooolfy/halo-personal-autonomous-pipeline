# Autonomy Policy & Human Interrupt Protocol (v1)

**Status:** DRAFT – GOVERNANCE CORE  
**Applies To:** All Autonomous Pipeline Stages  
**Owner:** Human Authority (Khaled)  
**Enforcement Level:** HARD (Fail-Closed)

---

## 1. Purpose

This document defines:
- The **rules of autonomous operation**
- The **maximum allowed independence** of the system
- The **mandatory human-interrupt conditions**
- The **exact format and behavior** when human input is required

The goal is to allow the pipeline to operate **for hours or days without interruption**,  
while guaranteeing **zero silent assumptions** and **no uncontrolled decisions**.

---

## 2. Core Autonomy Principle (Execution-Only)

Autonomy in this system means **execution independence ONLY**.

Autonomy grants the system the ability to:
- Execute already-approved steps
- Apply deterministic rules
- Produce artifacts
- Advance without permission when no ambiguity exists

Autonomy does NOT grant the system authority to:
- Interpret intent
- Resolve ambiguity implicitly
- Select between equally valid options
- Apply judgment, preference, or optimization
- Improve outcomes beyond explicit contract

Autonomous action is permitted ONLY when:
- A single deterministic rule applies
- No alternative valid paths exist
- The outcome is fully bounded by closed artifacts and written contracts

If execution cannot proceed without interpretation, selection, or assumption:
- Autonomy MUST immediately terminate
- Human Interrupt is MANDATORY
- Execution MUST transition deterministically to: BLOCKED
  as defined by the Progress Tracking & Status Report Contract (v1)
  by populating `blocking_questions`
- Any human-facing interrupt emission MUST follow Section 5 of this document

If execution cannot proceed due to deterministic impossibility
and no contract-compliant continuation path exists:
- Execution MUST transition to: ABORTED
  as defined by the Progress Tracking & Status Report Contract (v1)
- `blocking_questions` MUST be an empty array
- `next_step` MUST be an empty string
- No Human Interrupt MUST be triggered
- No options MUST be presented
- No questions MUST be asked

Human visibility after Execution Abort
MUST occur ONLY via `progress/status.json`
as governed by the Progress Tracking & Status Report Contract (v1).

No narrative notification,
message framing,
or explanatory text
is permitted.

---

### 2.0.1 Autonomy Scope Lock (Hard)

Autonomy applies ONLY to:
- Executing already-approved steps
- Applying deterministic rules
- Advancing when no ambiguity exists

Autonomy MUST NOT be extended to:
- Improve outcomes
- Refine quality
- Enhance structure
- Increase completeness
- Optimize behavior

Any action taken “to make things better”
without explicit contractual instruction
is a scope violation and MUST halt execution.

---

## 2.1 Autonomy Is Not Discretion (Hard Rule)

Autonomy grants the system freedom of execution,
not freedom of judgment.

The system MUST NOT:
- Invent intent
- Interpret preferences
- Choose based on perceived quality
- Optimize beyond explicit rules

Autonomous action is permitted ONLY when:
- A single deterministic rule applies
- No alternative valid paths exist
- The outcome is fully bounded by contract

If discretion is required → escalation is mandatory.

---

## 2.1.1 No Progressive Interpretation Rule (Hard)

The system MUST NOT expand understanding,
authority, or intent
through execution over time.

The system MUST NOT:
- “Understand better” by continuing execution
- Accumulate implicit context
- Adjust behavior based on perceived trajectory
- Refine interpretation through retries or progress

Each autonomous action MUST be justified
ONLY by:
- Already-closed artifacts
- Explicit written rules
- Deterministic contracts

Execution history
does NOT grant interpretive authority.

Any behavior that depends on
execution accumulation
rather than explicit contract
constitutes interpretation
and MUST trigger human interrupt.

---

### 2.1.2 No Execution-Based Authority Accumulation (Hard)

Repeated execution does NOT grant authority.

The system MUST NOT:
- Accumulate confidence through repetition
- Treat execution history as validation
- Infer correctness from persistence
- Claim safety based on continued operation

Execution count, duration, or stability
has ZERO impact on authority.

If execution correctness cannot be proven
by explicit contracts and verification,
then repetition MUST NOT be used
as justification for continuation.

Any attempt to derive authority
from execution persistence
constitutes an autonomy violation
and MUST halt execution.

---

## 3. Autonomy Levels

### 3.1 Level A — Full Autonomy (Default)

The system MAY:
- Write documents
- Generate specifications
- Produce code
- Run verification
- Retry failed steps (up to policy limits)
- Generate decision candidates ONLY (non-authoritative)

The system MUST NOT:
- Log decisions
- Assign Decision IDs
- Mark any choice as accepted or rejected
- Ask for confirmation
- Pause execution
- Escalate to human

Decision authority exists ONLY when:
- A valid execution fork exists, AND
- A Human Interrupt is triggered, AND
- A Decision artifact is logged by the orchestrator

---

### 3.2 Level B — Bounded Autonomy (Retry Zone)

When a step fails:
- The system is allowed **up to 3 retries**
- Each retry MUST use a **different corrective strategy**
- All retries MUST be logged

If all retries fail → escalation is mandatory.

#### Definition of a Valid Retry (Hard)

A retry is valid ONLY if ALL of the following are true:

- The failure cause is explicitly identified
- The corrective action removes the failure cause, not its symptom
- The execution path is structurally different
- At least one artifact lifecycle step changes
- The retry does NOT reinterpret scope, intent, or rules

Retries that differ only in:
- Wording
- Ordering
- Prompt phrasing
- Parameter tuning
- Superficial refactoring

are NOT retries.
They are repetitions and are strictly forbidden.

If a retry cannot be proven to be materially distinct:
- Retry MUST NOT occur
- Execution MUST halt
- Human escalation is REQUIRED

---

### 3.3 Level C — Human Interrupt (Mandatory Escalation)

The system MUST STOP and notify the human authority if ANY of the following occur:
- More than one correct implementation path exists
- Required external data is missing (API keys, credentials, secrets)
- Scope ambiguity is detected
- A rule or boundary conflict is detected
- Retried failures exceed allowed limits

---

### 3.4 Execution Abort (Non-Interrupt Termination)

Execution Abort is NOT a Human Interrupt.

Execution Abort occurs when:
- Execution cannot continue deterministically
- No valid options exist
- No decision can unblock execution

In an Execution Abort:

- The pipeline MUST halt immediately
- No options MUST be presented
- No questions MUST be asked
- No Decision MUST be logged

Human visibility MUST occur ONLY through
the authoritative execution state
in `progress/status.json`
as defined by the Progress Tracking & Status Report Contract (v1).

Execution Abort enforces boundaries.
It does not request guidance.
It does not pause for response.

Execution authority is permanently exhausted.

---

## 4. Retry Rules & Limits

A Retry is permitted ONLY when ALL of the following are true:
- The failure cause is explicitly identified
- The corrective action removes the root cause
- The retry path is materially distinct
- No ambiguity is introduced
- No boundary, policy, or authority risk exists

A Retry is strictly FORBIDDEN when:
- Required input, credential, or intent is missing
- More than one valid execution path exists
- The failure involves interpretation or judgment
- The failure indicates a scope, policy, or boundary risk

In forbidden cases:
- Retry MUST NOT occur
- Execution MUST halt immediately
- A Human Interrupt is REQUIRED

Retry eligibility is a deterministic check.
Retry is NOT a fallback for uncertainty,
ambiguity,
or incomplete authority.

---

### 5. Interrupt Message Contract (Sovereign Question Format)

When a Human Interrupt occurs, the system MUST:

1. Pause the pipeline deterministically
2. Preserve all authoritative state
3. Emit EXACTLY ONE interrupt message

The interrupt message MUST be a direct,
lossless rendering of `progress/status.json`
and MUST follow this structure EXACTLY:

INTERRUPT REQUIRED
<verbatim JSON content of progress/status.json>
Pipeline State: PAUSED (Fail-Safe)

Rules:
- No other text is permitted
- No summaries, explanations, or framing are allowed
- Selectable options MUST NOT be printed separately
- Options may exist ONLY inside `blocking_questions`
  as governed by the Progress Tracking & Status Report Contract (v1)

Recommended options,
preferred paths,
or guidance language
are strictly FORBIDDEN.

---

### 5.0 Selectable Options Definition (Hard)

A Selectable Option exists ONLY if ALL of the following are true:

- More than one execution path is contract-compliant
- Each path preserves frozen scope and authority
- The pipeline cannot proceed deterministically without selecting exactly one path
- Selection materially changes downstream execution behavior

If these conditions are not met:
- No options may be presented
- No Decision may be requested
- Execution MUST NOT pause for choice

If selectable options are present:
- They MUST be represented ONLY within `progress/status.json`
- They MUST NOT be printed, summarized, or re-described outside the status file

---

### 5.0.1 Interrupt Minimality Rule (Hard)

An interrupt message MUST contain
ONLY the information required
to unblock execution.

Interrupts MUST NOT:
- Explain background context
- Justify why options exist
- Argue for any option
- Include recommendations unless mandated by rule

Any interrupt that contains persuasive,
interpretive,
or explanatory content
is invalid and MUST be regenerated.

---

### 5.0.2 Interrupt Neutrality Rule (Hard)

Interrupt messages MUST be semantically neutral.

They MUST NOT:
- Imply urgency beyond factual blockage
- Frame one option as safer or riskier
- Suggest consequence severity
- Include emotional, persuasive, or cautionary language

Interrupts exist to unblock execution,
not to influence choice.

If neutrality cannot be guaranteed:
- The interrupt MUST be regenerated
- Execution MUST remain paused

Any interrupt that influences human judgment
violates authority separation
and MUST halt execution.

---

### 5.1 Interrupt-to-Decision Binding Rule (Hard)

Every Human Interrupt MUST result in EXACTLY ONE of:

- A logged Decision artifact (ONLY if a selectable execution fork exists)
- Mandatory external input provided (credentials, keys, secrets, or required non-derivable data) captured as an authoritative input artifact per repository standards
- An explicit rejection of all presented options (ONLY if options exist)
- A declared task termination

Execution MUST NOT resume
based on conversational input,
implicit agreement,
or unlogged clarification.

Human responses have ZERO execution authority
until captured as a formal artifact
under the governing contracts.

If an interrupt does not result
in one of the valid resolution forms:
- Execution MUST remain PAUSED
- No retry, rollback, or continuation is permitted

Resuming execution without the required artifact(s)
constitutes a critical authority violation
and MUST halt the pipeline.

---

## 6. Progress Reporting (On Demand)

At any time, the human authority may request status.

The system MUST respond with a status report
that is a direct, lossless rendering
of the current contents of:

`progress/status.json`

No alternate format, summary,
or derived representation is permitted.

This document does NOT define:
- Status fields
- Status structure
- Progress calculation
- Execution state derivation

All progress semantics, authority,
and status format rules
are governed EXCLUSIVELY by:

- Progress Tracking & Status Report Contract (v1)

Any status response that differs in ANY way
from `progress/status.json`
is INVALID and MUST be regenerated.

---

## 7. Silent Operation Rule

Silence is permitted ONLY while
deterministic execution is actively progressing.

Silence MUST NOT be used to:
- Mask uncertainty
- Delay escalation
- Accumulate ambiguity
- Avoid interrupt responsibility

If execution is stalled,
ambiguous,
or awaiting resolution:

- Silence is forbidden
- A status report or interrupt MUST be emitted

---

### 7.0.1 No Soft Escalation Rule (Hard)

The system MUST NOT escalate
unless execution is strictly blocked.

Questions framed as:
- “Just to confirm”
- “To be safe”
- “Before proceeding”
- “Recommended approach”

are strictly forbidden.

If execution can proceed deterministically,
the system MUST proceed in silence.

---

### 7.1 Maximum Silent Window (Hard Limit)

The system MUST enforce a maximum silent execution window.

If no artifact is produced AND no observable pipeline state change occurs
within a bounded execution window:

- Silence is no longer permitted
- A mandatory status report MUST be emitted automatically
- The status report MUST be a direct, lossless rendering of `progress/status.json`
  (no summaries, no added explanations, no extra text)

Any required explanation for stall or lack of artifact closure MUST exist ONLY as structured fields
inside `progress/status.json`, as defined by the Progress Tracking & Status Report Contract (v1).

The silent window duration:
- MUST be explicitly configured
- MUST be finite
- MUST NOT be unbounded or implicit

Silent execution beyond the configured window
without status emission
is a system fault.

---

## 7.2 Progress Stall Escalation Rule

If execution activity is ongoing
but progress percentage does not change
for a bounded window:

- The system MUST treat this as a stall
- A status report MUST be emitted
- The report MUST explain:
  - Why no artifact was closed
  - What is preventing progress advancement
  - Whether resolution is deterministic or blocking

Continuous activity without measurable progress
is considered a system fault.

---

## 7.3 Prohibition of Exploratory or Comfort Questions

The system MUST NOT:
- Ask exploratory questions
- Ask comfort or reassurance questions
- Ask questions “to be safe”
- Seek validation for correct execution

Questions are allowed ONLY when:
- Execution is blocked
- A decision fork exists
- Mandatory input is missing

Any question that does not unblock execution
is forbidden.

---

### 7.4 Silence Is an Execution State (Hard Rule)

Silence is not a communication preference.
Silence is an execution state.

Silence is permitted ONLY when:
- Execution is actively progressing
- Deterministic steps are ongoing
- The next artifact is pending closure

Silence MUST NOT be used to:
- Hide uncertainty
- Mask indecision
- Delay escalation
- Defer reporting

If silence is used outside its
permitted execution context,
the system is considered faulted.

---

## 8. Authority & Override (Hard-Bound)

The human authority has ABSOLUTE authority
over execution outcomes,
but that authority is exercised ONLY
through explicit, logged control paths.

The human authority MAY:

- Interrupt execution at any time
- Resolve a presented Human Interrupt
- Select between valid execution options
- Explicitly terminate a task

The human authority MUST NOT:

- Override execution silently
- Resume execution after Execution Abort
- Force continuation outside contract rules
- Modify scope, assumptions, or success criteria mid-execution
- Apply authority without a logged artifact

All human authority actions MUST be captured as one of:

- A Decision artifact (per Decision Logging Specification)
- An explicit task termination
- A formally submitted New Task

Overrides are NOT conversational.
Overrides are NOT implicit.
Overrides are NOT contextual.

Any attempt to exercise authority
without a corresponding artifact
constitutes an authority violation
and MUST halt the pipeline.

Execution Abort is terminal.
No override may revive an aborted execution path.

---

## 9. Fail-Closed Guarantee

If uncertainty exists and cannot be resolved autonomously:
- The system MUST stop
- The system MUST escalate
- The system MUST NOT guess

Fail-Closed is mandatory.

---

## 10. Definition of Compliance

This policy is considered correctly implemented if:
- The system runs end-to-end without unnecessary interruptions
- Escalation occurs only when strictly required
- No silent assumptions are made
- Human time is used **only for decisions that matter**

---

**End of Document**