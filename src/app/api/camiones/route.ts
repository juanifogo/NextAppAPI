import { NextResponse } from 'next/server';
import { prisma } from '@/db'

const chkUndef = (element: any) => typeof (element) === 'undefined'

type camionPaylaod = {
  tag: string,
  patente: string,
  modelo: string,
  capacidad: number,
  compania: string
}

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
  const payload: camionPaylaod = await req.json()

  if ([payload.tag,
  payload.patente,
  payload.modelo,
  payload.capacidad,
  payload.compania].some(chkUndef)) {
    let output = 'No puede haber campos vacios'
    console.log(output)
    return NextResponse.json({ mensaje: output }, { status: 400 })
  }
  try {
    const result = await prisma.camiones.findFirst({
      where: {
        tag: payload.tag
      }
    })

    if (result) {
      let output = 'Ya existe una columna con el tag correspondiente'
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