import { google } from "googleapis";

// Google Cloud Service Account configuration
const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const privateKey = (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
const spreadsheetId = process.env.GOOGLE_SHEET_ID;

let sheetsClient: any = null;

export function getGoogleSheetsClient() {
  if (sheetsClient) return sheetsClient;

  if (!clientEmail || !privateKey) {
    return null;
  }

  try {
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive.file",
      ],
    });

    sheetsClient = google.sheets({ version: "v4", auth });
    return sheetsClient;
  } catch (error) {
    console.error("Failed to initialize Google Sheets Client:", error);
    return null;
  }
}

/**
 * Fetch all rows from a given sheet/tab
 */
export async function getSheetData(tabName: string): Promise<any[][] | null> {
  const sheets = getGoogleSheetsClient();
  if (!sheets || !spreadsheetId) return null;

  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${tabName}!A1:Z`,
    });
    return res.data.values || [];
  } catch (error) {
    console.error(`Error reading tab ${tabName}:`, error);
    return null;
  }
}

/**
 * Append row to a given sheet/tab
 */
export async function appendSheetRow(tabName: string, rowValues: any[]) {
  const sheets = getGoogleSheetsClient();
  if (!sheets || !spreadsheetId) return null;

  try {
    const res = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${tabName}!A:A`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [rowValues],
      },
    });
    return res.data;
  } catch (error) {
    console.error(`Error appending to tab ${tabName}:`, error);
    return null;
  }
}

/**
 * Update a specific cell range
 */
export async function updateSheetRange(range: string, values: any[][]) {
  const sheets = getGoogleSheetsClient();
  if (!sheets || !spreadsheetId) return null;

  try {
    const res = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values,
      },
    });
    return res.data;
  } catch (error) {
    console.error(`Error updating range ${range}:`, error);
    return null;
  }
}
