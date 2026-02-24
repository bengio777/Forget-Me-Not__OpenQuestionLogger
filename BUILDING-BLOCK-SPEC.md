# AI Building Block Spec: Open Question Logging (Forget-Me-Not)

## Execution Pattern
**Recommended Pattern:** Skill-Powered Prompt (with parallel iOS Shortcut path)
**Reasoning:**
- The Claude Code path is a single skill handling conversational intake and dual-write — no orchestration layer needed
- The iOS Shortcut path bypasses Claude entirely via a Google Apps Script web app, providing a parallel non-AI entry point
- Both paths converge on the same two data stores (Notion + Google Sheets)
- The workflow is short (5 steps) and linear — a skill handles this cleanly without agent overhead
- Additional operations (answer, review) are modes within the same skill, not separate workflows

---

## Scenario Summary
| Field | Value |
|-------|-------|
| **Workflow Name** | Open Question Logging (Forget-Me-Not) |
| **Description** | Capture class questions from any device and log them to Notion and Google Sheets with class, priority, and source metadata for later follow-up. |
| **Process Outcome** | Logged question with metadata in both Notion and Google Sheets, tracked until answered. |
| **Trigger** | User has a question to log. |
| **Type** | Automated |
| **Business Process** | General Productivity |

---

## Step-by-Step Decomposition
| Step | Name | Autonomy Level | Building Block(s) | Tools / Connectors | Skill Candidate | HITL Gate |
|------|------|---------------|-------------------|-------------------|----------------|-----------|
| 1 | Initiate workflow | Human | Skill (Claude path) or iOS Shortcut (mobile path) | Claude Code CLI, iOS Shortcuts | `log-class-question` | User chooses entry path |
| 2 | Provide question | Human | — | — | — | User states question |
| 3 | Select metadata | Human | Skill (smart defaults) | — | `log-class-question` | User confirms class, priority, source |
| 4 | Log to Notion + Google Sheets | AI-Deterministic | Skill (Claude path), GAS Web App (iOS path) | Notion MCP, Google Sheets MCP, Google Apps Script | `log-class-question` | — |
| 5 | Receive confirmation | Notification | Skill (Claude path), iOS notification (mobile path) | — | `log-class-question` | — |

## Autonomy Spectrum Summary

```
|--Human-----------|--AI-Deterministic--|--AI-Semi-Autonomous--|--AI-Autonomous--|
    1, 2, 3               4
```

| Level | Steps | Count |
|-------|-------|-------|
| **Human** | Steps 1, 2, 3 | 3 |
| **AI-Deterministic** | Step 4 | 1 |
| **Notification** | Step 5 | 1 |
| **AI-Semi-Autonomous** | — | 0 |
| **AI-Autonomous** | — | 0 |

---

## Skill Candidates
### `log-class-question`
- **Purpose:** Conversational intake of questions with smart metadata defaults, dual-write to Notion and Google Sheets, plus answer/review operations.
- **Inputs:**

| Input | Source | Required |
|-------|--------|----------|
| Question text | User | Yes |
| Class | User (or inferred from context) | Yes |
| Priority | User (default: Medium) | No |
| Source | User (default: Conversation) | No |

- **Outputs:**

| Output | Destination | Format |
|--------|-------------|--------|
| Question entry | Notion — Class Questions Tracker | Page with properties |
| Question entry | Google Sheets — Class Questions Tracker | Spreadsheet row |
| Confirmation | Claude response or iOS notification | Text with count summary |

- **Decision Logic:**
  - If conversation context makes the class obvious, suggest it for confirmation rather than presenting the full list
  - Auto-fill Date Entered (today) and Status (Incomplete)
  - If one destination fails, proceed with the other — one copy is sufficient

- **Failure Modes:**

| Failure | Impact | Handling |
|---------|--------|----------|
| Notion MCP unavailable | 1 of 2 destinations skipped | Log to Google Sheets only; report skip |
| Google Sheets MCP unavailable | 1 of 2 destinations skipped | Log to Notion only; report skip |
| iOS Shortcut endpoint down | Mobile path blocked | Fall back to Claude skill or direct entry |
| GAS deployment stale | iOS path returns error | Redeploy Apps Script (new deployment required for code changes) |
| Wrong metadata selected | Incorrect class/priority logged | Edit directly in Notion or Google Sheets |

### `question-logger-api` (Non-AI Asset)
- **Purpose:** Google Apps Script web app that receives POST requests from iOS Shortcuts and writes to both Notion and Google Sheets.
- **Type:** Middleware — not an AI building block, but a critical path component for the mobile entry point.

---

## Step Sequence and Dependencies

```
             ┌── Claude Code Path ──┐     ┌── iOS Shortcut Path ──┐
             │                      │     │                        │
Step 1: Initiate [Human]            │     Step 1: Tap Shortcut [Human]
             │                      │     │
             ▼                      │     ▼
Step 2: Provide question [Human]    │     Step 2: Type question [Human]
             │                      │     │
             ▼                      │     ▼
Step 3: Select metadata [Human]     │     Step 3: Pick from lists [Human]
             │                      │     │
             ▼                      │     ▼
Step 4: Dual-write [AI/Automation]  │     Step 4: POST to GAS [Automation]
             │                      │     │
             ▼                      │     ▼
Step 5: Confirm [Claude response]   │     Step 5: Confirm [iOS notification]
             └──────────────────────┘     └────────────────────────┘
```

### Dependency Map

| Step | Depends On |
|------|-----------|
| Step 1 | Trigger (question occurs to user) |
| Step 2 | Step 1 (workflow initiated) |
| Step 3 | Step 2 (question provided) |
| Step 4 | Step 3 (metadata selected) |
| Step 5 | Step 4 (write attempted) |

### Parallel Opportunities
- Step 4: Notion and Google Sheets writes execute concurrently.
- The two execution paths (Claude Code vs. iOS Shortcut) are fully independent.

### Critical Path
Initiate (1) → Question (2) → Metadata (3) → Write (4) → Confirm (5)

---

## Prerequisites
- Claude Code with `log-class-question` skill installed (desktop path)
- iOS Shortcut installed and linked via iCloud (mobile path)
- Access to "Class Questions Tracker" Notion database
- Access to "Class Questions Tracker" Google Sheet
- Google Apps Script web app deployed (mobile path)

## Context Inventory

| Artifact | Type | Used By Steps | Status |
|----------|------|---------------|--------|
| SKILL.md (log-class-question) | Skill definition | 1-5 (Claude path) | Exists |
| Code.gs | Apps Script middleware | 4-5 (iOS path) | Exists |
| SHORTCUT_BUILD_GUIDE.md | Setup guide | 1 (iOS path) | Exists |

## Tools and Connectors

| Tool / Connector | Purpose | Used By Steps | Status |
|-----------------|---------|---------------|--------|
| Notion MCP | Create page in Class Questions Tracker | 4 | Available |
| Google Sheets MCP | Append row / read / update Class Questions Tracker | 4 | Available |
| Google Apps Script | Middleware for iOS Shortcut → Notion + Sheets | 4 (iOS path) | Deployed |
| iOS Shortcuts | Mobile entry point with Siri integration | 1 (mobile) | Deployed |

## Recommended Implementation Order
1. Google Sheet with column structure and conditional formatting
2. SKILL.md with logging, answering, and review operations
3. Notion database setup with Active/Answered views
4. Google Apps Script web app for iOS path
5. iOS Shortcut linked to GAS endpoint
6. iCloud sharing for cross-device access

## Where to Run
**Platform:** Claude Code (skill) + iOS Shortcuts (mobile) + Google Apps Script (API)
**GitHub:** bengio777/Forget-Me-Not__OpenQuestionLogger
**Entry points:** Claude skill trigger phrases, iOS Shortcut (Siri or tap), direct database/sheet entry
