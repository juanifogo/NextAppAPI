import { NextResponse } from 'next/server';
import {prisma} from '@/db'

const chkUndef = (element: any) => typeof(element) === 'undefined'

export async function GET(){
    try{
        const result = await prisma.transporte.findMany()
        let output = "GET a /api/data"
        console.log(output)
        return NextResponse.json(result, {status: 200})
      }
      catch(err){
        return NextResponse.json({mensaje: "Error del servidor"}, {status: 500})
      }  
}

export async function POST(req: Request){
    const {temperatura, humedad, "x-pos":x_pos, "y-pos":y_pos, tag} = await req.json()

    if([humedad, temperatura, x_pos, y_pos, tag].some(chkUndef)){
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

      if (result){
        let output = 'Ya existe una columna con el tag correspondiente'
        console.log(output)
        return NextResponse.json({mensaje: output}, {status: 400})
      }
    }
    catch(err){
        return NextResponse.json({mensaje: "Error del servidor"}, {status: 500})
    }

    try{
      const result = await prisma.transporte.create({
        data: {
          humedad: humedad,
          temperatura: temperatura,
          x_pos: x_pos,
          y_pos: y_pos,
          tag: tag
        },
      })
    
      let output = `Recurso creado con ID: ${result.id}, tag: ${tag}`
      console.log(output)
      return NextResponse.json({mensaje: output}, {status: 201})
    }
    catch(err){
      return NextResponse.json({mensaje: "Error del servidor"}, {status: 500})
    }
}