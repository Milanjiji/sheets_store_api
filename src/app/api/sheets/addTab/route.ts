import { google } from 'googleapis';

type RequestBody = {
  sheetName : string,
  sheetId : string
}

export async function POST(req:Request) {

  try {
    
    const { sheetName, sheetId}:RequestBody = await req.json();
   
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

    await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: sheetName, 
                },
              },
            },
          ],
        },
      });

    return new Response(JSON.stringify({ message: 'Sheet updated successfully with default values!' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });  
  } catch (error: unknown) {
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