export interface Profissional {
  id: string
  slug: string
  nome: string
  primeiro_nome: string
  slogan: string
  cidade: string
  whatsapp: string
  email: string
  pix_chave: string
  pix_nome: string
  pix_cidade: string
  template_id: number
  link_avaliacao: string
  status: 'ativo' | 'suspenso' | 'inativo'
  created_at: string
}

export interface ConfiguracaoVisual {
  profissional_id: string
  template_id: number
  cor_primaria: string
  cor_secundaria: string
  fonte_titulo: string
  fonte_corpo: string
  logo_url: string
  slogan: string
}

export type TipoPreco = "por_hora" | "fixo";

export interface Servico {
  id: string
  profissional_id: string
  nome: string
  descricao: string
  descricao_curta: string
  horas_base: number
  valor_hora: number
  multiplicador: number
  horas_extras: number
  horas_minimas: number
  ativo: boolean
  ordem: number
  tipo_preco: TipoPreco
  preco_fixo: number
  duracao_minutos: number
}

export interface Adicional {
  id: string
  profissional_id: string
  servico_id: string
  nome: string
  descricao: string
  preco: number
  horas: number
  ativo: boolean
}

export interface Frequencia {
  id: string
  profissional_id: string
  nome: string
  slug: string
  desconto: number
  ordem: number
}

export interface Cliente {
  id: string
  profissional_id: string
  nome: string
  whatsapp: string
  endereco: string
  cep: string
  bairro: string
  cidade: string
  lat: number
  lng: number
  created_at: string
}

export interface Agendamento {
  id: string
  profissional_id: string
  cliente_id: string
  servico_id: string
  cliente_nome: string
  cliente_whatsapp: string
  cliente_endereco: string
  cliente_lat: number
  cliente_lng: number
  data: string
  hora: string
  data2: string | null
  horas: number
  valor: number
  status: 'solicitado' | 'confirmado' | 'concluido' | 'cancelado'
  execucao: string | null
  recorrencia: string | null
  created_at: string
}

export interface Pagamento {
  id: string
  profissional_id: string
  agendamento_id: string
  valor: number
  metodo: string
  status: 'pendente' | 'pago'
  pago_em: string | null
  txid: string | null
}

export interface TemplateVisual {
  id: number
  nome: string
  slug: string
  colors: {
    primary: string
    secondary: string
    bg: string
    paper: string
    ink: string
    ink_soft: string
    line: string
  }
  fonts: {
    heading: string
    body: string
  }
  Hero: React.ComponentType<{ config: ProfissionalConfig }>
  Servicos: React.ComponentType<{ config: ProfissionalConfig }>
  CtaButton: React.ComponentType<{ config: ProfissionalConfig }>
}

export interface ProfissionalConfig {
  profissional: Profissional
  configuracao: ConfiguracaoVisual
  servicos: Servico[]
  adicionais: Adicional[]
  frequencias: Frequencia[]
}
