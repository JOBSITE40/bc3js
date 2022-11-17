const { getDate } = require('./Utils')
const { Descomposicion } = require('./Descomposicion')

class Concepto {
    constructor(codigo, isRaiz, isCapitulo, unidad, resumen, precio) {
        this._codigo = codigo
        this._isRaiz = isRaiz
        this._isCapitulo = isCapitulo
        this._unidad = unidad
        this._resumen = resumen
        this._precio = precio
        this._fecha = getDate()
        this._descomposiciones = []
    }

    addDescomposicion(codigoHijo) {
        var descomposicion = new Descomposicion(codigoHijo)
        this._descomposiciones.push(descomposicion)
    }

    writeDescomposiciones() {
        let list = `~D|${this._codigo}|`
        this._descomposiciones.forEach(desc => {
            const text = this._writeDescomposicion(desc)
            list += text
        })
        list += '|'
        return list
    }

    _writeDescomposicion(d) {
        let text = `${d._codigoHijo}\\${d._factor}\\${d._rendimiento}\\`
        return text
    }
}

module.exports = { Concepto }
