interface MensagemErroProps {
  mensagem: string;
}

export function MensagemErro({ mensagem }: MensagemErroProps) {
  return <p className="feedback feedback--erro">{mensagem}</p>;
}
