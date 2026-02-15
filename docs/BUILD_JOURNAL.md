# Forget-Me-Not: Open Question Logger
## Reusable Build Template & Project Retrospective

**Builder:** Ben (bengio777@gmail.com)
**Build Date:** February 2026
**Platform:** Claude Cowork (Desktop Agent)
**Status:** Fully functional, deployed, multi-device
**Repo:** Forget-Me-Not__OpenQuestionLogger

---

## 1. Problem Statement

When studying, reading, or going about daily life, questions come up that you want to ask in class later. Without a capture system, these questions are forgotten. This workflow captures them instantly from any device and tracks them through resolution.

## 2. Solution

A multi-platform question logging system with three entry points (desktop voice/text, iPhone Siri, direct Google Sheet access) that stores questions in Google Sheets with automatic status tracking, dropdown validation, and auto-archiving of answered questions.

---

## 3. Architecture

```
┌─────────────────┐     ┌──────────────────┐
│  Claude Cowork   │────▶│  Google Sheets    │
│  (Desktop Skill) │     │  (via Apps Script)│
│                  │     └──────────────────┘
│                  │
│                  │     ┌──────────────────┐
│                  │────▶│  Notion DB       │
│                  │     │  (via MCP)       │
└─────────────────┘     └──────────────────┘

┌─────────────────┐     ┌──────────────────┐     ┌──────────────┐
│  iOS Shortcut    │────▶│  Google Apps      │────▶│ Google Sheets│
│  + Siri          │     │  Script (API)     │     │              │
└─────────────────┘     └──────────────────┘     └──────────────┘
```

### Component Inventory

| Component | Technology | Role |
|-----------|-----------|------|
| Desktop Entry | Claude Cowork Skill | Voice/text question capture via SKILL.md |
| Mobile Entry | iOS Shortcut + Siri | "Hey Siri, Log Class Question" voice trigger |
| API Middleware | Google Apps Script | POST endpoint receiving form-encoded data |
| Primary Storage | Google Sheets | Dropdowns, conditional formatting, auto-archive |
| Secondary Storage | Notion Database | Concurrent dual-write via MCP |

---

## 4. Data Schema

All entry points write the same eight fields. The schema is identical across Google Sheets, Notion, and the iOS Shortcut form.

| Field | Type | Options | Notes |
|-------|------|---------|-------|
| Question | Text | Free text | Required. The question to ask in class. |
| Class | Select | Hands-on AI, Kite The Planet, Professional, Security+, Spanish, Other | Dropdown validated. Update in 3 places when changing. |
| Status | Select | Incomplete, Answered, Follow Up | Default: Incomplete. Drives conditional formatting and auto-archive. |
| Priority | Select | High, Medium, Low | Default: Medium. |
| Source | Select | Conversation, Homework / Project Work, Lecture, Reading, Practice Exam, Other | Default: Conversation. |
| Date Entered | Date | YYYY-MM-DD | Auto-filled on creation. |
| Date Answered | Date | YYYY-MM-DD | Filled when status changes to Answered. |
| Answer | Text | Free text | The answer text when resolved. |

---

## 5. Component Specifications

### 5.1 Google Apps Script (API Middleware)

The Apps Script acts as a web app endpoint that receives POST requests with form-encoded data and appends rows to Google Sheets.

#### Core Functions

| Function | Purpose |
|----------|---------|
| `doPost(e)` | Receives form-encoded POST data, appends row to Sheet1, returns status counts as JSON |
| `getStatusCounts(sheet)` | Counts total and incomplete questions for the confirmation message |
| `setupDataValidation()` | Adds dropdown validation to Status (col C) and Priority (col D) |
| `setupClassAndSourceValidation()` | Adds dropdown validation to Class (col B) and Source (col E) |
| `onEditMoveAnswered(e)` | Installable onEdit trigger: moves row to Answered sheet when Status = "Answered" |
| `setupTrigger()` | Creates the installable onEdit trigger. Run once. |

#### Full Code (Production)

```javascript
function doPost(e) {
  try {
    var data = e.parameter;
    var sheet = SpreadsheetApp.openById("YOUR_GOOGLE_SHEET_ID").getSheetByName("Sheet1");
    var question = data.question || "";
    var classname = data.classname || "Other";
    var priority = data.priority || "Medium";
    var source = data.source || "Conversation";
    var today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
    sheet.appendRow([question, classname, "Incomplete", priority, source, today, "", ""]);
    var statusCounts = getStatusCounts(sheet);
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Question logged. " + statusCounts.total + " total (" + statusCounts.incomplete + " incomplete)."
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getStatusCounts(sheet) {
  var data = sheet.getDataRange().getValues();
  var total = data.length - 1;
  var incomplete = 0;
  for (var i = 1; i < data.length; i++) {
    if (data[i][2] === "Incomplete") incomplete++;
  }
  return { total: total, incomplete: incomplete };
}

function setupDataValidation() {
  var sheet = SpreadsheetApp.openById("YOUR_GOOGLE_SHEET_ID").getSheetByName("Sheet1");
  var statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Incomplete", "Answered", "Follow Up"])
    .setAllowInvalid(false).build();
  sheet.getRange("C2:C500").setDataValidation(statusRule);
  var priorityRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["High", "Medium", "Low"])
    .setAllowInvalid(false).build();
  sheet.getRange("D2:D500").setDataValidation(priorityRule);
}

function setupClassAndSourceValidation() {
  var sheet = SpreadsheetApp.openById("YOUR_GOOGLE_SHEET_ID").getSheetByName("Sheet1");
  var classRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Hands-on AI", "Kite The Planet", "Professional", "Security+", "Spanish", "Other"])
    .setAllowInvalid(false).build();
  sheet.getRange("B2:B500").setDataValidation(classRule);
  var sourceRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Conversation", "Lecture", "Reading", "Practice Exam", "Other"])
    .setAllowInvalid(false).build();
  sheet.getRange("E2:E500").setDataValidation(sourceRule);
}

function onEditMoveAnswered(e) {
  var sheet = e.source.getActiveSheet();
  if (sheet.getName() !== "Sheet1") return;
  var range = e.range;
  var col = range.getColumn();
  var row = range.getRow();
  if (col !== 3 || row < 2) return;
  var newValue = range.getValue();
  if (newValue === "Answered") {
    var answeredSheet = e.source.getSheetByName("Answered");
    if (!answeredSheet) return;
    var rowData = sheet.getRange(row, 1, 1, 8).getValues();
    answeredSheet.appendRow(rowData[0]);
    sheet.deleteRow(row);
  }
}

function setupTrigger() {
  ScriptApp.newTrigger("onEditMoveAnswered")
    .forSpreadsheet("YOUR_GOOGLE_SHEET_ID")
    .onEdit()
    .create();
}
```

#### Critical Implementation Details

- Uses `e.parameter` (form-encoded) instead of `JSON.parse(e.postData.contents)` — iOS Shortcuts' JSON body editor has variable resolution bugs
- Passphrase authentication is optional and currently commented out in production
- **Code changes require a NEW deployment** (Deploy → New deployment). Editing code alone does not update the live web app.
- `appendRow()` appends after the last row with ANY content, including rows with empty strings

---

### 5.2 iOS Shortcut (14 Steps)

| # | Action Type | Configuration | Output |
|---|------------|---------------|--------|
| 1 | Ask for Input | "What question do you want to log?" | Provided Input |
| 2 | Set Variable | Variable: Question | Captures Provided Input |
| 3 | List | Hands-on AI, Kite The Planet, Professional, Security+, Spanish | Class options |
| 4 | Choose from List | Prompt: "Which class?" | Chosen Item |
| 5 | Set Variable | Variable: Class | Captures Chosen Item from step 4 |
| 6 | List | High, Medium, Low | Priority options |
| 7 | Choose from List | Prompt: "Priority?" | Chosen Item |
| 8 | Set Variable | Variable: Priority | Captures Chosen Item from step 7 |
| 9 | List | Conversation, Lecture, Reading, Practice Exam, Other | Source options |
| 10 | Choose from List | Prompt: "Source?" | Chosen Item |
| 11 | Set Variable | Variable: Source | Captures Chosen Item from step 10 |
| 12 | Get Contents of URL | POST, Form body, keys: question/classname/priority/source/secret | JSON response |
| 13 | Get Dictionary Value | Key: "message" | Confirmation text |
| 14 | Show Notification | Body: Dictionary Value | User sees confirmation |

---

### 5.3 Claude Cowork Skill (SKILL.md)

**Trigger Phrases:**
- "I have a question for my class" / "log this question" / "save this question for class"
- "answer a class question" / "update a class question"
- "review my questions" / "what questions do I have"

**Dual-Write Pattern:** The skill always attempts Notion first, then writes to Google Sheets. If Notion fails with a -32602 serialization error (known MCP bug), it gracefully falls back to Google Sheets only. When the bug is fixed, Notion writes activate automatically.

---

### 5.4 Google Sheets Configuration

- **Conditional formatting:** Red = Incomplete, Green = Answered, Orange = Follow Up
- **Dropdown data validation** on Class, Status, Priority, and Source columns (rows 2–500)
- **Two sheets:** Sheet1 (active questions) and Answered (auto-archived completed questions)
- **Installable onEdit trigger** watches Status column — changing to "Answered" auto-moves the row

---

## 6. Lessons Learned

### Choose from List > Choose from Menu (iOS Shortcuts)

Choose from Menu's "Menu Result" variable becomes ambiguous with multiple menus — all variables can end up pointing to the first Ask for Input. Choose from List outputs "Chosen Item" which properly references its parent. Always use: **List → Choose from List → Set Variable**.

### Form Encoding > JSON Body (iOS Shortcuts)

Get Contents of URL's JSON body editor struggles with variables from multiple Choose from List actions. Variables may not appear in the picker or silently resolve wrong. Switch Request Body to **Form** and use `e.parameter` in Apps Script instead of `JSON.parse(e.postData.contents)`.

### Apps Script Redeployment Required

Editing code does NOT update the live web app. You must create a **new deployment** each time (Deploy → New deployment → Web app). The old URL serves old code forever.

### Notion MCP Serialization Bug (Feb 2026 — Resolved)

Object parameters (parent, data, new_parent) were serialized as strings instead of objects, causing -32602 errors. Initial workaround: try-then-fallback pattern. **Resolved 2/15/2026** — the bug was silently fixed. Skill now writes to both Notion and Google Sheets concurrently.

### Google Sheets: Typed Columns Block Validation Changes

Google Sheets' newer "typed columns" (@ chip-style dropdown headers) cannot be modified through the Data Validation UI or the `setDataValidation()` / `clearDataValidations()` API. All attempts return: "This operation is not allowed on cells in typed columns." **Solution:** Delete the typed column with `deleteColumn()`, insert a fresh one with `insertColumnBefore()`, restore values, then apply standard `setDataValidation()`. See `setupValidation()` in Code.gs.

### Mac Shortcuts Quirks

- No "wand" icon for magic variables. Right-click in a value field → "Select Variable"
- List action was previously limited to 5 items on Mac — **resolved** in current macOS
- iCloud sync for Shortcuts can be unreliable. Manual sharing via iCloud Link or AirDrop is the fallback

### appendRow and Empty Rows

`sheet.appendRow()` appends after the last row with any content, including empty-string rows. To truly remove rows, delete them in the Sheets UI (select → right-click → Delete rows).

---

## 7. Build History

### Summary

Forget-Me-Not was built in two sessions across two days (Feb 14–15, 2026) using Claude Cowork as the primary development environment. Day 1 produced a fully working system — three entry points, Apps Script API, Google Sheets storage, and a Cowork skill — but hit two platform bugs that required creative workarounds: iOS Shortcuts' variable resolution failures (Choose from Menu and JSON body) and the Notion MCP serialization bug that blocked all database writes. Day 2 focused on refinement: aligning dropdown options across platforms, solving Google Sheets' "typed columns" API restriction, confirming the Notion MCP bug was fixed, syncing data between platforms, and registering the project in the Notion AI Operations Registry. The system is now fully operational with concurrent dual-write to both Google Sheets and Notion.

**Total build time:** ~5–6 hours across 2 sessions
**Challenges encountered:** 5 (all resolved)
**Commits:** 8 (initial + 7 incremental)

### Day 1: Initial Build (Feb 14, 2026)

**Core system build (~3 hours)** — Built the complete end-to-end system from scratch. Started with the Google Sheet schema and conditional formatting, deployed the Apps Script `doPost()` middleware, constructed the 14-step iOS Shortcut with Siri trigger, and wrote the Cowork SKILL.md. First successful test: iOS Shortcut → Apps Script → Google Sheet round-trip.

**Challenge: iOS Shortcuts variable resolution (~45 min)** — The first Shortcut build used Choose from Menu actions and a JSON request body. Both broke silently. Choose from Menu's "Menu Result" variables became ambiguous across multiple menus, all pointing to the first Ask for Input. The JSON body editor in Get Contents of URL dropped or misresolved variables from Choose from List actions. Rebuilt using the pattern `List → Choose from List → Set Variable` for each field, and switched from JSON to Form-encoded request body. This required changing the Apps Script from `JSON.parse(e.postData.contents)` to `e.parameter`.

**Challenge: Notion MCP serialization bug (~20 min)** — Attempted to set up dual-write to Notion. Every `notion-create-pages` call failed with `-32602: Expected object, received string`. Confirmed as a known bug (GitHub issues #82, #67, #153). Designed a try-then-fallback pattern in the skill: attempt Notion, fall back gracefully to Google Sheets only, auto-heal when fixed.

**End of Day 1:** Fully functional on all three entry points. Notion writes blocked but handled gracefully. Repo initialized and pushed as `8a66a28`.

### Day 2: Refinements & Integration (Feb 15, 2026)

**Dropdown alignment (~30 min)** — Discovered the Source field had only 4 options in the iOS Shortcut and Apps Script but 6 in the Google Sheet. Added "Homework / Project Work" and "Other" across all platforms: Shortcut List action, Apps Script defaults, SKILL.md, and Notion database properties.

**Challenge: Google Sheets typed columns (~1 hour)** — Attempted to update the Source dropdown validation via the API. Google's newer "typed columns" (@ chip-style headers) block all modification — `setDataValidation()`, `clearDataValidations()`, and even the UI editor all return "This operation is not allowed on cells in typed columns." Three failed approaches before finding the solution: delete the column entirely with `deleteColumn()`, insert a fresh standard column with `insertColumnBefore()`, restore values, then apply validation. Consolidated all four dropdown columns into a single `setupValidation()` function.

**Notion MCP bug confirmed fixed (~15 min)** — Tested a write to the Class Questions Tracker — it succeeded. The serialization bug had been silently fixed. Updated all documentation to reflect the change. Skill now writes to both destinations concurrently instead of using the fallback pattern.

**Notion Registry integration (~30 min)** — Registered the project across 5 AI Operations Registry databases: 3 Apps (Google Sheets, iOS Shortcuts, Google Apps Script), 2 Building Blocks (log-class-question skill, question-logger-api), and 1 Workflow (Open Question Logging, linked to General Productivity). All writes succeeded.

**Google Sheets → Notion data sync (~15 min)** — No Google Sheets MCP available, so exported both sheet tabs as CSV and imported all 14 questions (7 active, 7 answered) into the Notion database.

**Filtered views & architecture update (~15 min)** — Evaluated three approaches for separating answered questions in Notion (filtered views, two databases with page moves, relation-linked databases). Chose filtered views as the Notion-native pattern: Active view (Incomplete + Follow Up) and Answered view (Answered). Updated architecture diagram to show concurrent dual-write paths.

### Reference Data

#### Commit Log

| Hash | Date | Description |
|------|------|-------------|
| `8a66a28` | 2/14 | Initial commit: Forget-Me-Not Open Question Logger |
| `d75a01b` | 2/15 | Update Source options and align dropdown values across all platforms |
| `1a1c799` | 2/15 | Add Reading and Practice Exam back to Source options, update docs |
| `99e76fb` | 2/15 | Add setupValidation function and typed columns workaround |
| `6d9ad49` | 2/15 | Update docs to reflect Notion MCP write bug is resolved |
| `9624d9b` | 2/15 | Add filtered views documentation and answered question workflow |
| `0ecd550` | 2/15 | Update architecture diagram to show concurrent dual-write paths |

#### Notion Entries Created

| Database | Entry | Page ID |
|----------|-------|---------|
| Apps | Google Sheets | `308fb3a7-cad4-8131` |
| Apps | iOS Shortcuts | `308fb3a7-cad4-8159` |
| Apps | Google Apps Script | `308fb3a7-cad4-818c` |
| Building Blocks | log-class-question | `308fb3a7-cad4-81e4` |
| Building Blocks | question-logger-api | `308fb3a7-cad4-810c` |
| Workflows | Open Question Logging | `308fb3a7-cad4-8135` |

#### Time Estimates by Task

| Task | Estimated Time |
|------|---------------|
| Core system build (Day 1) | ~3 hours |
| iOS Shortcuts debugging | ~45 min |
| Notion MCP bug investigation + fallback | ~20 min |
| Dropdown alignment across platforms | ~30 min |
| Google Sheets typed columns debugging | ~1 hour |
| Notion MCP fix confirmation + doc updates | ~15 min |
| Notion Registry integration | ~30 min |
| Data sync + filtered views + architecture | ~30 min |

---

## 8. Repository File Manifest

| File Path | Description |
|-----------|-------------|
| `README.md` | Project overview, architecture, setup guide, customization |
| `apps-script/Code.gs` | Apps Script middleware (sanitized, placeholder IDs) |
| `cowork-skill/SKILL.md` | Claude Cowork skill definition (sanitized) |
| `ios-shortcut/SHORTCUT_BUILD_GUIDE.md` | Step-by-step iOS Shortcut construction guide |
| `docs/LESSONS_LEARNED.md` | Debugging notes and platform gotchas |

### Live Resource IDs (Not in Repo)

| Resource | ID |
|----------|-----|
| Google Sheet | `1yzTkjLx6SULuxAZAATsThdbKyM0fAzQ3_pwACNILqBM` |
| Notion Database | `de19e6ca0f464fa99492ea1ac60c31fd` |
| Notion Data Source | `9f733497-7965-414b-8731-6abe0c2fc1b4` |

---

## 9. Reusable Architecture Pattern

### Pattern: Multi-Platform Structured Logger

**When to Use:** You need to capture structured data quickly from mobile and desktop, items move through statuses, and you want Siri voice capture on iOS.

### Stack (All Free Tier)

| Layer | Technology | Swap Options |
|-------|-----------|--------------|
| Storage | Google Sheets | Airtable, Notion, Supabase |
| API Layer | Google Apps Script | Cloudflare Workers, Vercel Edge Functions |
| Mobile Entry | iOS Shortcuts + Siri | Android Tasker, custom PWA |
| Desktop Entry | Claude Cowork Skill | Alfred workflow, Raycast extension, CLI tool |
| Secondary Store | Notion (via MCP) | Any MCP-connected service |

### Clone Checklist

1. Define your data schema (fields, types, select options, defaults)
2. Create a Google Sheet with column headers matching your schema
3. Deploy an Apps Script with `doPost()` that maps form keys to sheet columns
4. Build an iOS Shortcut: Ask for Input → [List → Choose from List → Set Variable] per select field → POST as Form
5. Write a SKILL.md with trigger phrases, field definitions, and logging procedure
6. Add dropdown validation and conditional formatting to the sheet
7. Set up auto-archive trigger if items have a "completed" state
8. Test end-to-end from each entry point

### Clone Use Case Ideas

- **Reading log:** books/articles with status (To Read → Reading → Finished), rating, notes
- **Expense tracker:** amount, category, payment method, receipt status
- **Content ideas:** idea text, platform (YouTube / Blog / Social), status (Idea → Drafted → Published)
- **Habit tracker:** habit name, completion status, streak count, daily notes
- **Travel planner:** destination, dates, budget, booking status, notes
- **Client CRM:** contact name, company, last touch, follow-up status, notes

---

## 10. Next Steps

### Completed

- ~~Push GitHub repo~~ — Pushed to `Forget-Me-Not__OpenQuestionLogger` (`8a66a28`)
- ~~Update repo Code.gs with dropdown validation~~ — Consolidated into `setupValidation()` (`99e76fb`)
- ~~Monitor Notion MCP bug~~ — Confirmed fixed 2/15/2026, dual-write now active (`6d9ad49`)

### Remaining

- Build a "Project Retrospective" skill that auto-captures build metadata for any Cowork project
- Clone the logging pattern for a new use case (e.g., reading log, content ideas tracker)
- Re-enable passphrase authentication once the workflow is stable
- Add weekly digest: Apps Script scheduled trigger that emails a summary of incomplete questions
- Set up Notion filtered views (Active + Answered) — manual, Notion MCP can't create views
- Evaluate Google Sheets MCP for direct read/write access from the Cowork skill
