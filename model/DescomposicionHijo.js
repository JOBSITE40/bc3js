class DescomposicionHijo {
    constructor(parameters) {
        // Enumeración de tipos válidos en minúsculas
        const ValidTypes = {
            capitulo: 'capitulo',
            partida: 'partida',
            descompuestopartida: 'descompuestopartida'
        };

        const typeLower = parameters.type.toLowerCase(); // Convertir a minúsculas

        if (!ValidTypes[typeLower]) {
            throw new Error(`El tipo '${parameters.type}' no es válido.`);
        }

        this._type = typeLower; // Almacenar en minúsculas
        this._codigoHijo = parameters.hijo;
        this._factor = parameters.factor;
        this._rendimiento = parameters.rendimiento;
        this._mediciones = [];
    }
}

module.exports = { DescomposicionHijo };

