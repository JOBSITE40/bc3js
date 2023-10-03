const fs = require('fs')
const path = require('path')
const { Propiedad } = require('./Propiedad')
const { Concepto } = require('./Concepto')
const { Descomposicion } = require('./Descomposicion')
const { Medicion } = require('./Medicion')
const { ComentarioMedicion } = require('./ComentarioMedicion')
const { Coeficiente } = require('./Coeficiente')
const { DescomposicionHijo } = require('./DescomposicionHijo')

class Bc3Reader {

  #propiedad = null
  #coeficiente = null
  #conceptos = []
  #descomposiciones = []
  #mediciones = []
  #data = null

  constructor(file, path = null) {
    this.file = file
    this.path = path
  }

  async #createFile() {
    return new Promise((resolve, reject) => {
      // tengo que coger el file que viene del constructor, crear una carpeta temporal en dicho servidor y guardar el archivo en dicha carpeta
      if (!this.file) {
        reject(new Error('No file provided'))
        return;
      }

      const uploadDir = path.join(__dirname, '../uploads')
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir)
      }

      const timestamp = Date.now(); // Obtiene la marca de tiempo actual en milisegundos
      const randomValue = Math.floor(Math.random() * 10000);

      const fileName = `${timestamp}_${randomValue}.bc3`;
      this.path = path.join(uploadDir, fileName)

      const fileStream = fs.createWriteStream(path.join(uploadDir, fileName))

      const fileData = JSON.stringify(this.file)

      const data = Buffer.from(fileData)


      fileStream.write(data)

      fileStream.on('finish', () => {
        resolve(fileName)
      })

      fileStream.on('error', (error) => {
        reject(error)
      })

      resolve()
    })

  }
  async #getPropiedad() {
    return new Promise((resolve, reject) => {
      const item = this.#data.find((x) => x.startsWith('~V'))
      const d = item.split('|')
      const propiedad = new Propiedad(d[1], d[2], d[3], d[4], d[5], d[6], d[7], d[8], d[9], d[10])
      this.#propiedad = propiedad
      resolve()
    })
  }


  async #getCoeficiente() {
    return new Promise((resolve, reject) => {
      const item = this.#data.find((x) => x.startsWith('~K'))
      const d = item.split('|')
      const p1 = d[1].split('\\')
      const p2 = d[2].split('\\')
      const p3 = d[3].split('\\')
      const n = d[4]

      const coeficiente = new Coeficiente(p1, p2, p3, n)
      this.#coeficiente = coeficiente
      resolve()
    })
  }


  async #getConceptos() {
    return new Promise((resolve, reject) => {
      const conceptos = this.#data.filter((x) => x.startsWith('~C'))
      conceptos.forEach((item) => {
        const d = item.split('|')
        const n = (d[1].match(new RegExp('#', 'g')) || []).length
        const concepto = new Concepto({
          // isRaiz: n === 2 ? true : false,
          // isCapitulo: n === 1 ? true : false,
          // isPartida: d[6] == 0 && !n ? true : false,
          // isDescompuestoPartida: d[6] != 0 && !n ? true : false,
          type: n === 2 ? 'raiz' : n === 1 ? 'capitulo' : d[6] == 0 && !n ? 'partida' : 'descompuestopartida',
          codigo: d[1].replace('#', ''),
          unidad: d[2],
          resumen: d[3],
          precio: d[4],
          fecha: d[5],
          tipo: d[6]
        })
        this.#conceptos.push(concepto)
      })
      resolve()
    })
  }


  async #getDescomposiciones() {
    return new Promise((resolve, reject) => {
      const descomposiciones = this.#data.filter((x) => x.startsWith('~D'))
      descomposiciones.forEach((item) => {
        const d = item.split('|')
        const e = d[2].split(`\\`)
        const padre = this.#conceptos.find(
          (x) => x._codigo === d[1].replace('#', '')
        )
        if (padre === undefined) {
          console.log('no se encuentra el concepto')
        } else {
          let hijos = []
          for (let i = 0; i < e.length; i = i + 3) {
            const hijo = e[i]
            if (hijo !== undefined && hijo !== '') {
              const factor = e[i + 1]
              const rendimiento = e[i + 2]
              let descHijo = new DescomposicionHijo({
                type: padre._type == 'raiz' ? 'capitulo' : padre._type == 'capitulo' ? 'partida' : padre._type == 'partida' && 'descompuestopartida',
                hijo: hijo,
                factor: factor,
                rendimiento: rendimiento
              })
              hijos.push(descHijo)
              // this._descomposiciones.push(desc)
              // padre._descomposiciones.push(desc)
            }
          }

          let desc = new Descomposicion(padre._codigo, hijos)
          this.#descomposiciones.push(desc)
          padre._descomposiciones.push(desc)
        }
      })
      resolve()
    })
  }


  async #getTexto() {
    return new Promise((resolve, reject) => {
      const textos = this.#data.filter((x) => x.startsWith('~T'))
      textos.forEach((texto) => {
        const d = texto.split('|')
        const concepto = this.#conceptos.find(
          (x) => x._codigo === d[1].replace('#', '')
        )
        if (concepto === undefined) {
          console.log('no se encuentra el concepto')
        } else {
          concepto._texto = d[2]
        }
      })
      resolve()
    })
  }

  async #getMediciones() {
    return new Promise((resolve, reject) => {
      const mediciones = this.#data.filter((x) => x.startsWith('~M'))
      mediciones.forEach((item) => {
        const d = item.split('|')
        console.log('VEAMOS EL ITEM: ', item)
        const rel = d[1].split('\\')
        const padre = rel[0].replace('#', '')
        const codigoHijo = rel[1]
        const hijo = this.#descomposiciones.find((x) => x._codigoPadre === padre && x._hijos.flat().find(h => h._codigoHijo === codigoHijo));
        console.log('descomposiciones', {
          hijo: hijo,
          codigoHijo: codigoHijo,
          padre: padre
        })

        const posicion = d[2].split('\\')[0]
        const cantidadTotal = d[3]
        const lineas = d[4]
        const a = lineas.split('\\')
        let lista = []
        for (let i = 0; i < a.length - 1; i = i + 6) {
          const cm = new ComentarioMedicion({
            tipo: a[i],
            comentario: a[i + 1],
            unidades: a[i + 2],
            longitud: a[i + 3],
            latitud: a[i + 4],
            altura: a[i + 5],
          }
          )
          lista.push(cm)
        }
        let medicion = new Medicion({
          hijo: codigoHijo,
          padre: padre,
          posicion: posicion,
          cantidadTotal: cantidadTotal,
          lista: lista
          // aqui faltaria etiqueta (preguntar si la ponemos)
        })
        this.#mediciones.push(medicion)
        hijo._hijos.find(h => h._codigoHijo === codigoHijo)._mediciones.push(medicion)
        // hijo._mediciones.push(medicion)
      })

      resolve()
    })
  }


  async readFile() {
    await this.#createFile()
    return new Promise((resolve, reject) => {
      fs.readFile(this.path, 'ascii', (err, data) => {
        if (err) {
          console.log(err)
          reject()
        }


        // TODO: lo primero que hay que hace es comprobar si es una archivo bc3 valido
        // para ello comprobamos que la primera linea empieza por ~V y que su extension es bc3
        if (!this.path.endsWith('.bc3')) {
          console.log('El archivo no es un archivo bc3')
          reject()
        }

        const newData = data.slice(2, -2)
        const newDataModified = newData.replace(/\\\\/g, '\\');
        this.#data = newDataModified.split(/\\r?\\n/)
        // ahora ejecutamos las funciones que leen cada seccion del archivo bc3
        this.#getPropiedad()
        this.#getCoeficiente()
        this.#getConceptos()
        this.#getDescomposiciones()
        this.#getTexto()
        this.#getMediciones()

        // ahora tenemos que construir un JSON con toda la informacion (meter todo en un JSON)
        const JSONData = {
          propiedad: this.#propiedad,
          coeficiente: this.#coeficiente,
          conceptos: this.#conceptos,
          descomposiciones: this.#descomposiciones,
          mediciones: this.#mediciones
        }

        // ahora borramos el archivo bc3
        fs.unlink(this.path, (err) => {
          if (err) {
            console.log('Error al borrar el archvi bc3 del server: ', err)
            reject()
          }
        })

        resolve(JSONData)
      })
      // resolve()
    })
  }
}



module.exports = { Bc3Reader }