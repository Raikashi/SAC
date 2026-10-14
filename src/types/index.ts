export type UserRole = 'admin' | 'gestor' | 'atendente' | 'qualidade';

export interface UserPermissions {
  canRegisterComplaints: boolean;
  canEditComplaints: boolean;
  canChangeStatus: boolean;
  canViewReports: boolean;
  canManageUsers: boolean;
  canManageProducts: boolean;
  canManageClientTypes: boolean;
  canDeleteRecords: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  status: 'ativo' | 'inativo';
  createdAt: string;
  customPermissions?: Partial<UserPermissions>;
}

export interface ClientType {
  id: string;
  name: string; // e.g. "Consumidor Final", "Lojista"
  description?: string;
  isDefault?: boolean;
  createdAt: string;
}

export interface ProductHistory {
  id: string;
  date: string;
  userId: string;
  userName: string;
  action: string;
  details?: string;
}

export interface Product {
  id: string;
  reference: string; // e.g. "REF-101"
  name: string; // Nome do produto
  category: string;
  description?: string;
  status: 'ativo' | 'inativo';
  createdAt: string;
  updatedAt?: string;
  history?: ProductHistory[];
}

export interface ComplaintItem {
  id: string;
  reference: string; // Referência
  productName: string; // Nome do produto
  quantity: number; // Quantidade
  defectDescription: string; // Descrição do defeito
  productId?: string; // id do produto se vinculado
}

export type ComplaintStatus =
  | 'aberto'
  | 'em_analise'
  | 'em_tratativa'
  | 'aguardando_laudo'
  | 'resolvido'
  | 'cancelado';

export type ComplaintPriority = 'baixa' | 'media' | 'alta' | 'urgente';

export interface ComplaintHistory {
  id: string;
  date: string;
  userId: string;
  userName: string;
  action: string;
  notes?: string;
  previousStatus?: ComplaintStatus;
  newStatus?: ComplaintStatus;
}

export interface ComplaintAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl?: string;
  uploadedAt: string;
}

export interface Complaint {
  id: string;
  sequentialCode: string; // e.g. "REC-2026-0001"
  sequentialNumber: number;
  clientName: string;
  clientDocument: string; // CPF ou CNPJ
  clientPhone: string;
  clientEmail: string;
  clientCityState?: string;
  clientTypeId: string; // Ref ao banco TIPOS DE CLIENTES
  clientTypeName: string;
  invoiceNumber?: string; // Nota Fiscal
  invoiceDate?: string;
  items: ComplaintItem[];
  status: ComplaintStatus;
  priority: ComplaintPriority;
  registeredByUserId: string;
  registeredByUserName: string;
  assignedToUserId?: string;
  assignedToUserName?: string;
  generalNotes?: string;
  resolutionNotes?: string;
  attachments?: ComplaintAttachment[];
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  history: ComplaintHistory[];
}

export const ROLE_DEFAULT_PERMISSIONS: Record<UserRole, UserPermissions> = {
  admin: {
    canRegisterComplaints: true,
    canEditComplaints: true,
    canChangeStatus: true,
    canViewReports: true,
    canManageUsers: true,
    canManageProducts: true,
    canManageClientTypes: true,
    canDeleteRecords: true,
  },
  gestor: {
    canRegisterComplaints: true,
    canEditComplaints: true,
    canChangeStatus: true,
    canViewReports: true,
    canManageUsers: false,
    canManageProducts: true,
    canManageClientTypes: true,
    canDeleteRecords: false,
  },
  atendente: {
    canRegisterComplaints: true,
    canEditComplaints: false,
    canChangeStatus: false,
    canViewReports: false,
    canManageUsers: false,
    canManageProducts: false,
    canManageClientTypes: false,
    canDeleteRecords: false,
  },
  qualidade: {
    canRegisterComplaints: true,
    canEditComplaints: true,
    canChangeStatus: true,
    canViewReports: true,
    canManageUsers: false,
    canManageProducts: false,
    canManageClientTypes: false,
    canDeleteRecords: false,
  },
};

export const STATUS_LABELS: Record<ComplaintStatus, { label: string; color: string; badge: string }> = {
  aberto: {
    label: 'Aberto',
    color: '#2563EB',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  em_analise: {
    label: 'Em Análise',
    color: '#D97706',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  em_tratativa: {
    label: 'Em Tratativa',
    color: '#0284C7',
    badge: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  aguardando_laudo: {
    label: 'Aguardando Laudo/Peça',
    color: '#6366F1',
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  resolvido: {
    label: 'Resolvido / Concluído',
    color: '#0D9488',
    badge: 'bg-teal-50 text-teal-800 border-teal-200',
  },
  cancelado: {
    label: 'Cancelado / Improcedente',
    color: '#64748B',
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
  },
};

export const ROLE_LABELS: Record<UserRole, { label: string; description: string }> = {
  admin: {
    label: 'Administrador',
    description: 'Acesso irrestrito a todos os cadastros, controle de usuários e relatórios.',
  },
  gestor: {
    label: 'Gestor SAC / Atendimento',
    description: 'Supervisão de chamados, tratativas, relatórios e gestão de catálogo.',
  },
  atendente: {
    label: 'Atendente SAC',
    description: 'Registro ágil de ocorrências e consulta de produtos e clientes.',
  },
  qualidade: {
    label: 'Analista de Qualidade / Técnico',
    description: 'Análise técnica de defeitos, mudança de status e emissão de laudos.',
  },
};
