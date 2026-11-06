function historico(usuario, tarefas, dataHoje) {
  const concluidas = tarefas.filter((t) => t.status === 'Concluída');
  const noPrazo = concluidas.filter((t) => !t.prazo || t.concluida_em.slice(0, 10) <= t.prazo);
  const atrasadas = tarefas.filter((t) => t.status !== 'Concluída' && t.prazo && t.prazo < dataHoje);

  return {
    usuario,
    resumo: {
      total: tarefas.length,
      pendentes: tarefas.filter((t) => t.status === 'Pendente').length,
      em_andamento: tarefas.filter((t) => t.status === 'Em Andamento').length,
      concluidas: concluidas.length,
      concluidas_no_prazo: noPrazo.length,
      concluidas_com_atraso: concluidas.length - noPrazo.length,
      atrasadas_agora: atrasadas.length,
      taxa_no_prazo: concluidas.length ? Math.round((noPrazo.length / concluidas.length) * 100) : null,
      bloqueado: atrasadas.length > 0,
    },
    tarefas,
  };
}

export { historico };
