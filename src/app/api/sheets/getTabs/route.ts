import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
 
type RequestBody = {
  sheetId : string
}

export async function POST(req: NextRequest) {

  try {
    const {sheetId} : RequestBody = await req.json()

    if (!sheetId) {
      return new Response(
        JSON.stringify({ message: 'Spreadsheet ID is required' }),
        { status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          } }
      );
    }

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

    const response = await sheets.spreadsheets.get({
      spreadsheetId: sheetId,
    });

    const sheetTabs = response.data.sheets

    return new Response(
      JSON.stringify({ tabs: sheetTabs }),
      { status: 200, headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
       } }
    );
  } catch (error: unknown) {
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error('Error updating sheet:', errorMessage);
    return new Response(
      JSON.stringify({ message: 'Failed to update sheet', error: errorMessage }),
      { status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',} }
    );
  }
}
