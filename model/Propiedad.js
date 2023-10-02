const { getDate } = require('./Utils')

class Propiedad {
  constructor(propiedadArchivo, versionFormato_fecha, programaEmision, cabecera_rotuloIdentificacion, juegoCaracteres, comentario, tipoInformacion, numeroCertificacion, fechaCertificacion, urlBase) {
    this._propiedadArchivo = propiedadArchivo
    this._versionFormato_fecha = versionFormato_fecha
    this._programaEmision = programaEmision
    this._cabecera_rotuloIdentificacion = cabecera_rotuloIdentificacion
    this._juegoCaracteres = juegoCaracteres
    this._comentario = comentario
    this._tipoInformacion = tipoInformacion
    this._numeroCertificacion = numeroCertificacion
    this._fechaCertificacion = fechaCertificacion
    this._urlBase = urlBase
  }
}

module.exports = { Propiedad }
