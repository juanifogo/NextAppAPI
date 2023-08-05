import { prisma } from '@/db'
import { NextResponse } from 'next/server'

const checkTag = async (tag: string) => {
  try {
    const result = await prisma.camiones.findFirst({
      where: {
        tag: tag
      }
    })

    if (!result) {
      return "Not Found"
    }
    else {
      return result.id
    }
  }
  catch (err) {
    return "Error"
  }
}

type camionPayload = {
  tag: string,
  patente: string,
  modelo: string,
  capacidad: number,
  compania: string
}

type Props = {
  params: {
    tag: string
  }
}

const isValidPatente = (input: any): boolean => {
  const regex = /^[A-Z]{3}-[0-9]{3}$/
  return regex.test(input)
}
const isValidCamion = (obj: any): obj is camionPayload => {
  if (
    (typeof obj.tag !== 'string') ||
    (typeof obj.modelo !== 'string') ||
    (typeof obj.capacidad !== 'number') ||
    (typeof obj.compania !== 'string') ||
    (typeof obj.patente !== 'string')
  ) {
    return false
  }
  return true
}

export async function GET(req: Request, { params: { tag } }: Props) {
  try {
    const result = await prisma.camiones.findFirst({
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