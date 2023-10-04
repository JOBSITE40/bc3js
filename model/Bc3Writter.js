class Bc3Writter {

  #propiedad = null
  #coeficiente = null
  #conceptos = []
  #descomposiciones = []
  #mediciones = []

  constructor(parameters) {
    this.#propiedad = parameters.propiedad
    this.#coeficiente = parameters.coeficiente
    this.#conceptos = parameters.conceptos
    this.#descomposiciones = parameters.descomposiciones
    this.#mediciones = parameters.mediciones

  }

  async #writePropiedad() {
    // tenemos que hacer lo inverso que haciamos en Bc3Reader para escribir el archivo
    console.log('VEAMOS LA PROPIEDAD', this.#propiedad)
  }



  async createFile() {
    return new Promise((resolve, reject) => {
      this.#writePropiedad()
      resolve()
    })
    // const init = 'Hello World'
    // this._blob = new Blob([init], { type: 'text/plain' })
  }
}

module.exports = { Bc3Writter }
