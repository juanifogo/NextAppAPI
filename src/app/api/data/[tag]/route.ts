import {prisma} from '@/db'
import { NextResponse } from 'next/server'

const chkUndef = (element: any) => typeof(element) === 'undefined'

type Props = {
  params: {
    tag: string
  }
}

export async function POST(req: Request, { params: { tag }}: Props){

  const {humedad, temperatura, "x-pos":x_pos, "y-pos":y_pos} = await req.json()
  let id: number

  if([humedad, temperatura, x_pos, y_pos].some(chkUndef)){
    let output = 'No puede haber campos vacios'
    console.log(output)
    return NextResponse.json({mensaje: output}, {status: 400})
  }

  try{
    const result = await prisma.transporte.findFirst({
      where: {
        tag: tag
      }
    })

    if(!result){
      let output = "No se encontro una columna con el tag correspondiente"
      console.log(output)
      return NextResponse.json({mensaje: output}, {status: 404})
    }
    id = result.id
  }

  catch(err){
      return NextResponse.json({mensaje: "Error del servidor"}, {status: 500})
  }

  try{
    await prisma.transporte.updateMany({
      where: {
        tag: tag
      },
      data: {
        humedad: humedad,
        temperatura: temperatura,
        x_pos: x_pos,
        y_pos: y_pos
      }
    })
    let output = `Humedad: ${humedad}%, temperatura: ${temperatura}°C, X:${x_pos} Y: ${y_pos}, ID: ${id}`
    console.log(output)
    return NextResponse.json({mensaje: output}, {status: 200})
  }
  
  catch(err){
    return NextResponse.json({mensaje: "Error del servidor"}, {status: 500})
  }
}