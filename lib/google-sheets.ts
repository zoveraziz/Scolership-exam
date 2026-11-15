import { google } from "googleapis";

// Google Cloud Service Account configuration (Strictly loaded from Environment Variables)
const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "";
const privateKey = (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
const spreadsheetId = process.env.GOOGLE_SHEET_ID || "";

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
 * Resolves exact tab title, handling variations like 'controlers' vs 'Controllers', 'Messages' vs 'বাণী'
 */
export async function getExactTabName(preferredName: string): Promise<string> {
  const sheets = getGoogleSheetsClient();
  if (!sheets || !spreadsheetId) return preferredName;

  try {
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const titles: string[] = meta.data.sheets?.map((s: any) => s.properties?.title) || [];

    // 1. Direct match (case-insensitive)
    const exact = titles.find((t) => t.toLowerCase() === preferredName.toLowerCase());
    if (exact) return exact;

    // 2. Fuzzy matches
    const lower = preferredName.toLowerCase();
    if (lower.includes("control")) {
      const found = titles.find((t) => t.toLowerCase().includes("control"));
      if (found) return found;
    }
    if (lower.includes("message") || preferredName.includes("বাণী")) {
      const found = titles.find((t) => t.toLowerCase().includes("message") || t.includes("বাণী"));
      if (found) return found;
    }
    if (lower.includes("committe") || preferredName.includes("পরিচালনা")) {
      const found = titles.find((t) => t.toLowerCase().includes("committe") || t.includes("পরিচালনা"));
      if (found) return found;
    }

    return preferredName;
  } catch (error) {
    return preferredName;
  }
}

/**
 * Fetch all rows from a given sheet/tab
 */
export async function getSheetData(tabName: string): Promise<any[][] | null> {
  const sheets = getGoogleSheetsClient();
  if (!sheets || !spreadsheetId) return null;

  try {
    const actualTab = await getExactTabName(tabName);
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${actualTab}!A1:Z`,
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
    const actualTab = await getExactTabName(tabName);
    const res = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${actualTab}!A:A`,
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

/**
 * Bulk update Settings in the 'Settings' tab
 */
export async function bulkUpdateSettings(newSettings: Record<string, string>) {
  const sheets = getGoogleSheetsClient();
  if (!sheets || !spreadsheetId) return { success: false, message: "Sheets client not initialized" };

  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Settings!A1:B100",
    });

    const rows: string[][] = res.data.values || [];
    const keyToRowIndex: Record<string, number> = {};

    rows.forEach((row, idx) => {
      if (row && row[0]) {
        keyToRowIndex[row[0].trim()] = idx + 1; // 1-based index for Google Sheets
      }
    });

    const updates: { range: string; values: string[][] }[] = [];
    const appends: string[][] = [];

    for (const [key, val] of Object.entries(newSettings)) {
      if (keyToRowIndex[key]) {
        const rowNum = keyToRowIndex[key];
        updates.push({
          range: `Settings!B${rowNum}`,
          values: [[val]],
        });
      } else {
        appends.push([key, val]);
      }
    }

    if (updates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
          valueInputOption: "USER_ENTERED",
          data: updates,
        },
      });
    }

    if (appends.length > 0) {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "Settings!A:A",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: appends,
        },
      });
    }

    return { success: true };
  } catch (err: any) {
    console.error("Error updating settings:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Get Sheet ID (tab GID) by Tab Name
 */
export async function getTabGid(tabName: string): Promise<number | null> {
  const sheets = getGoogleSheetsClient();
  if (!sheets || !spreadsheetId) return null;

  try {
    const actualTab = await getExactTabName(tabName);
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const sheet = meta.data.sheets?.find(
      (s: any) => s.properties?.title?.toLowerCase() === actualTab.toLowerCase()
    );
    return sheet?.properties?.sheetId ?? null;
  } catch (error) {
    console.error("Error fetching tab GID:", error);
    return null;
  }
}

/**
 * Delete a row by 1-based row index in a sheet tab
 */
export async function deleteRow(tabName: string, rowIndex1Based: number) {
  const sheets = getGoogleSheetsClient();
  if (!sheets || !spreadsheetId) return { success: false };

  try {
    const gid = await getTabGid(tabName);
    if (gid === null) return { success: false, message: "Tab not found" };

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: gid,
                dimension: "ROWS",
                startIndex: rowIndex1Based - 1,
                endIndex: rowIndex1Based,
              },
            },
          },
        ],
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error(`Error deleting row from ${tabName}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Ensure 'Pages' tab exists for Dynamic Page & Menu Builder
 */
export async function ensurePagesTab() {
  const sheets = getGoogleSheetsClient();
  if (!sheets || !spreadsheetId) return false;

  try {
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const exists = meta.data.sheets?.some(
      (s: any) => s.properties?.title?.toLowerCase() === "pages"
    );

    if (!exists) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: "Pages",
                  gridProperties: { rowCount: 100, columnCount: 10 },
                },
              },
            },
          ],
        },
      });

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: "Pages!A1:G1",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [["Slug", "Title", "Content", "ShowInMenu", "ParentMenu", "Order", "Status"]],
        },
      });
    }
    return true;
  } catch (e) {
    console.error("Failed to ensure Pages tab:", e);
    return false;
  }
}
