# Lessons Learned

Hard-won debugging notes from building this workflow.

## Shortcuts: Choose from List > Choose from Menu

When using multiple selection menus in an iOS/Mac Shortcut, **Choose from List** is far more reliable than **Choose from Menu**.

Choose from Menu creates a "Menu Result" magic variable for each menu, but when you have multiple menus, the variable references become ambiguous — all variables can end up pointing to the wrong source, typically the first input (Ask for Input), causing the question text to leak into every field.

Choose from List outputs a "Chosen Item" variable that properly references its parent action.

**Pattern:** List → Choose from List → Set Variable

## Shortcuts: Form > JSON for Request Body

The Get Contents of URL action's built-in JSON body editor struggles with variables from multiple Choose from List actions. Variables may not appear in the Insert Variable picker, or they silently resolve to the wrong value.

Switching Request Body from **JSON** to **Form** fixes this entirely. The Apps Script receives form-encoded data via `e.parameter` instead of `JSON.parse(e.postData.contents)`.

## Apps Script: Redeployment Required

Editing code in the Apps Script editor does **not** update the live web app. You must:
1. Deploy → New deployment (not "Manage deployments")
2. Create a fresh Web app deployment
3. Copy the **new** URL into your Shortcut

The old URL continues serving the old code forever.

## Apps Script: e.parameter vs JSON.parse

- `JSON.parse(e.postData.contents)` — for JSON request bodies
- `e.parameter` — for form-encoded request bodies

When switching the Shortcut from JSON to Form body type, update this line in the script accordingly.

## Notion MCP Serialization Bug

As of February 2026, the Notion MCP connector has a bug where object parameters (`parent`, `data`, `new_parent`) are serialized as strings instead of objects, causing `-32602` errors on all database write operations.

GitHub issues: #82, #67, #153

**Workaround:** Try-then-fallback pattern. Attempt the Notion write, catch the error, fall back to Google Sheets. The skill auto-heals when the bug is fixed.

## Mac Shortcuts: No "Wand" Icon

On Mac, the magic variable picker (wand icon) that exists on iOS is not available. Instead, right-click in a value field and select **"Select Variable"** to insert a variable reference.

## Mac Shortcuts: List Action Limit (Resolved)

The List action on Mac Shortcuts was previously limited to **5 items** in the UI editor. This limitation has been resolved — Lists can now hold more than 5 items on Mac. If you encounter this in an older macOS version, build the Shortcut on iOS where the limit does not apply; it syncs back to Mac via iCloud.

## Google Sheets: appendRow and Empty Rows

`sheet.appendRow()` appends after the last row with any content — including rows with empty strings (`""`). If you "clear" rows by writing empty strings, `appendRow` will skip past them and write far below.

To truly remove rows, you must delete them (select rows → right-click → Delete rows in the Google Sheets UI).
