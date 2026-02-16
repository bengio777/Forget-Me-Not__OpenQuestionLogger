# Open Question Logging

**Status:** In Production
**Type:** Automated
**Business Process:** General Productivity
**Trigger:** User has a question to log
**Process Outcome:** Logged question with metadata in both Notion and Google Sheets

**Assets Used:**
- log-class-question (Claude Skill)
- question-logger-api (Google Apps Script Web App)

---

## Overview

Capture class questions the moment they occur — at your desk, on your phone, or on the go — and log them to both Notion and Google Sheets with class, priority, and source metadata for later follow-up during class time.

## Prerequisites

- [ ] Claude Code with `log-class-question` skill installed (desktop path)
- [ ] iOS Shortcut installed and linked via iCloud (mobile path)
- [ ] Access to "Class Questions Tracker" Notion database
- [ ] Access to "Class Questions Tracker" Google Sheet

## Trigger

**When:** A question occurs to you that you want to ask during class
**Frequency:** On-demand — runs whenever a question comes to mind

---

## Procedure

### Step 1: Initiate the workflow (Human)

Choose your entry path based on where you are:

- **At your desk (Claude Code):** Say "log a class question" or similar trigger phrase to invoke the `log-class-question` skill
- **On your phone or MacBook (iOS Shortcut):** Tap the "Log Class Question" shortcut
- **Direct entry:** Add a row directly to the Notion database or Google Sheet

> Tip: The iOS Shortcut was created as a workaround because Claude Code skills can't be invoked from the Claude mobile app. Tested on MacBook Pro first, then shared via iCloud link to iPhone.

### Step 2: Provide your question (Human)

State or type your question when prompted. Be specific enough that you'll understand it later when class time arrives.

### Step 3: Select metadata (Human)

Choose from the following fields when prompted:

| Field | Required | Options | Default |
|-------|----------|---------|--------|
| **Class** | Yes | Hands-on AI, Kite The Planet, Professional, Security+, Spanish, Other | — |
| **Priority** | No | High, Medium, Low | Medium |
| **Source** | No | Conversation, Homework / Project Work, Lecture, Reading, Practice Exam, Other | Conversation |

**Decision Point:** If the context makes the class obvious (e.g., you were just studying Security+), the Claude skill will suggest it for confirmation rather than asking you to pick from the full list.

### Step 4: System logs the question (Automation)

The system writes the question to both destinations concurrently:

1. **Notion** — Creates a page in the "Class Questions Tracker" database with all fields plus auto-filled Date Entered (today) and Status (Incomplete)
2. **Google Sheets** — Appends a row to the "Class Questions Tracker" spreadsheet with the same data

If either destination fails, the other is still sufficient.

### Step 5: Receive confirmation (Human)

- **iOS Shortcut path:** iOS notification confirming the log (on MacBook Pro or iPhone)
- **Claude skill path:** Claude confirms with a count summary (e.g., "Logged to both Notion and Google Sheets. You now have 12 total questions tracked, 8 incomplete.")

---

## Outputs

| Output | Destination | Format |
|--------|-------------|--------|
| Question entry with metadata | Notion — Class Questions Tracker database | Notion page with properties |
| Question entry with metadata | Google Sheets — Class Questions Tracker | Spreadsheet row |
| Confirmation notification | iOS notification or Claude response | Text |

## Quality Checks

- [ ] Question appears in both Notion and Google Sheets with matching data
- [ ] Google Sheet row color reflects status (Red = Incomplete)
- [ ] Class, Priority, Source, and Date Entered are all populated correctly
- [ ] Question text is specific enough to be actionable during class

## When Things Go Wrong

| Problem | Solution |
|---------|----------|
| iOS Shortcut fails to log | Check that the iCloud link is still active and the question-logger-api endpoint is responding. Fall back to Claude skill or direct entry. |
| Question appears in one destination but not the other | Log manually to the missing destination. One copy is sufficient — sync is a convenience, not a requirement. |
| Wrong class or priority selected | Edit the entry directly in Notion (Active view) or Google Sheets. |
| Claude skill doesn't trigger | Use trigger phrases: "log a class question", "save this question for class", "I have a question for my class" |

---

## Automation Notes

**Platform:** Claude Code (skill) + iOS Shortcuts (mobile) + Google Apps Script (API)

**Assets:**
1. `log-class-question` — Claude skill handling conversational intake and dual-write to Notion + Google Sheets
2. `question-logger-api` — Google Apps Script web app receiving POST requests from iOS Shortcut, writing to both Notion and Google Sheets

**GitHub Repository:** bengio777/Forget-Me-Not__OpenQuestionLogger

**Google Sheet Conditional Formatting:**
- Red rows = Incomplete
- Green rows = Answered
- Orange rows = Follow Up

**Notion Views:**
- **Active** view: Shows Incomplete and Follow Up questions (default)
- **Answered** view: Shows only Answered questions (auto-filtered by status)

**Human Checkpoints:** Steps 1, 2, 3, 5 (initiation, input, selection, confirmation)

**Additional Operations:**
- **Answer a question:** Say "answer a class question" — Claude reads the sheet, shows incomplete questions, lets you pick one, collects the answer, and updates both destinations. Answered questions move to the "Answered" sheet tab in Google Sheets.
- **Review questions:** Say "review my questions" — Claude shows a grouped-by-class summary with counts.
