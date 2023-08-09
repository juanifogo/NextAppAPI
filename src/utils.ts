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

export const trimObjectStr = (obj: any) => {
  let trimmedObj: any = {}
  let trimmedVal: string
  let containsEmpty: boolean = false
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      trimmedVal = obj[key].trim()
      if (trimmedVal === '') { containsEmpty = true }
      trimmedObj[key] = trimmedVal
    }
    else {
      trimmedObj[key] = obj[key]
    }
  }
  return [trimmedObj, containsEmpty]
}

export const filterObject = (obj: any, allowedKeys: Array<string>) => {
  let filteredObj: any = {}
  for (const key in obj) {
    if (allowedKeys.includes(key)) {
      filteredObj[key] = obj[key]
    }
  }
  return filteredObj
}

// todo: rewrite this function to be more readable and have the same functionality

export const isValidCamion = (
  obj: any,
  acceptEmpty: 'permit' | 'deny'): obj is camionPayload => {
  if (acceptEmpty === 'deny') {
    if (
      (typeof obj.tag !== 'string') ||
      (typeof obj.modelo !== 'string') ||
      (typeof obj.capacidad !== 'number') ||
      (typeof obj.compania !== 'string') ||
      (typeof obj.patente !== 'string') ||
      (!isValidPatente(obj.patente))
    ) {
      return false
    }
    return true
  }
  else {
    if (
      ((typeof obj.tag !== 'string') && (typeof obj.tag !== 'undefined')) ||
      ((typeof obj.modelo !== 'string') && (typeof obj.modelo !== 'undefined')) ||
      ((typeof obj.capacidad !== 'number') && (typeof obj.capacidad !== 'undefined')) ||
      ((typeof obj.compania !== 'string') && (typeof obj.comapnia !== 'undefined')) ||
      ((typeof obj.patente !== 'string') && (typeof obj.patente !== 'undefined')) ||
      ((typeof obj.patente === 'string') && (!isValidPatente(obj.patente)))
    ) {
      return false
    }
    return true
  }

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
    console.log(err)
    return "Error"
  }
}

export const checkDuplicatePatente = async (patente: string) => {
  try {
    const result = await prisma.camiones.findUnique({
      where: {
        patente: patente
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
  catch (err) {
    console.log(err)
    return "Error"
  }
}
