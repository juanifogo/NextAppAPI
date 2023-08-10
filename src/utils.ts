import {
  camionPayload, sensoresPayload,
  ZodCamionPayload, ZodSensoresPayload
} from './types'
import { prisma } from '@/db'
import moment from 'moment'
import { z } from 'zod'

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

export const isValidCamion = (
  obj: any,
  acceptEmpty: 'permit' | 'deny'): obj is camionPayload => {
  if (acceptEmpty === 'deny') {
    return
  }
  else {

  }
  //   if (acceptEmpty === 'deny') {
  //   if (
  //     (typeof obj.tag !== 'string') ||
  //     (typeof obj.modelo !== 'string') ||
  //     (typeof obj.capacidad !== 'number') ||
  //     (typeof obj.compania !== 'string') ||
  //     (typeof obj.patente !== 'string') ||
  //     (!isValidPatente(obj.patente))
  //   ) {
  //     return false
  //   }
  //   return true
  // }
  // else {
  //   if (
  //     ((typeof obj.tag !== 'string') && (typeof obj.tag !== 'undefined')) ||
  //     ((typeof obj.modelo !== 'string') && (typeof obj.modelo !== 'undefined')) ||
  //     ((typeof obj.capacidad !== 'number') && (typeof obj.capacidad !== 'undefined')) ||
  //     ((typeof obj.compania !== 'string') && (typeof obj.compania !== 'undefined')) ||
  //     ((typeof obj.patente !== 'string') && (typeof obj.patente !== 'undefined')) ||
  //     ((typeof obj.patente === 'string') && (!isValidPatente(obj.patente)))
  //   ) {
  //     return false
  //   }
  //   return true
  // }
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

export const checkUnique = async (fields: any, table: 'sensores' | 'camiones') => {
  let PrismaTable: any
  if (table === 'sensores') {
    PrismaTable = prisma.sensores
  }
  else {
    PrismaTable = prisma.camiones
  }

  try {
    const result = await PrismaTable.findFirst({
      where: fields
    })

    if (!result) {
      return "Not Found"
    }
    else {
      return result
    }
  }
  catch (err) {
    console.log(err)
    return "Error"
  }
}