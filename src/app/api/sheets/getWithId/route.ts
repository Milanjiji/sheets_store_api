import { google } from 'googleapis';

type RequestBody = {
  sheetId : string,
  sheetName :  string,
  docId: string
}

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

export async function POST(req:Request) {
  try {
    const {sheetId, sheetName, docId}: RequestBody = await req.json();
    const range = `${sheetName}!A:A`;
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
    const spreadsheetId = sheetId;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values || [];

    let targetRowIndex = -1;

    for (let i = 0; i < rows.length; i++) {
      const cell = rows[i][0];
      if (cell && cell.startsWith('docId:')) {
        const currentDocId = cell.split(':')[1];
        if (currentDocId === docId) {
          targetRowIndex = i;
          break;
        }
      }
    }

    if (!rows || rows.length === 0) {
      return new Response(JSON.stringify({ message: 'No data found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...CORS_HEADERS,
        },
      });
    }

    return new Response(JSON.stringify({ message: 'Data retrieved successfully', index: targetRowIndex }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...CORS_HEADERS,
      },
    });

  } catch (error: unknown) {
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error('Error updating sheet:', errorMessage);
    return new Response(
      JSON.stringify({ message: 'Failed to update sheet', error: errorMessage }),
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
