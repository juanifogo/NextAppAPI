import { prisma } from '@/db'
import { NextRequest, NextResponse } from 'next/server'
import moment from 'moment'

type Props = {
  params: {
    tag: string
  }
}

type sensoresPayload = {
  temperatura: number,
  humedad: number,
  latitud: number,
  longitud: number,
  tiempoMedicion: string
}

const checkTag = async (tag: any) => {
  try {
    const result = await prisma.camiones.findUnique({
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
    console.log(err)
    return "Error"
  }
}

const checkDuplicateDate = async (tag: string, tiempoMedicion: string) => {
  try {
    const result = await prisma.sensores.findFirst({
      where: {
        AND: [
          {
            idCamion: tag
          },
          {
            tiempoMedicion: tiempoMedicion
          }
        ]
      }
    })
    if (!result) {
      return false
    }
    else {
      return true
    }
  }
  catch(err){
    console.log(err)
    return "Error"
  }
}
const isValidISO8601 = (input: string): boolean => {
  return moment(input.trim(), moment.ISO_8601, true).isValid()
}

const isValidSensor = (obj: any): obj is sensoresPayload => {
  if (
    (typeof obj.humedad !== 'number') ||
    (typeof obj.temperatura !== 'number') ||
    (typeof obj.latitud !== 'number') ||
    (typeof obj.longitud !== 'number') ||
    (typeof obj.tiempoMedicion !== 'string') ||
    (!isValidISO8601(obj.tiempoMedicion))
  ) {
    return false
  }
  return true
}
export async function GET(req: NextRequest, { params: { tag } }: Props) {
  let exists = await checkTag(tag)
  switch (exists) {
    case "Error":
      return NextResponse.json({ mensaje: "Error del servidor" }, { status: 500 })

    case "Not Found":
      let output = "No se encontro un camion con el tag correspondiente"
      console.log(output)
      return NextResponse.json({ mensaje: output }, { status: 404 })

    default:
      break
  }

  try {
    const result = await prisma.sensores.findMany({
      where: {
        idCamion: tag
      }
    })
    if (result.length === 0) {
      let output = "Este camion no tiene datos de sensores"
      console.log(output)
      return NextResponse.json({ mensaje: output }, { status: 404 })
    }
    let output = `GET a /api/camiones/${tag}`
    console.log(output)
    return NextResponse.json(result, { status: 200 })
  }
  catch (err) {
    console.log(err)
    return NextResponse.json({ mensaje: "Error del servidor" }, { status: 500 })
  }
}

export async function POST(req: Request, { params: { tag } }: Props) {
  tag = tag.trim()
  let exists = await checkTag(tag)
  switch (exists) {
    case "Error":
      return NextResponse.json({ mensaje: "Error del servidor" }, { status: 500 })

    case "Not Found":
      let output = "No se encontro un camion con el tag correspondiente"
      console.log(output)
      return NextResponse.json({ mensaje: output }, { status: 404 })

    default:
      break
  }

  const payload: sensoresPayload = await req.json()

  if (!isValidSensor(payload)) {
    let output = 'Formato incorrecto'
    console.log(output)
    return NextResponse.json({ mensaje: output }, { status: 400 })
  }

  payload.tiempoMedicion = payload.tiempoMedicion.trim()

  if (new Date(Date.now()) < new Date(payload.tiempoMedicion)) {
    let output = "Fecha invalida"
    console.log(output)
    return NextResponse.json({ mensaje: output }, { status: 400 })
  }
  if(await checkDuplicateDate(tag, payload.tiempoMedicion)){
    let output = "Este camion ya tiene una medicion con esa fecha"
    console.log(output)
    return NextResponse.json({ mensaje: output }, { status: 400 })
  }
  try {
    let result = await prisma.sensores.create({
      data: {
        temperatura: payload.temperatura,
        humedad: payload.humedad,
        latitud: payload.latitud,
        longitud: payload.longitud,
        tiempoMedicion: payload.tiempoMedicion,
        idCamion: tag
      }
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