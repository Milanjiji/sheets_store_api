import { google } from 'googleapis';

type RequestBody = {
  sheetId: string,      // spreadsheetId (the full Google Sheet)
  sheetName: string,
  index: number          // tab name (like "Sheet1")
};

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function POST(req: Request) {
  try {
    const { sheetId, sheetName, index }: RequestBody = await req.json();
    console.log(sheetName,"sheetname for required for change")

    const credentials = {
      type: 'service_account',
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    };

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Get the numeric sheetId from the sheetName (tab title)
    const meta = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
    const availableSheets = meta.data.sheets ?? [];
    console.log("Available sheets:", availableSheets.map(s => s.properties?.title));

    const sheetInfo = availableSheets.find(
      s => s.properties?.title === sheetName
    );
    console.log(sheetInfo,"sheetInfo")

    if (!sheetInfo) {
      console.error("Sheet name not found");
      return new Response(JSON.stringify({ message: "Sheet name not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const tabId = sheetInfo.properties?.sheetId;

    if (tabId === undefined) {
      return new Response(JSON.stringify({ message: 'Sheet name not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...CORS_HEADERS,
        },
      });
    }

    // Delete row (index - 1)
    const deleteResponse = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: tabId,
                dimension: 'ROWS',
                startIndex: index -1,
                endIndex: index ,
              },
            },
          },
        ],
      },
    });

    console.log("Delete response:", deleteResponse.status, deleteResponse.statusText);

    return new Response(
      JSON.stringify({ message: 'Row deleted successfully' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...CORS_HEADERS,
        },
      }
    );

  } catch (error: unknown) {
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error('Error deleting row:', errorMessage);
    return new Response(
      JSON.stringify({ message: 'Failed to delete row', error: errorMessage }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...CORS_HEADERS,
        },
      }
    );
  }
}
