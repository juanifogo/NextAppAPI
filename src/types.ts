export type camionPayload = {
    id: string,
    tag: string,
    patente: string,
    modelo: string,
    capacidad: number,
    compania: string
}

export type sensoresPayload = {
    temperatura: number,
    humedad: number,
    latitud: number,
    longitud: number,
    tiempoMedicion: string
}

export type Props = {
    params: {
      tag: string
    }
}
  