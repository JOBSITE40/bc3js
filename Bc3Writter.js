class Bc3Writter {
  #propiedad = null;
  #coeficiente = null;
  #conceptos = [];
  #descomposiciones = [];
  #mediciones = [];
  #bc3 = "";

  constructor(parameters) {
    this.#propiedad = parameters.propiedad;
    this.#coeficiente = parameters.coeficiente;
    this.#conceptos = parameters.conceptos;
    this.#descomposiciones = parameters.descomposiciones;
    this.#mediciones = parameters.mediciones;
  }

  async #writePropiedad() {
    return new Promise((resolve, reject) => {
      try {
        const { _propiedadArchivo, _versionFormato_fecha, _programaEmision, _cabecera_rotuloIdentificacion, _juegoCaracteres, _comentario, _tipoInformacion, _numeroCertificacion, _fechaCertificacion, _urlBase } = this.#propiedad;
        const propiedad = `~V|${_propiedadArchivo}|${_versionFormato_fecha}|${_programaEmision}|${_cabecera_rotuloIdentificacion}|${_juegoCaracteres}|${_comentario}|${_tipoInformacion}|${_numeroCertificacion}|${_fechaCertificacion}|${_urlBase}|\n`;
        this.#bc3 = this.#bc3.concat(propiedad);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  async #writeCoeficiente() {
    return new Promise((resolve, reject) => {
      try {
        const { _precios1, _precios2, _precios3 } = this.#coeficiente;
        // IMPORTANTE: De momento, la "n" no la vamos a tener en cuenta (en los BC3 no aparece).
        const coeficiente = `~K|${_precios1.join('\\')}|${_precios2.join('\\')}|${_precios3.join('\\')}|\n`;
        this.#bc3 = this.#bc3.concat(coeficiente);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  async #writeConceptos() {
    return new Promise((resolve, reject) => {
      try {
        this.#conceptos.forEach((concepto) => {
          const { _codigo, _unidad, _fecha, _precio, _resumen, _tipo } = concepto;
          const conceptoString = `~C|${_codigo}|${_unidad}|${_resumen}|${_precio}|${_fecha}|${_tipo}|\n`;
          this.#bc3 = this.#bc3.concat(conceptoString);
        });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  async #writeTextos() {
    return new Promise((resolve, reject) => {
      try {
        this.#conceptos.forEach((concepto) => {
          const { _codigo, _texto } = concepto;
          if (!_texto || _texto === "") return;
          const texto = `~T|${_codigo}|${_texto}|\n`;
          this.#bc3 = this.#bc3.concat(texto);
        });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  async #writeDescomposiciones() {
    return new Promise((resolve, reject) => {
      try {
        this.#descomposiciones.forEach((descomposicion) => {
          const { _codigoPadre, _hijos } = descomposicion;
          const hijosString = _hijos.map((hijo) => {
            const { _codigoHijo, _factor, _rendimiento } = hijo;
            return `${_codigoHijo}\\${_factor}\\${_rendimiento}`;
          });
          const descomposicionString = `~D|${_codigoPadre}|${hijosString.join('\\')}\\|\n`;
          this.#bc3 = this.#bc3.concat(descomposicionString);
        });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  async #writeMediciones() {
    return new Promise((resolve, reject) => {
      try {
        this.#mediciones.forEach((medicion) => {
          const { _codigoPadre, _codigoHijo, _posicion, _medicionTotal, _comentarios, _etiqueta } = medicion;
          const comentariosString = _comentarios.map((comentario) => {
            const { _tipo, _comentario, _unidades, _longitud, _latitud, _altura } = comentario;
            return `${_tipo}\\${_comentario}\\${_unidades}\\${_longitud}\\${_latitud}\\${_altura}`;
          });
          const medicionString = `~M|${_codigoPadre}\\${_codigoHijo}|${_posicion.join('\\')}\\|${_medicionTotal}|${comentariosString.join('\\')}\\|\n`;
          this.#bc3 = this.#bc3.concat(medicionString);
        });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  async createFile() {
    return new Promise(async (resolve, reject) => {
      try {
        await this.#writePropiedad();
        await this.#writeCoeficiente();
        await this.#writeConceptos();
        await this.#writeTextos();
        await this.#writeDescomposiciones();
        await this.#writeMediciones();
        resolve(this.#bc3);
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = Bc3Writter;
