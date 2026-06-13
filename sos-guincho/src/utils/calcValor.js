const valoresServico = {
  'Pane mecânica': 180,
  'Acidente': 260,
  'Bateria': 110,
  'Pneu': 120,
  'Transporte': 220,
  'Outro': 160
};

const acrescimosProblema = {
  'Pane mecânica': 30,
  'Acidente': 80,
  'Bateria': 20,
  'Pneu': 20,
  'Sem combustível': 35,
  'Chave trancada': 40,
  'Outro': 25
};

function calcularValorEstimado(tipoServico, tipoProblema) {
  const base = valoresServico[tipoServico] || valoresServico.Outro;
  const acrescimo = acrescimosProblema[tipoProblema] || 0;
  return Number((base + acrescimo).toFixed(2));
}

module.exports = { calcularValorEstimado, valoresServico, acrescimosProblema };
