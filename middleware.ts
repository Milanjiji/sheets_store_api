import { NextRequest, NextResponse } from "next/server";
import Cors from 'cors';

const cors = Cors({
    origin: '*', // Replace with your frontend URL in production
    methods: ['GET', 'POST', 'OPTIONS'],
  });

export function middleware(request : NextRequest){

    if (request.nextUrl.pathname.startsWith('/api')) {
        const response = NextResponse.next();
        
        
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    
        
        if (request.method === 'OPTIONS') {
          return new NextResponse(null, { status: 204, headers: response.headers });
        }
    
        return response;
      }
    
      return NextResponse.next();
}

// export const config = {
//     matcher:"/profile"
// }

