const { getDate } = require('./Utils')

class Propiedad {
  constructor(pa, ca) {
    this._propiedadArchivo = pa
    this._versionFormato = 'FIEBDC-3/2016'
    this._ddmmaaaa = getDate()
    this._programaEmision = 'BC3js'
    this._cabecera = ca
  }
}

module.exports = { Propiedad }
