import { prisma } from '@/db'
import { NextRequest, NextResponse } from 'next/server'

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
  tiempoMedicion: Date
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

export async function GET(req: NextRequest, { params: { tag } }: Props) {
  //const tag = req.url.split('/').at(-2)
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
  const payload: sensoresPayload = await req.json()
  if ([payload.humedad,
  payload.temperatura,
  payload.latitud,
  payload.longitud,
  payload.tiempoMedicion].some(chkUndef)) {
    let output = 'No puede haber campos vacios'
    console.log(output)
    return NextResponse.json({ mensaje: output }, { status: 400 })
  }

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