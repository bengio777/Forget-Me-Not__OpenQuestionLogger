/**
 * Forget-Me-Not: Open Question Logger
 * Google Apps Script — Middleware for iOS Shortcut → Google Sheets
 *
 * Receives POST requests with form-encoded data from an iOS Shortcut
 * and appends the question to a Google Sheet for tracking.
 *
 * SETUP:
 * 1. Replace YOUR_GOOGLE_SHEET_ID with your actual Google Sheet ID
 * 2. Deploy as Web App (Execute as: Me, Access: Anyone)
 * 3. Copy the deployment URL into your iOS Shortcut
 */

function doPost(e) {
  try {
    // Parse form-encoded data from iOS Shortcut
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

/**
 * Run this function once from the Apps Script editor to set up
 * data validation dropdowns on Sheet1. This bypasses the
 * "typed columns" UI restriction in Google Sheets.
 *
 * To run: Open Apps Script editor → select setupValidation → click Run
 */
function setupValidation() {
  var ss = SpreadsheetApp.openById("YOUR_GOOGLE_SHEET_ID");
  var sheet = ss.getSheetByName("Sheet1");
  var lastRow = Math.max(sheet.getLastRow(), 100);

  // Define columns and their dropdown options
  var columns = [
    { col: 2, options: ["Hands-on AI", "Kite The Planet", "Professional", "Security+", "Spanish", "Other"] },       // B: Class
    { col: 3, options: ["Incomplete", "Answered", "Follow Up"] },                                                     // C: Status
    { col: 4, options: ["High", "Medium", "Low"] },                                                                   // D: Priority
    { col: 5, options: ["Conversation", "Homework / Project Work", "Lecture", "Reading", "Practice Exam", "Other"] }  // E: Source
  ];

  columns.forEach(function(c) {
    // Save existing values
    var values = sheet.getRange(1, c.col, lastRow, 1).getValues();

    // Delete the typed column and insert a fresh one
    sheet.deleteColumn(c.col);
    sheet.insertColumnBefore(c.col);

    // Restore values
    sheet.getRange(1, c.col, lastRow, 1).setValues(values);

    // Apply standard dropdown validation (skip header row)
    sheet.getRange(2, c.col, lastRow - 1, 1).setDataValidation(
      SpreadsheetApp.newDataValidation()
        .requireValueInList(c.options)
        .setAllowInvalid(false)
        .build());
  });

  Logger.log("Validation rules applied to columns B, C, D, E (rows 2–" + lastRow + ").");
}

/**
 * Counts total questions and incomplete questions in the sheet.
 */
function getStatusCounts(sheet) {
  var data = sheet.getDataRange().getValues();
  var total = data.length - 1; // Exclude header row
  var incomplete = 0;
  for (var i = 1; i < data.length; i++) {
    if (data[i][2] === "Incomplete") incomplete++;
  }
  return { total: total, incomplete: incomplete };
}
