const { Descomposicion } = require('./Descomposicion');

class Concepto {
    constructor(parameters) {
        // Enumeración de tipos válidos en minúsculas
        const ValidTypes = {
            raiz: 'raiz',
            capitulo: 'capitulo',
            partida: 'partida',
            descompuestopartida: 'descompuestopartida'
        };

        const typeLower = parameters.type.toLowerCase(); // Convertir a minúsculas

        if (!ValidTypes[typeLower]) {
            throw new Error(`El tipo '${parameters.type}' no es válido.`);
        }

        this._type = typeLower; // Almacenar en minúsculas
        this._codigo = parameters.codigo;
        this._unidad = parameters.unidad;
        this._resumen = parameters.resumen;
        this._precio = parameters.precio;
        this._fecha = parameters.fecha;
        this._tipo = parameters.tipo;
        this._texto = null;
        this._descomposicion = null;
    }

    // ... (métodos restantes)

    // addDescomposicion(codigoHijo) {
    //     var descomposicion = new Descomposicion(codigoHijo);
    //     this._descomposiciones.push(descomposicion);
    // }

    // ... (métodos restantes)
}

module.exports = { Concepto };

