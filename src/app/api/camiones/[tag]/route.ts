import { prisma } from '@/db'
import { NextResponse } from 'next/server'
import { checkTag } from '@/utils'
import { camionPayload } from '@/types'
import { isValidPatente } from '@/utils'
import { isValidCamion } from '@/utils'
import { Props } from '@/types'

export async function GET(req: Request, { params: { tag } }: Props) {
  try {
    const result = await prisma.camiones.findUnique({
      where: {
        tag: tag
      }
    })
    let output = `GET a /api/camiones/${tag}`
    console.log(output)
    if (result) {
      return NextResponse.json(result, { status: 200 })
    }
    output = "No se encontro el camion con el tag correspondiente"
    return NextResponse.json({ mensaje: output }, { status: 404 })
  }
  catch (err) {
    return NextResponse.json({ mensaje: "Error del servidor" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params: { tag } }: Props) {
  let id: string

  let res = await checkTag(tag)
  switch (res) {
    case "Error":
      return NextResponse.json({ mensaje: "Error del servidor" }, { status: 500 })

    case "Not Found":
      let output = "No se encontro un camion con el tag correspondiente"
      console.log(output)
      return NextResponse.json({ mensaje: output }, { status: 404 })

    default:
      id = res
      break
  }

  const payload: camionPayload = await req.json()
  if (!isValidCamion(payload)) {
    let output = 'Formato incorrecto'
    console.log(output)
    return NextResponse.json({ mensaje: output }, { status: 400 })
  }

  payload.tag = payload.tag.trim().toLowerCase()
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
    await prisma.camiones.update({
      where: {
        tag: tag
      },
      data: {
        tag: payload.tag,
        patente: payload.patente,
        modelo: payload.modelo,
        capacidad: payload.capacidad,
        compania: payload.compania
      }
    })
    let output = `Patente: ${payload.patente}%, modelo: ${payload.modelo}°C, Capacidad:${payload.capacidad} Compania: ${payload.compania}, ID: ${id}`
    console.log(output)
    return NextResponse.json({ ID: id }, { status: 200 })
  }

  catch (err) {
    return NextResponse.json({ mensaje: "Error del servidor" }, { status: 500 })
  }
}