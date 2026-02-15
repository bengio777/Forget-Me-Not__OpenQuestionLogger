# Forget-Me-Not: Open Question Logger

A multi-platform workflow for capturing questions as they pop into your head — so you never forget to ask them in class.

## What It Does

When you're studying, reading, or just going about your day, questions come up that you want to ask in class later. This system captures them instantly from any device and tracks them until they're answered.

**Log questions from:**
- Desktop via Claude Cowork (voice or text)
- iPhone/iPad via Siri ("Hey Siri, Log Class Question")
- Any device via the Google Sheet directly

**Track with:**
- Google Sheets (primary, always reliable)
- Notion database (secondary, auto-heals when MCP bug is fixed)

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────┐
│  Claude Cowork   │────▶│  Google Sheets    │◀────│  Notion DB   │
│  (Desktop Skill) │     │  (Primary Store)  │     │  (Secondary) │
└─────────────────┘     └──────────────────┘     └──────────────┘
                              ▲
┌─────────────────┐     ┌──────────────────┐
│  iOS Shortcut    │────▶│  Google Apps      │
│  + Siri          │     │  Script (API)     │
└─────────────────┘     └──────────────────┘
```

## Fields Tracked

| Field | Description |
|-------|-------------|
| **Question** | The question you want to ask |
| **Class** | Which class it's for (customizable) |
| **Status** | Incomplete → Answered / Follow Up |
| **Priority** | High, Medium, Low |
| **Source** | Where the question came from (Conversation, Homework / Project Work, Lecture, Reading, Practice Exam, Other) |
| **Date Entered** | Auto-filled when logged |
| **Date Answered** | Filled when you mark it answered |
| **Answer** | The answer text when resolved |

## Setup

### 1. Google Sheet
Create a Google Sheet with these column headers in row 1:
```
Question | Class | Status | Priority | Source | Date Entered | Date Answered | Answer
```

Optional: Add conditional formatting on the Status column:
- Red background → "Incomplete"
- Green background → "Answered"
- Orange background → "Follow Up"

### 2. Google Apps Script
1. Go to [script.google.com](https://script.google.com)
2. Create a new project
3. Paste the code from `apps-script/Code.gs`
4. Replace `YOUR_GOOGLE_SHEET_ID` with your actual Sheet ID
5. Deploy → New deployment → Web app
6. Execute as: Me | Access: Anyone
7. Copy the deployment URL

### 3. iOS Shortcut
Follow the step-by-step guide in `ios-shortcut/SHORTCUT_BUILD_GUIDE.md`

### 4. Claude Cowork Skill (Optional)
Copy `cowork-skill/SKILL.md` to your Claude skills directory:
```
~/.claude/skills/log-class-question/SKILL.md
```
Update the placeholder IDs with your actual Notion and Google Sheet IDs.

## Customization

### Adding/Changing Classes
Update class options in three places:
1. The List action in your iOS Shortcut
2. The `SKILL.md` file (Class field options)
3. The Notion database (if using Notion)

### Adding Security (Optional)
To add passphrase protection to the Apps Script, add this after `var data = e.parameter;`:
```javascript
var SECRET = "your_passphrase_here";
if (data.secret !== SECRET) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "error",
    message: "Unauthorized."
  })).setMimeType(ContentService.MimeType.JSON);
}
```
Then add a `secret` field to your iOS Shortcut's form data.

## Known Issues

- **Notion MCP Write Bug**: The Notion MCP connector (as of Feb 2026) has a serialization bug preventing database writes. The Cowork skill handles this gracefully with a try-then-fallback pattern.
- **Mac Shortcuts List Limit**: List actions on Mac are limited to 5 items. iOS may support more.
- **Apps Script Redeployment**: Code changes require creating a new deployment — editing alone won't update the live version.

## Project Structure

```
├── README.md
├── apps-script/
│   └── Code.gs                    # Google Apps Script middleware
├── cowork-skill/
│   └── SKILL.md                   # Claude Cowork skill definition
├── ios-shortcut/
│   └── SHORTCUT_BUILD_GUIDE.md    # Step-by-step Shortcut build guide
└── docs/
    └── LESSONS_LEARNED.md         # Debugging notes and gotchas
```

## License

MIT
