import { google } from 'googleapis';

type RequestBody = {
  sheetId:string,
  oldSheetName : string,
  newSheetName:string
}

export async function POST(req: Request) {
  try {
    const { sheetId, oldSheetName, newSheetName } : RequestBody = await req.json();

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

    // Fetch the spreadsheet to get the sheet ID of the tab to be renamed
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    const sheet = spreadsheet.data.sheets?.find(
      (s) => s.properties?.title === oldSheetName
    );

    if (!sheet) {
      return new Response(
        JSON.stringify({ message: 'Sheet not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const sheetIdToRename = sheet.properties?.sheetId;

    // Rename the sheet/tab
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            updateSheetProperties: {
              properties: {
                sheetId: sheetIdToRename,
                title: newSheetName,
              },
              fields: 'title',
            },
          },
        ],
      },
    });

    return new Response(
      JSON.stringify({ message: 'Sheet renamed successfully' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }  catch (error: unknown) {
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error('Error updating sheet:', errorMessage);
    return new Response(
      JSON.stringify({ message: 'Failed to update sheet', error: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
