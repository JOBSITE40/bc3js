class ComentarioMedicion {
  constructor(parameters) {
    this._tipo = parameters.tipo
    this._comentario = parameters.comentario
    this._unidades = parameters.unidades
    this._longitud = parameters.longitud
    this._latitud = parameters.latitud
    this._altura = parameters.altura
  }
}

module.exports = { ComentarioMedicion }
