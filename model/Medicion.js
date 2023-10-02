class Medicion {
  constructor(parameters) {
    this._codigoPadre = parameters.padre
    this._codigoHijo = parameters.hijo
    this._posicion = parameters.posicion
    this._medicionTotal = parameters.cantidadTotal
    this._comentarios = parameters.lista
    this._etiqueta = null
  }
}

module.exports = { Medicion }
