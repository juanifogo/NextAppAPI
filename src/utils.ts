import { camionPayload } from './types'
import { sensoresPayload } from './types'
import { prisma } from '@/db'
import moment from 'moment'

export const isValidISO8601 = (input: string): boolean => {
    return moment(input.trim(), moment.ISO_8601, true).isValid()
}
  
export const isValidPatente = (input: any): boolean => {
    const regex = /^[A-Z]{3}-[0-9]{3}$/
    return regex.test(input)
}

export const isValidCamion = (obj: any): obj is camionPayload => {
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

export const isValidSensor = (obj: any): obj is sensoresPayload => {
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
  
export const checkTag = async (tag: string) => {
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
      return "Error"
    }
}

export const checkDuplicateDate = async (tag: string, tiempoMedicion: string) => {
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
  