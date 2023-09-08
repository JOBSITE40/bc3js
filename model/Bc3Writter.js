class Bc3Writter {
  constructor() {
    this._blob = null
  }

  async createFile() {
    const init = 'Hello World'
    this._blob = new Blob([init], { type: 'text/plain' })
  }
}

module.exports = { Bc3Writter }
