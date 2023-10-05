const { Propiedad } = require('./model/Propiedad');
const { Concepto } = require('./model/Concepto');
const { Descomposicion } = require('./model/Descomposicion');
const { Medicion } = require('./model/Medicion');
const { ComentarioMedicion } = require('./model/ComentarioMedicion');
const { Coeficiente } = require('./model/Coeficiente');
const { DescomposicionHijo } = require('./model/DescomposicionHijo');

class Bc3Reader {
  #propiedad = null;
  #coeficiente = null;
  #conceptos = [];
  #descomposiciones = [];
  #mediciones = [];
  #data = null;
  #file = null;

  constructor(file) {
    this.#file = JSON.stringify(file).slice(2, -2).replace(/\\\\/g, '\\');
  }

  async readBc3() {
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.#file) {
          reject('No file provided');
          return;
        } else if (!this.#file.startsWith('~V')) {
          reject('El archivo no es un archivo bc3');
          return;
        }

        this.#data = this.#file.split(/\\r?\\n|\\n/);
        await this.#getPropiedad();
        await this.#getCoeficiente();
        await this.#getConceptos();
        await this.#getDescomposiciones();
        await this.#getTexto();
        await this.#getMediciones();

        const JSONData = {
          propiedad: this.#propiedad,
          coeficiente: this.#coeficiente,
          conceptos: this.#conceptos,
          descomposiciones: this.#descomposiciones,
          mediciones: this.#mediciones,
        };

        resolve(JSONData);
      } catch (error) {
        reject(`Error al leer el archivo bc3: ${error}`);
      }
    });
  }

  async #getPropiedad() {
    return new Promise(async (resolve, reject) => {
      try {
        const item = this.#data.find((x) => x.startsWith('~V'));
        const d = item.split('|');
        const propiedad = new Propiedad(
          d[1],
          d[2],
          d[3],
          d[4],
          d[5],
          d[6],
          d[7],
          d[8],
          d[9],
          d[10]
        );
        this.#propiedad = propiedad;
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  async #getCoeficiente() {
    return new Promise(async (resolve, reject) => {
      try {
        const item = this.#data.find((x) => x.startsWith('~K'));
        const d = item.split('|');
        const p1 = d[1].split('\\');
        const p2 = d[2].split('\\');
        const p3 = d[3].split('\\');
        const n = d[4];

        const coeficiente = new Coeficiente(p1, p2, p3, n);
        this.#coeficiente = coeficiente;
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  async #getConceptos() {
    return new Promise(async (resolve, reject) => {
      try {
        const conceptos = this.#data.filter((x) => x.startsWith('~C'));
        conceptos.forEach((item) => {
          const d = item.split('|');
          const n = (d[1].match(new RegExp('#', 'g')) || []).length;
          const concepto = new Concepto({
            type:
              n === 2
                ? 'raiz'
                : n === 1
                  ? 'capitulo'
                  : d[6] == 0 && !n
                    ? 'partida'
                    : 'descompuestopartida',
            codigo: d[1],
            unidad: d[2],
            resumen: d[3],
            precio: d[4],
            fecha: d[5],
            tipo: d[6],
          });
          this.#conceptos.push(concepto);
        });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  async #getDescomposiciones() {
    return new Promise(async (resolve, reject) => {
      try {
        const descomposiciones = this.#data.filter((x) => x.startsWith('~D'));
        descomposiciones.forEach((item) => {
          const d = item.split('|');
          const e = d[2].split('\\');
          const padre = this.#conceptos.find((x) => x._codigo === d[1]);
          if (padre === undefined) {
            console.log('No se encuentra el concepto');
          } else {
            let hijos = [];
            for (let i = 0; i < e.length; i = i + 3) {
              const hijo = e[i];
              const codigoHijo = this.#conceptos.find(
                (x) => x._codigo.replace('#', '') === hijo
              );
              if (hijo !== undefined && hijo !== '') {
                const factor = e[i + 1];
                const rendimiento = e[i + 2];
                let descHijo = new DescomposicionHijo({
                  type:
                    padre._type === 'raiz'
                      ? 'capitulo'
                      : padre._type === 'capitulo' &&
                        codigoHijo._codigo.includes('#')
                        ? 'capitulo'
                        : padre._type === 'capitulo'
                          ? 'partida'
                          : padre._type === 'partida'
                            ? 'descompuestopartida'
                            : undefined,
                  hijo: hijo,
                  factor: factor,
                  rendimiento: rendimiento,
                });
                hijos.push(descHijo);
              }
            }

            let desc = new Descomposicion(padre._codigo, hijos);
            this.#descomposiciones.push(desc);
            padre._descomposicion = desc;
          }
        });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  async #getTexto() {
    return new Promise(async (resolve, reject) => {
      try {
        const textos = this.#data.filter((x) => x.startsWith('~T'));
        textos.forEach((texto) => {
          const d = texto.split('|');
          const concepto = this.#conceptos.find((x) => x._codigo === d[1]);
          if (concepto === undefined) {
            console.log('No se encuentra el concepto');
          } else {
            concepto._texto = d[2];
          }
        });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  async #getMediciones() {
    return new Promise(async (resolve, reject) => {
      try {
        const mediciones = this.#data.filter((x) => x.startsWith('~M'));
        mediciones.forEach((item) => {
          const d = item.split('|');
          const rel = d[1].split('\\');
          const padre = rel[0];
          const codigoHijo = rel[1];
          const hijo = this.#descomposiciones.find((x) =>
            x._codigoPadre.replace('#', '') === padre &&
            x._hijos.flat().find((h) => h._codigoHijo === codigoHijo)
          );

          const posicion = d[2].split('\\').slice(0, -1);
          const cantidadTotal = d[3];
          const lineas = d[4];
          const a = lineas.split('\\');
          let lista = [];
          for (let i = 0; i < a.length - 1; i = i + 6) {
            const cm = new ComentarioMedicion({
              tipo: a[i],
              comentario: a[i + 1],
              unidades: a[i + 2],
              longitud: a[i + 3],
              latitud: a[i + 4],
              altura: a[i + 5],
            });
            lista.push(cm);
          }
          let medicion = new Medicion({
            hijo: codigoHijo,
            padre: padre,
            posicion: posicion,
            cantidadTotal: cantidadTotal,
            lista: lista,
          });
          this.#mediciones.push(medicion);
          hijo._hijos
            .find((h) => h._codigoHijo === codigoHijo)
            ._mediciones.push(medicion);
        });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = Bc3Reader;
