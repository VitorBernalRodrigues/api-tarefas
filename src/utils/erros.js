class ErroHttp extends Error {
  constructor(status, tipo, mensagem) {
    super(mensagem);
    this.status = status;
    this.tipo = tipo;
  }
}

const naoEncontrado = (o_que) => new ErroHttp(404, 'not_found', `${o_que} não encontrado(a).`);
const invalido = (mensagem) => new ErroHttp(400, 'validation_error', mensagem);
const conflito = (mensagem) => new ErroHttp(409, 'conflict', mensagem);
const regraViolada = (mensagem) => new ErroHttp(422, 'business_rule', mensagem);

export { ErroHttp, naoEncontrado, invalido, conflito, regraViolada };
