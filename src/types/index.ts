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
  categoria?: string | null
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
  foto_fundo: string
  slogan: string
  fundo_estilo: string
}

export type TipoPreco = "por_hora" | "fixo";

export interface AgentConfig {
  id: string
  profissional_id: string
  enabled: boolean
  system_prompt: string
  model: string
  temperature: number
  max_tokens: number
  tools_enabled: string[]
  connectors: Record<string, boolean>
  webhook_url: string
  created_at: string
  updated_at: string
}

export interface KnowledgeDoc {
  id: string
  profissional_id: string
  filename: string
  type: string
  content: string
  chunk_count: number
  file_url: string
  token_count: number
  created_at: string
}

export interface AgentConversation {
  id: string
  profissional_id: string
  channel: string
  customer_name: string
  customer_phone: string
  customer_id: string
  status: string
  message_count: number
  created_at: string
  updated_at: string
}

export interface AgentMessage {
  id: string
  conversation_id: string
  profissional_id: string
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string
  tool_calls: any
  tool_results: any
  tokens_input: number
  tokens_output: number
  model: string
  created_at: string
}

export interface AgentUsage {
  id: string
  profissional_id: string
  date: string
  tokens_input: number
  tokens_output: number
  messages: number
  conversations: number
  cost: number
}

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
  Nav: React.ComponentType<{ config: ProfissionalConfig }>
  Hero: React.ComponentType<{ config: ProfissionalConfig }>
  Confianca: React.ComponentType<{ config: ProfissionalConfig }>
  Servicos: React.ComponentType<{ config: ProfissionalConfig }>
  Depoimentos: React.ComponentType<{ config: ProfissionalConfig }>
  CtaFinal: React.ComponentType<{ config: ProfissionalConfig }>
  Footer: React.ComponentType<{ config: ProfissionalConfig }>
  WhatsAppFloat: React.ComponentType<{ config: ProfissionalConfig }>
}

export interface ProfissionalConfig {
  profissional: Profissional
  configuracao: ConfiguracaoVisual
  servicos: Servico[]
  adicionais: Adicional[]
  frequencias: Frequencia[]
}

export interface GoogleCalendarToken {
  profissional_id: string
  access_token: string
  refresh_token: string
  scope: string
  token_type: string
  expires_at: string
  calendar_id: string
  calendar_email: string
}

export interface GoogleCalendarEvent {
  id: string
  profissional_id: string
  agendamento_id: string | null
  google_event_id: string
  calendar_id: string
  event_data: any
}

export interface WhatsAppInstance {
  id: string
  profissional_id: string
  instance_name: string
  instance_token: string
  evolution_api_url: string
  evolution_api_key: string
  connection_status: string
  qr_code: string
  phone_number: string
}

export interface WhatsAppMessage {
  id: string
  profissional_id: string
  conversation_id: string | null
  remote_jid: string
  message_id: string
  from_me: boolean
  type: string
  content: string
  timestamp: number
}

export interface MetaConnection {
  id: string
  profissional_id: string
  page_id: string
  page_name: string
  page_access_token: string
  instagram_id: string
  instagram_name: string
}

export interface MetaMessage {
  id: string
  profissional_id: string
  platform: "messenger" | "instagram"
  sender_id: string
  recipient_id: string
  message_id: string
  content: string
  type: string
  timestamp: number
}

export interface CustomDomain {
  id: string
  profissional_id: string
  domain: string
  cloudflare_hostname_id: string
  ssl_status: string
  ssl_validation_records: any[]
  verified: boolean
}
