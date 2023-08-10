import { z } from 'zod'

const regex = /^[A-Z]{3}-[0-9]{3}$/
export const ZodCamionPayload = z.object({
    id: z.string(),
    tag: z.string().trim().nonempty().toLowerCase(),
    patente: z.string().trim().nonempty().toUpperCase().regex(regex),
    modelo: z.string().trim().nonempty(),
    capacidad: z.number(),
    compania: z.string().trim().nonempty()
})
export type camionPayload = z.infer<typeof ZodCamionPayload>

export const ZodSensoresPayload = z.object({
    temperatura: z.number(),
    humedad: z.number(),
    latitud: z.number(),
    longitud: z.number(),
    tiempoMedicion: z.string().trim().nonempty().datetime()
})

export type sensoresPayload = z.infer<typeof ZodSensoresPayload>

export type Props = {
    params: {
        tag: string
    }
}
