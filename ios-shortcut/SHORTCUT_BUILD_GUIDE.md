# iOS Shortcut Build Guide: "Log Class Question"

This guide walks you through building the iOS Shortcut that sends questions to Google Sheets via the Apps Script middleware.

## Prerequisites

- Google Apps Script deployed as a Web App (see `apps-script/Code.gs`)
- Your deployment URL copied and ready

## Shortcut Structure

Build these actions in order in the Shortcuts app (Mac or iOS):

### Action 1: Ask for Input
- **Type:** Ask for Text
- **Prompt:** `What question do you want to log for your class?`

### Action 2: Set Variable
- **Variable Name:** `Question`
- **Value:** Provided Input

### Action 3: List (Class options)
- **Items:**
  - Hands-on AI
  - Kite The Planet
  - Professional
  - Security+
  - Spanish

> Note: Mac Shortcuts limits List to 5 items. Add more on iOS if needed.

### Action 4: Choose from List
- **Prompt:** `Which class?`
- **Input:** Automatically uses the List above

### Action 5: Set Variable
- **Variable Name:** `Class`
- **Value:** Chosen Item (from Choose from List above)

### Action 6: List (Priority options)
- **Items:**
  - High
  - Medium
  - Low

### Action 7: Choose from List
- **Prompt:** `Priority?`

### Action 8: Set Variable
- **Variable Name:** `Priority`
- **Value:** Chosen Item (from Priority Choose from List)

### Action 9: List (Source options)
- **Items:**
  - Conversation
  - Homework / Project Work
  - Lecture
  - Reading
  - Practice Exam
  - Other

### Action 10: Choose from List
- **Prompt:** `Source?`

### Action 11: Set Variable
- **Variable Name:** `Source`
- **Value:** Chosen Item (from Source Choose from List)

### Action 12: Get Contents of URL
- **URL:** Your Apps Script deployment URL
- **Method:** POST
- **Request Body:** Form
- **Form fields:**

| Key | Value |
|-----|-------|
| `question` | Question variable |
| `classname` | Class variable |
| `priority` | Priority variable |
| `source` | Source variable |

### Action 13: Get Dictionary Value
- **Key:** `message`
- **Dictionary:** Contents of URL

### Action 14: Show Notification
- **Body:** Dictionary Value

## Important Notes

### Use "Form" not "JSON" for Request Body
The JSON body editor in Shortcuts has issues with multiple variables from Choose from List actions. Using **Form** encoding resolves this.

### Use "Choose from List" not "Choose from Menu"
Choose from Menu's "Menu Result" variable is unreliable when you have multiple menus. Choose from List with "Chosen Item" works correctly.

### Use "Select Variable" (right-click) to insert variables
When setting variable values in Shortcuts on Mac, right-click in the value field and choose "Select Variable" to pick the correct variable reference.

### Siri Integration
Name the shortcut "Log Class Question" and you can trigger it by saying:
> "Hey Siri, Log Class Question"

### iCloud Sync
Shortcuts built on Mac sync to iPhone via iCloud automatically. Build once, use everywhere.

## Redeployment

If you edit the Apps Script code, you **must** create a new deployment:
1. Deploy → New deployment
2. Gear icon → Web app
3. Execute as: Me
4. Who has access: Anyone
5. Deploy
6. Copy the NEW URL into your Shortcut

Editing code without redeploying means the old version keeps running.
