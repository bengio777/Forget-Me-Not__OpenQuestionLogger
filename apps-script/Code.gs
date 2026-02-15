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
