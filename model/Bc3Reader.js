const fs = require('fs')
const { Propiedad } = require('./Propiedad')
const { Concepto } = require('./Concepto')
const { Descomposicion } = require('./Descomposicion')
const { Medicion } = require('./Medicion')
const { ComentarioMedicion } = require('./ComentarioMedicion')
const { Coeficiente } = require('./Coeficiente')
const { DescomposicionHijo } = require('./DescomposicionHijo')

class Bc3Reader {
  constructor(path) {
    this._propiedad = null
    this._coeficiente = null
    this._conceptos = []
    this._descomposiciones = []
    this._mediciones = []
    this._path = path
  }

  async propiedad() {
    return new Promise((resolve, reject) => {
      const item = this._data.find((x) => x.startsWith('~V'))
      const d = item.split('|')
      const propiedad = new Propiedad(d[1], d[2], d[3], d[4], d[5], d[6], d[7], d[8], d[9], d[10])
      this._propiedad = propiedad
      resolve()
    })
  }


  async coeficiente() {
    return new Promise((resolve, reject) => {
      const item = this._data.find((x) => x.startsWith('~K'))
      const d = item.split('|')
      const p1 = d[1].split('\\')
      const p2 = d[2].split('\\')
      const p3 = d[3].split('\\')
      const n = d[4]

      const coeficiente = new Coeficiente(p1, p2, p3, n)
      this._coeficiente = coeficiente
      resolve()
    })
  }


  async conceptos() {
    return new Promise((resolve, reject) => {
      const conceptos = this._data.filter((x) => x.startsWith('~C'))
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
        this._conceptos.push(concepto)
      })
      resolve()
    })
  }


  async descomposiciones() {
    return new Promise((resolve, reject) => {
      const descomposiciones = this._data.filter((x) => x.startsWith('~D'))
      descomposiciones.forEach((item) => {
        const d = item.split('|')
        const e = d[2].split(`\\`)
        const padre = this._conceptos.find(
          (x) => x._codigo === d[1].replace('#', '')
        )
        if (padre === undefined) {
          console.log('no se encuentra el concepto')
        } else {
          // console.log('VEAMOS EL PADRE: ', padre)
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
          this._descomposiciones.push(desc)
          padre._descomposiciones.push(desc)
        }
      })
      resolve()
    })
  }


  async texto() {
    return new Promise((resolve, reject) => {
      const textos = this._data.filter((x) => x.startsWith('~T'))
      textos.forEach((texto) => {
        const d = texto.split('|')
        const concepto = this._conceptos.find(
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

  async mediciones() {
    return new Promise((resolve, reject) => {
      const mediciones = this._data.filter((x) => x.startsWith('~M'))
      mediciones.forEach((item) => {
        const d = item.split('|')
        const rel = d[1].split('\\')
        const padre = rel[0].replace('#', '')
        const codigoHijo = rel[1]
        const hijo = this._descomposiciones.find((x) => x._codigoPadre === padre && x._hijos.find(h => h._codigoHijo === codigoHijo));
        // console.log('VEAMOS EL ITEM: ', item)
        // console.log('VEAMOS EL HIJO: ', hijo)
        const posicion = d[2].split('\\')[0]
        const cantidadTotal = d[3]
        const lineas = d[4]
        const a = lineas.split('\\')
        let lista = []
        // console.log('VEAMOS LA LONGITUD DE LOS COMENTARIOS: ', a.length)
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
        // console.log('VEAMOS LA LISTA DE COMENTARIO MEDICION: ', lista)
        let medicion = new Medicion({
          hijo: codigoHijo,
          padre: padre,
          posicion: posicion,
          cantidadTotal: cantidadTotal,
          lista: lista
          // aqui faltaria etiqueta (preguntar si la ponemos)
        })
        this._mediciones.push(medicion)
        hijo._hijos.find(h => h._codigoHijo === codigoHijo)._mediciones.push(medicion)
        // hijo._mediciones.push(medicion)
      })

      resolve()
    })
  }


  async readFile() {
    return new Promise((resolve, reject) => {
      fs.readFile(this._path, 'ascii', (err, data) => {
        if (err) {
          console.log(err)
          reject()
        }
        this._data = data.split(/\r?\n/)
        // ahora ejecutamos las funciones que leen cada seccion del archivo bc3
        this.propiedad()
        this.coeficiente()
        this.conceptos()
        this.descomposiciones()
        this.texto()
        this.mediciones()

        // ahora tenemos que construir un JSON con toda la informacion (meter todo en un JSON)
        const JSONData = {
          propiedad: this._propiedad,
          coeficiente: this._coeficiente,
          conceptos: this._conceptos,
          descomposiciones: this._descomposiciones,
          mediciones: this._mediciones
        }

        resolve(JSONData)
      })
    })
  }
}



module.exports = { Bc3Reader }
