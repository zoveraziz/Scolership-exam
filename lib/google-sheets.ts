import { google } from "googleapis";

// Google Cloud Service Account configuration
const clientEmail =
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ||
  "dsp-exam-service@dsp-exan-project.iam.gserviceaccount.com";

const privateKey = (
  process.env.GOOGLE_PRIVATE_KEY ||
  `-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDWSiXgnxsoVaM7\nsfru1lBUzptR2YTU6kWPI8dbx0NCzybN06QGBG96p2zVncXYMOMdDbu9abG0L8TP\nyWLCPqDrBDhcAA5G2RX+9Gg6EUyqoGVINTOxFYu3twSd5pxgWqjIENycATLESiBf\nN5CC1cf1FEoSvG1mrKfGhg4t0ZBXF48a5s2ZtkxO9KbQAV8x/vKVwheSTeGcRHl7\nFC3OhFyfzXwwHQm15fgdGWslsdKwGvLdSOu4brJUAQpYLBSCUc4mHKXNN7p8lrou\n+MegCQ2i6AoVyr1lvmajdfc3KVfsrKBV4OyZn1EL0G4Su6Tc5UcNSNCkWA8PUAKb\nITf9AaSnAgMBAAECggEAE8Gh91vD5baWMOk/pihvyeSDJmCEYhrijzKwbRzpwxg/\nzscok/4cXGBg5Nrsbs+nCLqHk2F8vDeRO3T+MW6+aEcrKQmU8gw5U8MAdFC8Uu4s\nbaQAtYlefcbBBWEfDAp1DX5HJezoW3eCv4nrErJCAq2Rsg4u6eyYypv5D66xUji9\nqg73ZflKTvnM7gnsnjWSVOef5Dry6+YsiCtPvLIW2VOwcyQdaaSPOlLnbTPGLQtU\n7jHULDJwCh1SbEr7Fvx6YLLoj9Jj7vMMMB0YeBrAApL1/aE9p63SwD990KxsK0H4\nRRflXyYO1N98bbBB7U2KgwUO1e4RRoDD72G2XfMFAQKBgQD9qHFqvHVrJc+j/bW3\nBZP/sTmh5zss4JREBbUnxSX5epIXvmUWQpPhZbMqGVNyXWk81e1nyP0jfRbT8DqX\nmErCbDHkS9o237Ke2MJRambIbQm2aQxMb6g78HHo4/CqpER/wNyBB2InV4kMgXOy\nZewGemvv2FOm1Zs+FaNskNgZAQKBgQDYRKb3ecqffeRTI3dnOv3gGJXJRntfN8wD\nR3bL5/mpDsSOmfWPZkWv65XUsUC8wF2jWZlCci6rKwB5zZOGlv0YScaMM9p4a42i\nEfOUNI0dyVsZvQ9spm1JjEJbVKUR/j+LM2Y69UWsPukaxpn7iUOlUTr8TxqJQ1uB\njRjwY7xVpwKBgQCMliY+NTOS7kL2LjDfvny3k59Qp5r5lYM3bD5qS29vpUqBVGos\nezwBCd/SLnU8hp9EM4FAK3p5h+P2FUg0KxkMRvEkChJopXUXayXP//v1i9F9Qx2o\n453Hks1fea4ytZatg9Pyw4fYLEDuKHVaY/j74jAen7RFXFCNiWqpSmIrAQKBgDmi\nKgC/czEHwqYpSHO5M9jZlGk8IDqiyvqAu/bhDhZweg8qllctwRp9pMM2rXLfrNSQ\nVxhvB2LUJd9P2qW+bRpg5smMNAdtWiQ7tnbjfkvW0jFMweSJgYxdFX3zU740zEhT\nXUYPAQ9DAKoDDRwMW3ud5yNADWlRCvy+VkwRuCn3AoGBAM/RzzvbjGv4+X75WczR\nZlj1L2hWOgXO4AsdKM90ATo6pWm3jnFymCkiU6Q3ADD87wnxlU+HzZULXThO8RRQ\npvQhEkhnkXtLm4XB72s9iUFkRwmKuCJS+7IBXpdbOdUdgwnEhWosjP1fA/ss84zW\nuUFDo53MNEqXseHhBICThB/b\n-----END PRIVATE KEY-----\n`
).replace(/\\n/g, "\n");

const spreadsheetId =
  process.env.GOOGLE_SHEET_ID || "1ZZa_znMpmvFEgg3EydycX4_LfXyfcH-UCLrWZQ3j_Sg";

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
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const sheet = meta.data.sheets?.find(
      (s: any) => s.properties?.title?.toLowerCase() === tabName.toLowerCase()
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
