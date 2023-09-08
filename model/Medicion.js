class Medicion {
  constructor(codigoPadre, codigoHijo, posicion, medicionTotal, lineas) {
    this._codigoPadre = codigoPadre
    this._codigoHijo = codigoHijo
    this._posicion = posicion
    this._medicionTotal = medicionTotal
    this._lineas = lineas
  }
}

module.exports = { Medicion }
