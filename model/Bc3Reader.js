const fs = require('fs')
const { Concepto } = require('./Concepto')

class Bc3Reader {
  constructor(path) {
    this._propiedad = null
    this._conceptos = []
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
      this._data = data
      resolve()
    })
  })
}

Bc3Reader.prototype.conceptos = function () {
  const lines = this._data.split(/\r?\n/)
  const conceptos = lines.filter((x) => x.startsWith('~C'))
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
}

module.exports = { Bc3Reader }
