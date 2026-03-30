/**
 * Decryptica Email Subscriber Google Apps Script
 * 
 * SETUP:
 * 1. Go to script.google.com
 * 2. Create new project
 * 3. Paste this code
 * 4. Deploy > New deployment > Web app
 * 5. Set "Who has access" to "Anyone"
 * 6. Copy the Web App URL
 * 7. Add it to Vercel env var GOOGLE_SCRIPT_URL
 */

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Subscribers');
  
  if (!sheet) {
    // Create sheet if it doesn't exist
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const newSheet = ss.insertSheet('Subscribers');
    newSheet.appendRow(['Email', 'Timestamp']);
  }
  
  try {
    const data = JSON.parse(e.postData.contents);
    const email = data.email;
    
    if (!email || !email.includes('@')) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Invalid email' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Check for duplicates
    const emails = sheet.getRange('A:A').getValues().flat();
    if (emails.includes(email)) {
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, message: 'Already subscribed' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Add new subscriber
    sheet.appendRow([email.toLowerCase(), new Date()]);
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'Subscribed!' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Allow GET for testing
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Use POST to subscribe' }))
    .setMimeType(ContentService.MimeType.JSON);
}