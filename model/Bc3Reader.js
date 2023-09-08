const fs = require('fs')
const { Propiedad } = require('./Propiedad')
const { Concepto } = require('./Concepto')
const { Descomposicion } = require('./Descomposicion')
const { Medicion } = require('./Medicion')
const { ComentarioMedicion } = require('./ComentarioMedicion')

class Bc3Reader {
  constructor(path) {
    this._propiedad = null
    this._conceptos = []
    this._mediciones = []
    this._path = path
  }
}

Bc3Reader.prototype.readFile = async function () {
  return new Promise((resolve, reject) => {
    fs.readFile(this._path, 'ascii', (err, data) => {
      if (err) {
        console.log(err)
        reject()
      }
      this._data = data.split(/\r?\n/)
      resolve()
    })
  })
}

Bc3Reader.prototype.propiedad = async function () {
  return new Promise((resolve, reject) => {
    const item = this._data.find((x) => x.startsWith('~V'))
    const d = item.split('|')
    const propiedad = new Propiedad(d[1], d[2], new Date(), d[3])
    this._propiedad = propiedad
    resolve()
  })
}

Bc3Reader.prototype.conceptos = async function () {
  return new Promise((resolve, reject) => {
    const conceptos = this._data.filter((x) => x.startsWith('~C'))
    conceptos.forEach((item) => {
      const d = item.split('|')
      const n = (d[1].match(new RegExp('#', 'g')) || []).length
      const concepto = new Concepto(
        d[1].replace('#', ''),
        n === 2 ? true : false,
        n === 1 ? true : false,
        d[2],
        d[3],
        d[4]
      )
      this._conceptos.push(concepto)
    })
    resolve()
  })
}

Bc3Reader.prototype.descomposiciones = async function () {
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
        for (let i = 0; i < e.length; i = i + 3) {
          const hijo = e[i]
          if (hijo !== undefined && hijo !== '') {
            const factor = e[i + 1]
            const rendimiento = e[i + 2]
            var desc = new Descomposicion(hijo, factor, rendimiento)
            padre._descomposiciones.push(desc)
          }
        }
      }
    })
    resolve()
  })
}

Bc3Reader.prototype.mediciones = async function () {
  return new Promise((resolve, reject) => {
    const mediciones = this._data.filter((x) => x.startsWith('~M'))
    mediciones.forEach((item) => {
      const d = item.split('|')
      const rel = d[1].split('\\')
      const padre = rel[0].replace('#', '')
      const hijo = rel[1]
      const posicion = d[2].split('\\')[0]
      const cantidadTotal = d[3]
      const lineas = d[4]
      const a = lineas.split('\\')
      let lista = []
      for (let i = 0; i < a.length - 1; i = i + 6) {
        const cm = new ComentarioMedicion(
          a[i + 1],
          a[i + 2],
          a[i + 3],
          a[i + 4],
          a[i + 5]
        )
        lista.push(cm)
      }
      this._mediciones.push(
        new Medicion(padre, hijo, posicion, cantidadTotal, lista)
      )
    })

    resolve()
  })
}

Bc3Reader.prototype.mediciones

module.exports = { Bc3Reader }
