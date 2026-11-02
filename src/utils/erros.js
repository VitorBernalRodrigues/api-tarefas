class ErroHttp extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

const naoEncontrado = (o_que) => new ErroHttp(404, `${o_que} não encontrado(a).`);
const invalido = (mensagem) => new ErroHttp(400, mensagem);
const regraViolada = (mensagem) => new ErroHttp(422, mensagem);

module.exports = { ErroHttp, naoEncontrado, invalido, regraViolada };
