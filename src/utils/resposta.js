function lista(itens) {
  return { data: itens, meta: { total: itens.length } };
}

function erro(tipo, mensagem) {
  return { type: tipo, message: mensagem };
}

export { lista, erro };
