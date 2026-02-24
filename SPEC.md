# Open Question Logging (Forget-Me-Not) — Project Spec

**Project:** Forget-Me-Not: Open Question Logger

---

## Capabilities Demonstrated

### 1. Multi-platform question capture (Claude Code + iOS Shortcuts)
**Met.** Two fully independent entry paths converge on the same data stores. The Claude Code skill handles desktop intake conversationally. The iOS Shortcut + Google Apps Script path handles mobile intake with Siri integration. Both write to Notion and Google Sheets concurrently.
**Evidence:** `cowork-skill/SKILL.md`, `apps-script/Code.gs`, `ios-shortcut/SHORTCUT_BUILD_GUIDE.md`

### 2. Dual-write to Notion and Google Sheets
**Met.** Every question is written to both destinations concurrently. If one fails, the other still succeeds. The Claude skill path uses Notion MCP and Google Sheets MCP directly. The iOS Shortcut path uses Google Apps Script as middleware to write to both.
**Evidence:** `cowork-skill/SKILL.md` (Logging Procedure section), `apps-script/Code.gs`

### 3. Smart metadata defaults with conversational UX
**Met.** The Claude skill infers class from conversation context and suggests it for confirmation rather than asking the user to pick from the full list. Priority defaults to Medium, Source defaults to Conversation. This minimizes friction during study sessions.
**Evidence:** `cowork-skill/SKILL.md` (Fields to Collect table, "If context makes it obvious" logic)

### 4. Three operations in a single skill (log, answer, review)
**Met.** The skill handles three distinct operations: logging new questions, answering/updating existing questions (with status change and row movement), and reviewing the backlog with grouped-by-class summaries.
**Evidence:** `cowork-skill/SKILL.md` (Logging, Answering/Updating, Reviewing sections)

### 5. Google Apps Script middleware for non-Claude entry points
**Met.** The GAS web app receives POST requests from iOS Shortcuts and writes to both Notion and Google Sheets, enabling mobile capture without Claude Code access. Deployed as a web app with "Execute as: Me / Access: Anyone" permissions.
**Evidence:** `apps-script/Code.gs`

### 6. Visual status tracking with conditional formatting
**Met.** Google Sheets uses conditional formatting to color-code rows by status: Red (Incomplete), Green (Answered), Orange (Follow Up). Notion uses filtered views: Active (Incomplete + Follow Up) and Answered.
**Evidence:** `WORKFLOW-DEFINITION.md` (Automation Notes section), `cowork-skill/SKILL.md` (conditional formatting note)

---

## Deliverables

| # | Deliverable | File | Status |
|---|-------------|------|--------|
| 1 | Claude skill definition | `cowork-skill/SKILL.md` | Complete |
| 2 | Google Apps Script middleware | `apps-script/Code.gs` | Complete |
| 3 | iOS Shortcut build guide | `ios-shortcut/SHORTCUT_BUILD_GUIDE.md` | Complete |
| 4 | Workflow definition (SOP) | `WORKFLOW-DEFINITION.md` | Complete |
| 5 | Building block spec | `BUILDING-BLOCK-SPEC.md` | Complete |
| 6 | Project spec | `SPEC.md` | Complete |
| 7 | README | `README.md` | Complete |
| 8 | Lessons learned | `docs/LESSONS_LEARNED.md` | Complete |
| 9 | Build journal | `docs/BUILD_JOURNAL.md` | Complete |

---

## Review Criteria

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Questions log to both Notion and Google Sheets | Pass | Dual-write in `SKILL.md` and `Code.gs` |
| iOS Shortcut path works independently of Claude | Pass | GAS web app receives POST and writes to both destinations |
| Smart defaults reduce metadata friction | Pass | Class inference, Priority default Medium, Source default Conversation |
| Answer operation moves rows to Answered tab | Pass | `SKILL.md` Answering section: status change + row move |
| Review operation shows grouped-by-class summary | Pass | `SKILL.md` Reviewing section |
| Conditional formatting reflects status visually | Pass | Red/Green/Orange formatting documented in `WORKFLOW-DEFINITION.md` |
| SOP follows standard template | Pass | `WORKFLOW-DEFINITION.md` has all required sections |
| Both paths handle single-destination failure gracefully | Pass | "If either destination fails, the other is still sufficient" in both `SKILL.md` and `Code.gs` |

---

## File Inventory

| File | Location | Purpose |
|------|----------|---------|
| `SKILL.md` | `cowork-skill/SKILL.md` | Claude skill — logging, answering, reviewing questions |
| `Code.gs` | `apps-script/Code.gs` | Google Apps Script — iOS Shortcut middleware |
| `SHORTCUT_BUILD_GUIDE.md` | `ios-shortcut/SHORTCUT_BUILD_GUIDE.md` | Step-by-step iOS Shortcut build instructions |
| `WORKFLOW-DEFINITION.md` | `WORKFLOW-DEFINITION.md` | Standard operating procedure |
| `BUILDING-BLOCK-SPEC.md` | `BUILDING-BLOCK-SPEC.md` | AI building block specification |
| `SPEC.md` | `SPEC.md` | Project spec (this file) |
| `README.md` | `README.md` | Project overview, architecture, setup guide |
| `LESSONS_LEARNED.md` | `docs/LESSONS_LEARNED.md` | Debugging notes and gotchas from development |
| `BUILD_JOURNAL.md` | `docs/BUILD_JOURNAL.md` | Build retrospective for the project |
