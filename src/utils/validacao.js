const { invalido } = require('./erros');

function textoObrigatorio(valor, campo) {
  if (typeof valor !== 'string' || valor.trim() === '') {
    throw invalido(`O campo "${campo}" é obrigatório.`);
  }
  return valor.trim();
}

function textoOpcional(valor, campo) {
  if (valor === undefined || valor === null) return null;
  if (typeof valor !== 'string') throw invalido(`O campo "${campo}" deve ser texto.`);
  return valor.trim();
}

function idOpcional(valor, campo) {
  if (valor === undefined || valor === null) return null;
  const numero = Number(valor);
  if (!Number.isInteger(numero) || numero <= 0) {
    throw invalido(`O campo "${campo}" deve ser um id válido.`);
  }
  return numero;
}

function dataOpcional(valor, campo) {
  if (valor === undefined || valor === null) return null;
  const formatoOk = typeof valor === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(valor);
  if (!formatoOk || new Date(valor + 'T00:00:00').toISOString().slice(0, 10) !== valor) {
    throw invalido(`O campo "${campo}" deve ser uma data no formato AAAA-MM-DD.`);
  }
  return valor;
}

function idDaRota(req) {
  return idOpcional(req.params.id, 'id');
}

module.exports = { textoObrigatorio, textoOpcional, idOpcional, dataOpcional, idDaRota };
