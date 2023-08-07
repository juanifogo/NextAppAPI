import { NextResponse } from 'next/server';
import { prisma } from '@/db'
import { camionPayload } from '@/types'
import { isValidPatente } from '@/utils'
import { isValidCamion } from '@/utils'

export async function GET() {
  try {
    const result = await prisma.camiones.findMany()
    let output = "GET a /api/camiones"
    console.log(output)
    return NextResponse.json(result, { status: 200 })
  }
  catch (err) {
    return NextResponse.json({ mensaje: "Error del servidor" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const payload: camionPayload = await req.json()

  if (!isValidCamion(payload)) {
    let output = 'Formato incorrecto'
    console.log(output)
    return NextResponse.json({ mensaje: output }, { status: 400 })
  }

  payload.tag = payload.tag.trim()
  payload.patente = payload.patente.trim()
  payload.modelo = payload.modelo.trim()
  payload.compania = payload.compania.trim()

  if([payload.tag, payload.patente, payload.modelo, payload.compania].includes('')){
    let output = 'Formato incorrecto'
    console.log(output)
    return NextResponse.json({ mensaje: output }, { status: 400 })
  }
  if(!isValidPatente(payload.patente)){
    let output = 'Patente ivalida'
    console.log(output)
    return NextResponse.json({ mensaje: output }, { status: 400 })
  }
  try {
    const result = await prisma.camiones.findFirst({
      where: {
        OR: 
        [
          {tag: payload.tag},
          {patente: payload.patente}
        ]
        
      }
    })

    if (result?.tag === payload.tag) {
      let output = 'Ya existe una columna con el tag correspondiente'
      console.log(output)
      return NextResponse.json({ mensaje: output }, { status: 400 })
    }
    if(result?.patente === payload.patente){
      let output = 'Ya existe una columna con la patente correspondiente'
      console.log(output)
      return NextResponse.json({ mensaje: output }, { status: 400 })
    }
  }
  catch (err) {
    return NextResponse.json({ mensaje: "Error del servidor" }, { status: 500 })
  }

  try {
    const result = await prisma.camiones.create({
      data: {
        tag: payload.tag,
        patente: payload.patente,
        modelo: payload.modelo,
        capacidad: payload.capacidad,
        compania: payload.compania
      },
    })

    let output = `Recurso creado con ID: ${result.id}`
    console.log(output)
    return NextResponse.json({ mensaje: output }, { status: 201 })
  }
  catch (err) {
    return NextResponse.json({ mensaje: "Error del servidor" }, { status: 500 })
  }
}