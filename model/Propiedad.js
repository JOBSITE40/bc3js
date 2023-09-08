const { getDate } = require('./Utils')

class Propiedad {
  constructor(propiedadArchivo, versionFormato, fecha, programaEmision, cabecera) {
    this._propiedadArchivo = propiedadArchivo
    this._versionFormato = versionFormato
    this._ddmmaaaa = fecha
    this._programaEmision = programaEmision
    this._cabecera = cabecera
  }
}

module.exports = { Propiedad }
