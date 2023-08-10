import { NextResponse } from 'next/server';
import { prisma } from '@/db'
import { camionPayload } from '@/types'
import { isValidPatente, isValidCamion, trimObjectStr } from '@/utils'

export async function GET() {
  try {
    const result = await prisma.camiones.findMany()
    let output = "GET a /api/camiones"
    console.log(output)
    return NextResponse.json(result, { status: 200 })
  }
  catch (err) {
    console.log(err)
    return NextResponse.json({ mensaje: "Error del servidor" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  let payload: camionPayload = await req.json()

  if (!isValidCamion(payload, 'deny')) {
    let output = 'Formato incorrecto'
    console.log(output)
    return NextResponse.json({ mensaje: output }, { status: 400 })
  }
  let containsEmpty: boolean
  [payload, containsEmpty] = trimObjectStr(payload)
  if (containsEmpty) {
    let output = 'Formato incorrecto'
    console.log(output)
    return NextResponse.json({ mensaje: output }, { status: 400 })
  }
  payload.tag = payload.tag.toLowerCase()
  if (!isValidPatente(payload.patente)) {
    let output = 'Patente ivalida'
    console.log(output)
    return NextResponse.json({ mensaje: output }, { status: 400 })
  }
  try {
    const result = await prisma.camiones.findFirst({
      where: {
        OR:
          [
            { tag: payload.tag },
            { patente: payload.patente }
          ]

      }
    })

    if (result?.tag === payload.tag) {
      let output = 'Ya existe una columna con el tag correspondiente'
      console.log(output)
      return NextResponse.json({ mensaje: output }, { status: 400 })
    }
    if (result?.patente === payload.patente) {
      let output = 'Ya existe una columna con la patente correspondiente'
      console.log(output)
      return NextResponse.json({ mensaje: output }, { status: 400 })
    }
  }
  catch (err) {
    console.log(err)
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
    console.log(err)
    return NextResponse.json({ mensaje: "Error del servidor" }, { status: 500 })
  }
}