import { NextResponse } from 'next/server';

export async function GET(){
    return NextResponse.json({mensage: 'Bienvenido a la API'})
}