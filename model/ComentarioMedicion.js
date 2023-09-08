class ComentarioMedicion {
  constructor(comentario, unidades, longitud, latitud, altura) {
      this._tipo = null
      this._comentario = comentario
      this._unidades = unidades
      this._longitud = longitud
      this._latitud = latitud
      this._altura = altura
  }
}

module.exports = { ComentarioMedicion }
