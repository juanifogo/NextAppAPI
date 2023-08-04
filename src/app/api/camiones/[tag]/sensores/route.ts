import { prisma } from '@/db'
import { NextRequest, NextResponse } from 'next/server'
import moment from 'moment'

const chkUndef = (element: any) => typeof (element) === 'undefined'

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
    console.log(err)
    return "Error"
  }
}

const isValidISO8601 = (input: any): boolean => {
  return moment(input, moment.ISO_8601, true).isValid()
}

const isValidSensor = (obj: any): obj is sensoresPayload => {
  if (
    (typeof (obj.humedad) !== 'number') ||
    (typeof (obj.temperatura) !== 'number') ||
    (typeof (obj.latitud) !== 'number') ||
    (typeof (obj.longitud) !== 'number') ||
    (!isValidISO8601(obj.tiempoMedicion))
  ) {
    return false
  }
  return true
}
export async function GET(req: NextRequest, { params: { tag } }: Props) {
  try {
    const result = await prisma.sensores.findMany({
      where: {
        idCamion: tag
      }
    })
    if (!result) {
      let output = "No se encontro un camion con el tag correspondiente"
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

  if ([
    payload.temperatura,
    payload.humedad,
    payload.latitud,
    payload.longitud,
    payload.tiempoMedicion
  ].some(chkUndef)) {
    let output = 'No puede haber campos vacios'
    console.log(output)
    return NextResponse.json({ mensaje: output }, { status: 400 })
  }

  payload.tiempoMedicion = payload.tiempoMedicion.trim()
  if (payload.tiempoMedicion.length === 0) {
    let output = 'No puede haber campos vacios'
    console.log(output)
    return NextResponse.json({ mensaje: output }, { status: 400 })
  }
  if (!isValidSensor(payload)) {
    let output = 'Formato incorrecto'
    console.log(output)
    return NextResponse.json({ mensaje: output }, { status: 400 })
  }
  if (new Date(Date.now()) < new Date(payload.tiempoMedicion)) {
    let output = "Fecha invalida"
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