import {
  User,
  UserRole,
  ClientType,
  Product,
  Complaint,
  ComplaintItem,
  ComplaintAttachment,
  UserPermissions,
  ROLE_DEFAULT_PERMISSIONS,
} from '../types';

const STORAGE_KEYS = {
  USERS: 'sac_gestor_users_v1',
  CURRENT_USER_ID: 'sac_gestor_current_user_id_v1',
  CLIENT_TYPES: 'sac_gestor_client_types_v1',
  PRODUCTS: 'sac_gestor_products_v1',
  COMPLAINTS: 'sac_gestor_complaints_v1',
  SEQUENTIAL_COUNTER: 'sac_gestor_seq_counter_v1',
};

// Seed Users
const INITIAL_USERS: User[] = [
  {
    id: 'user-admin-1',
    name: 'Silvio Silva',
    email: 'silvio.sls82@gmail.com',
    role: 'admin',
    department: 'Diretoria / TI',
    status: 'ativo',
    createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'user-gestor-1',
    name: 'Mariana Costa',
    email: 'mariana.costa@empresa.com.br',
    role: 'gestor',
    department: 'Gestão de Atendimento & SAC',
    status: 'ativo',
    createdAt: '2026-01-15T09:30:00Z',
  },
  {
    id: 'user-atendente-1',
    name: 'Carlos Eduardo Oliveira',
    email: 'carlos.sac@empresa.com.br',
    role: 'atendente',
    department: 'Central de Relacionamento',
    status: 'ativo',
    createdAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 'user-qualidade-1',
    name: 'Fernanda Lima',
    email: 'fernanda.qualidade@empresa.com.br',
    role: 'qualidade',
    department: 'Engenharia & Controle de Qualidade',
    status: 'ativo',
    createdAt: '2026-02-05T11:15:00Z',
  },
];

// Seed Client Types ("TIPOS DE CLIENTES")
const INITIAL_CLIENT_TYPES: ClientType[] = [
  {
    id: 'ct-consumidor',
    name: 'Consumidor Final',
    description: 'Pessoa física ou jurídica adquirente direta para uso próprio.',
    isDefault: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'ct-lojista',
    name: 'Lojista',
    description: 'Comércio varejista ou parceiro revendedor com contrato comercial.',
    isDefault: false,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'ct-distribuidor',
    name: 'Distribuidor Atacadista',
    description: 'Distribuidores regionais com pedidos em grande escala.',
    isDefault: false,
    createdAt: '2026-01-05T00:00:00Z',
  },
  {
    id: 'ct-assistencia',
    name: 'Assistência Técnica Credenciada',
    description: 'Posto de atendimento autorizado e oficinas credenciadas.',
    isDefault: false,
    createdAt: '2026-01-12T00:00:00Z',
  },
];

// Seed Products ("CADASTRO DE PRODUTOS")
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    reference: 'REF-101',
    name: 'Monitor UltraWide 29" LED Full HD 75Hz',
    category: 'Monitores & Telas',
    description: 'Painel IPS, HDR10, conexões HDMI e DisplayPort',
    status: 'ativo',
    createdAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'prod-2',
    reference: 'REF-102',
    name: 'Teclado Mecânico RGB Switch Blue ABNT2',
    category: 'Periféricos',
    description: 'Anti-ghosting completo, chassi de alumínio aeronáutico',
    status: 'ativo',
    createdAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'prod-3',
    reference: 'REF-103',
    name: 'Mouse Gamer Wireless 16000 DPI Sensor Óptico',
    category: 'Periféricos',
    description: 'Bateria recarregável 70h, taxa de resposta 1ms',
    status: 'ativo',
    createdAt: '2026-01-12T00:00:00Z',
  },
  {
    id: 'prod-4',
    reference: 'REF-104',
    name: 'Headset Surround 7.1 com Cancelamento Ativo',
    category: 'Áudio & Comunicação',
    description: 'Drivers 50mm de neodímio, microfone retrátil',
    status: 'ativo',
    createdAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'prod-5',
    reference: 'REF-201',
    name: 'Cadeira Ergonômica Presidente Pro Mesh',
    category: 'Mobiliário Corporativo',
    description: 'Apoio lombar 3D ajustável, pistão classe 4',
    status: 'ativo',
    createdAt: '2026-01-18T00:00:00Z',
  },
  {
    id: 'prod-6',
    reference: 'REF-202',
    name: 'Mesa com Regulagem de Altura Elétrica 140x70cm',
    category: 'Mobiliário Corporativo',
    description: 'Motor duplo silencioso, memória para 4 posições',
    status: 'ativo',
    createdAt: '2026-01-20T00:00:00Z',
  },
  {
    id: 'prod-7',
    reference: 'REF-301',
    name: 'Nobreak Senoidal 1500VA Bivolt Automático',
    category: 'Energia & Proteção',
    description: '8 tomadas protegidas, display digital de status',
    status: 'ativo',
    createdAt: '2026-01-22T00:00:00Z',
  },
  {
    id: 'prod-8',
    reference: 'REF-302',
    name: 'Fonte de Alimentação Modular 750W 80 Plus Gold',
    category: 'Energia & Hardware',
    description: 'Capacitores 100% japoneses, ventoinha FDB silenciosa',
    status: 'ativo',
    createdAt: '2026-01-25T00:00:00Z',
  },
  {
    id: 'prod-9',
    reference: 'REF-401',
    name: 'Parafusadeira e Furadeira de Impacto 20V Max',
    category: 'Ferramentas Industriais',
    description: 'Motor sem escovas (Brushless), 2 baterias de lítio',
    status: 'ativo',
    createdAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'prod-10',
    reference: 'REF-402',
    name: 'Serra Mármore 1400W 110mm Alta Rotação',
    category: 'Ferramentas Industriais',
    description: 'Corte a seco ou úmido, base reforçada e guia de profundidade',
    status: 'ativo',
    createdAt: '2026-02-05T00:00:00Z',
  },
];

// Seed Complaints with Sequential Codes
const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 'rec-0001',
    sequentialCode: 'REC-2026-0001',
    sequentialNumber: 1,
    clientName: 'Roberto Alves de Santana',
    clientDocument: '142.859.328-91',
    clientPhone: '(11) 98452-1190',
    clientEmail: 'roberto.santana@gmail.com',
    clientCityState: 'São Paulo - SP',
    clientTypeId: 'ct-consumidor',
    clientTypeName: 'Consumidor Final',
    invoiceNumber: 'NF-89241',
    invoiceDate: '2026-09-18',
    items: [
      {
        id: 'item-1-1',
        reference: 'REF-101',
        productName: 'Monitor UltraWide 29" LED Full HD 75Hz',
        quantity: 1,
        defectDescription: 'Linhas verticais piscando intermitentemente no canto superior direito após 2 horas de uso contínuo.',
        productId: 'prod-1',
      },
    ],
    status: 'resolvido',
    priority: 'alta',
    registeredByUserId: 'user-atendente-1',
    registeredByUserName: 'Carlos Eduardo Oliveira',
    assignedToUserId: 'user-qualidade-1',
    assignedToUserName: 'Fernanda Lima',
    generalNotes: 'Cliente relatou que o problema começou após 15 dias da entrega.',
    resolutionNotes: 'Produto recebido no laboratório de qualidade, constatado defeito no painel LCD. Realizada troca por unidade nova em garantia.',
    attachments: [
      {
        id: 'att-1-1',
        name: 'foto_defeito_tela_linhas.jpg',
        size: 245800,
        type: 'image/jpeg',
        uploadedAt: '2026-09-20T14:22:00Z',
      },
      {
        id: 'att-1-2',
        name: 'nota_fiscal_89241.pdf',
        size: 512400,
        type: 'application/pdf',
        uploadedAt: '2026-09-20T14:23:00Z',
      },
    ],
    createdAt: '2026-09-20T14:20:00Z',
    updatedAt: '2026-09-26T16:00:00Z',
    closedAt: '2026-09-26T16:00:00Z',
    history: [
      {
        id: 'hist-1-1',
        date: '2026-09-20T14:20:00Z',
        userId: 'user-atendente-1',
        userName: 'Carlos Eduardo Oliveira',
        action: 'Abertura do chamado com 1 item',
        newStatus: 'aberto',
      },
      {
        id: 'hist-1-2',
        date: '2026-09-21T09:10:00Z',
        userId: 'user-qualidade-1',
        userName: 'Fernanda Lima',
        action: 'Emissão de autorização de postagem reversa',
        previousStatus: 'aberto',
        newStatus: 'em_tratativa',
      },
      {
        id: 'hist-1-3',
        date: '2026-09-26T16:00:00Z',
        userId: 'user-gestor-1',
        userName: 'Mariana Costa',
        action: 'Troca despachada com código rastreio e caso finalizado',
        previousStatus: 'em_tratativa',
        newStatus: 'resolvido',
      },
    ],
  },
  {
    id: 'rec-0002',
    sequentialCode: 'REC-2026-0002',
    sequentialNumber: 2,
    clientName: 'Eletro Peças & Tecnologia Ltda',
    clientDocument: '18.492.384/0001-44',
    clientPhone: '(19) 3412-8800',
    clientEmail: 'compras@eletropecas.com.br',
    clientCityState: 'Campinas - SP',
    clientTypeId: 'ct-lojista',
    clientTypeName: 'Lojista',
    invoiceNumber: 'NF-90112',
    invoiceDate: '2026-09-25',
    items: [
      {
        id: 'item-2-1',
        reference: 'REF-102',
        productName: 'Teclado Mecânico RGB Switch Blue ABNT2',
        quantity: 5,
        defectDescription: 'Lote recebido com teclas de espaço e enter travando fisicamente.',
        productId: 'prod-2',
      },
      {
        id: 'item-2-2',
        reference: 'REF-103',
        productName: 'Mouse Gamer Wireless 16000 DPI Sensor Óptico',
        quantity: 3,
        defectDescription: 'Receptor USB wireless não é reconhecido pelo computador em 3 unidades.',
        productId: 'prod-3',
      },
    ],
    status: 'em_tratativa',
    priority: 'urgente',
    registeredByUserId: 'user-gestor-1',
    registeredByUserName: 'Mariana Costa',
    assignedToUserId: 'user-qualidade-1',
    assignedToUserName: 'Fernanda Lima',
    generalNotes: 'Lojista parceiro VIP nível Ouro solicitando reposição imediata para não perder vendas da semana.',
    createdAt: '2026-09-28T10:15:00Z',
    updatedAt: '2026-10-02T11:30:00Z',
    history: [
      {
        id: 'hist-2-1',
        date: '2026-09-28T10:15:00Z',
        userId: 'user-gestor-1',
        userName: 'Mariana Costa',
        action: 'Registro de ocorrência comercial com 8 itens defeituosos',
        newStatus: 'aberto',
      },
      {
        id: 'hist-2-2',
        date: '2026-09-29T14:00:00Z',
        userId: 'user-qualidade-1',
        userName: 'Fernanda Lima',
        action: 'Análise de fotos enviadas pelo lojista confirmando lote com vício',
        previousStatus: 'aberto',
        newStatus: 'em_analise',
      },
      {
        id: 'hist-2-3',
        date: '2026-10-02T11:30:00Z',
        userId: 'user-gestor-1',
        userName: 'Mariana Costa',
        action: 'Autorizado envio de novo lote por frete expresso sem custo',
        previousStatus: 'em_analise',
        newStatus: 'em_tratativa',
      },
    ],
  },
  {
    id: 'rec-0003',
    sequentialCode: 'REC-2026-0003',
    sequentialNumber: 3,
    clientName: 'Carla Beatriz Menezes',
    clientDocument: '293.401.882-15',
    clientPhone: '(21) 97120-4491',
    clientEmail: 'carla.menezes@outlook.com',
    clientCityState: 'Rio de Janeiro - RJ',
    clientTypeId: 'ct-consumidor',
    clientTypeName: 'Consumidor Final',
    invoiceNumber: 'NF-90875',
    invoiceDate: '2026-10-01',
    items: [
      {
        id: 'item-3-1',
        reference: 'REF-201',
        productName: 'Cadeira Ergonômica Presidente Pro Mesh',
        quantity: 1,
        defectDescription: 'Pistão a gás descendo sozinho e barulho metálico na base giratória.',
        productId: 'prod-5',
      },
    ],
    status: 'aguardando_laudo',
    priority: 'media',
    registeredByUserId: 'user-atendente-1',
    registeredByUserName: 'Carlos Eduardo Oliveira',
    assignedToUserId: 'user-qualidade-1',
    assignedToUserName: 'Fernanda Lima',
    generalNotes: 'Cliente enviou vídeo demonstrando o pistão cedendo.',
    createdAt: '2026-10-04T08:50:00Z',
    updatedAt: '2026-10-06T15:20:00Z',
    history: [
      {
        id: 'hist-3-1',
        date: '2026-10-04T08:50:00Z',
        userId: 'user-atendente-1',
        userName: 'Carlos Eduardo Oliveira',
        action: 'Chamado aberto pelo formulário de atendimento',
        newStatus: 'aberto',
      },
      {
        id: 'hist-3-2',
        date: '2026-10-06T15:20:00Z',
        userId: 'user-qualidade-1',
        userName: 'Fernanda Lima',
        action: 'Solicitado laudo de fabricação para fornecedor do pistão a gás',
        previousStatus: 'aberto',
        newStatus: 'aguardando_laudo',
      },
    ],
  },
  {
    id: 'rec-0004',
    sequentialCode: 'REC-2026-0004',
    sequentialNumber: 4,
    clientName: 'Varejo Magazine do Vale Ltda',
    clientDocument: '04.192.481/0002-88',
    clientPhone: '(31) 3290-7711',
    clientEmail: 'sac@magazinedovale.com.br',
    clientCityState: 'Belo Horizonte - MG',
    clientTypeId: 'ct-lojista',
    clientTypeName: 'Lojista',
    invoiceNumber: 'NF-91330',
    invoiceDate: '2026-10-05',
    items: [
      {
        id: 'item-4-1',
        reference: 'REF-401',
        productName: 'Parafusadeira e Furadeira de Impacto 20V Max',
        quantity: 2,
        defectDescription: 'Mandril com folga excessiva e travamento da rotação sob esforço.',
        productId: 'prod-9',
      },
      {
        id: 'item-4-2',
        reference: 'REF-402',
        productName: 'Serra Mármore 1400W 110mm Alta Rotação',
        quantity: 1,
        defectDescription: 'Superaquecimento imediato e faíscas no coletor do motor.',
        productId: 'prod-10',
      },
    ],
    status: 'em_analise',
    priority: 'alta',
    registeredByUserId: 'user-atendente-1',
    registeredByUserName: 'Carlos Eduardo Oliveira',
    assignedToUserId: 'user-qualidade-1',
    assignedToUserName: 'Fernanda Lima',
    generalNotes: 'Itens foram devolvidos por clientes da loja.',
    createdAt: '2026-10-08T13:40:00Z',
    updatedAt: '2026-10-09T09:15:00Z',
    history: [
      {
        id: 'hist-4-1',
        date: '2026-10-08T13:40:00Z',
        userId: 'user-atendente-1',
        userName: 'Carlos Eduardo Oliveira',
        action: 'Registro de garantia reversa para lojista',
        newStatus: 'aberto',
      },
      {
        id: 'hist-4-2',
        date: '2026-10-09T09:15:00Z',
        userId: 'user-qualidade-1',
        userName: 'Fernanda Lima',
        action: 'Iniciada verificação na bancada de testes de carga',
        previousStatus: 'aberto',
        newStatus: 'em_analise',
      },
    ],
  },
  {
    id: 'rec-0005',
    sequentialCode: 'REC-2026-0005',
    sequentialNumber: 5,
    clientName: 'Juliana Pires Rezende',
    clientDocument: '318.994.201-09',
    clientPhone: '(41) 99812-7065',
    clientEmail: 'juliana.rezende@yahoo.com.br',
    clientCityState: 'Curitiba - PR',
    clientTypeId: 'ct-consumidor',
    clientTypeName: 'Consumidor Final',
    invoiceNumber: 'NF-91540',
    invoiceDate: '2026-10-07',
    items: [
      {
        id: 'item-5-1',
        reference: 'REF-104',
        productName: 'Headset Surround 7.1 com Cancelamento Ativo',
        quantity: 1,
        defectDescription: 'Lado esquerdo sem áudio e chiado quando mexe no conector.',
        productId: 'prod-4',
      },
    ],
    status: 'aberto',
    priority: 'baixa',
    registeredByUserId: 'user-atendente-1',
    registeredByUserName: 'Carlos Eduardo Oliveira',
    generalNotes: 'Cliente solicitou retorno preferencialmente por WhatsApp.',
    createdAt: '2026-10-10T11:05:00Z',
    updatedAt: '2026-10-10T11:05:00Z',
    history: [
      {
        id: 'hist-5-1',
        date: '2026-10-10T11:05:00Z',
        userId: 'user-atendente-1',
        userName: 'Carlos Eduardo Oliveira',
        action: 'Abertura de chamado de consumidor final',
        newStatus: 'aberto',
      },
    ],
  },
  {
    id: 'rec-0006',
    sequentialCode: 'REC-2026-0006',
    sequentialNumber: 6,
    clientName: 'Marcos Vinicius Duarte',
    clientDocument: '098.223.111-78',
    clientPhone: '(51) 98112-9922',
    clientEmail: 'marcos.vduarte@terra.com.br',
    clientCityState: 'Porto Alegre - RS',
    clientTypeId: 'ct-consumidor',
    clientTypeName: 'Consumidor Final',
    invoiceNumber: 'NF-88120',
    invoiceDate: '2026-08-10',
    items: [
      {
        id: 'item-6-1',
        reference: 'REF-301',
        productName: 'Nobreak Senoidal 1500VA Bivolt Automático',
        quantity: 1,
        defectDescription: 'Relatou que desligou durante tempestade com raio.',
        productId: 'prod-7',
      },
    ],
    status: 'cancelado',
    priority: 'media',
    registeredByUserId: 'user-atendente-1',
    registeredByUserName: 'Carlos Eduardo Oliveira',
    assignedToUserId: 'user-qualidade-1',
    assignedToUserName: 'Fernanda Lima',
    generalNotes: 'Solicitado envio para laudo pericial.',
    resolutionNotes: 'Laudo técnico constatou descarga atmosférica direta na rede sem aterramento e queima por raio, condição excluída pela garantia contratual. Caso encerrado como improcedente.',
    createdAt: '2026-09-12T16:45:00Z',
    updatedAt: '2026-09-16T14:30:00Z',
    closedAt: '2026-09-16T14:30:00Z',
    history: [
      {
        id: 'hist-6-1',
        date: '2026-09-12T16:45:00Z',
        userId: 'user-atendente-1',
        userName: 'Carlos Eduardo Oliveira',
        action: 'Registro de solicitação',
        newStatus: 'aberto',
      },
      {
        id: 'hist-6-2',
        date: '2026-09-16T14:30:00Z',
        userId: 'user-qualidade-1',
        userName: 'Fernanda Lima',
        action: 'Cancelamento por laudo conclusivo de queima por raio fora de garantia',
        previousStatus: 'aberto',
        newStatus: 'cancelado',
      },
    ],
  },
];

export const storageService = {
  // USERS
  getUsers(): User[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
        return INITIAL_USERS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_USERS;
    }
  },

  saveUsers(users: User[]): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  updateUserName(userId: string, newName: string): User | null {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) return null;
    users[index] = { ...users[index], name: newName.trim() };
    this.saveUsers(users);
    return users[index];
  },

  updateUserRole(userId: string, newRole: UserRole): User | null {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) return null;
    users[index] = { ...users[index], role: newRole };
    this.saveUsers(users);
    return users[index];
  },

  deleteUser(userId: string): boolean {
    const users = this.getUsers();
    const filtered = users.filter((u) => u.id !== userId);
    if (filtered.length === users.length) return false;
    this.saveUsers(filtered);
    return true;
  },

  getCurrentUser(): User {
    const users = this.getUsers();
    const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    const found = users.find((u) => u.id === currentId);
    if (found) return found;
    // Default to admin Silvio
    const defaultUser = users[0] || INITIAL_USERS[0];
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, defaultUser.id);
    return defaultUser;
  },

  setCurrentUser(userId: string): User {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
    return this.getCurrentUser();
  },

  hasPermission(user: User, permissionKey: keyof UserPermissions): boolean {
    if (user.role === 'admin') return true;
    if (user.customPermissions && user.customPermissions[permissionKey] !== undefined) {
      return !!user.customPermissions[permissionKey];
    }
    return !!ROLE_DEFAULT_PERMISSIONS[user.role]?.[permissionKey];
  },

  // CLIENT TYPES ("TIPOS DE CLIENTES")
  getClientTypes(): ClientType[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CLIENT_TYPES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.CLIENT_TYPES, JSON.stringify(INITIAL_CLIENT_TYPES));
        return INITIAL_CLIENT_TYPES;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_CLIENT_TYPES;
    }
  },

  saveClientTypes(types: ClientType[]): void {
    localStorage.setItem(STORAGE_KEYS.CLIENT_TYPES, JSON.stringify(types));
  },

  addClientType(name: string, description?: string): ClientType {
    const types = this.getClientTypes();
    const newType: ClientType = {
      id: `ct-${Date.now()}`,
      name: name.trim(),
      description: description?.trim() || '',
      isDefault: false,
      createdAt: new Date().toISOString(),
    };
    types.push(newType);
    this.saveClientTypes(types);
    return newType;
  },

  updateClientType(id: string, name: string, description?: string): void {
    const types = this.getClientTypes().map((t) =>
      t.id === id ? { ...t, name: name.trim(), description: description?.trim() } : t
    );
    this.saveClientTypes(types);
  },

  deleteClientType(id: string): void {
    const types = this.getClientTypes().filter((t) => t.id !== id);
    this.saveClientTypes(types);
  },

  // PRODUCTS ("CADASTRO DE PRODUTOS")
  getProducts(): Product[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
        return INITIAL_PRODUCTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_PRODUCTS;
    }
  },

  saveProducts(products: Product[]): void {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },

  findProductByReference(ref: string): Product | undefined {
    if (!ref || !ref.trim()) return undefined;
    const cleanRef = ref.trim().toLowerCase();
    const products = this.getProducts();
    return products.find(
      (p) => p.status === 'ativo' && p.reference.trim().toLowerCase() === cleanRef
    );
  },

  addProduct(product: Omit<Product, 'id' | 'createdAt'>): Product {
    const products = this.getProducts();
    const user = this.getCurrentUser();
    const now = new Date().toISOString();
    const cleanRef = product.reference.trim().toUpperCase();

    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      reference: cleanRef,
      createdAt: now,
      updatedAt: now,
      history: [
        {
          id: `phist-${Date.now()}`,
          date: now,
          userId: user.id,
          userName: user.name,
          action: 'Cadastro de novo produto no catálogo',
          details: `Referência: ${cleanRef} | Nome: ${product.name.trim()} | Categoria: ${product.category}`,
        },
      ],
    };
    products.push(newProduct);
    this.saveProducts(products);
    return newProduct;
  },

  updateProduct(id: string, updates: Partial<Product>, changeNote?: string): Product | null {
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const prev = products[index];
    const user = this.getCurrentUser();
    const now = new Date().toISOString();

    const changes: string[] = [];
    if (updates.reference && updates.reference.toUpperCase() !== prev.reference.toUpperCase()) {
      changes.push(`Referência alterada de "${prev.reference}" para "${updates.reference.toUpperCase()}"`);
    }
    if (updates.name && updates.name !== prev.name) {
      changes.push(`Nome alterado de "${prev.name}" para "${updates.name}"`);
    }
    if (updates.category && updates.category !== prev.category) {
      changes.push(`Categoria alterada de "${prev.category}" para "${updates.category}"`);
    }
    if (updates.status && updates.status !== prev.status) {
      changes.push(`Status alterado de "${prev.status}" para "${updates.status}"`);
    }
    if (updates.description !== undefined && updates.description !== prev.description) {
      changes.push('Descrição técnica atualizada');
    }
    if (changeNote) {
      changes.push(`Justificativa: ${changeNote}`);
    }

    const newHistoryEntry = {
      id: `phist-${Date.now()}`,
      date: now,
      userId: user.id,
      userName: user.name,
      action: 'Alteração cadastral do produto',
      details: changes.length > 0 ? changes.join('; ') : 'Atualização de informações do produto',
    };

    products[index] = {
      ...prev,
      ...updates,
      updatedAt: now,
      history: [
        ...(prev.history || []),
        newHistoryEntry,
      ],
    };

    this.saveProducts(products);
    return products[index];
  },

  deleteProduct(id: string): void {
    const products = this.getProducts().filter((p) => p.id !== id);
    this.saveProducts(products);
  },

  // COMPLAINTS & SEQUENTIAL CODE
  getComplaints(): Complaint[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMPLAINTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(INITIAL_COMPLAINTS));
        localStorage.setItem(STORAGE_KEYS.SEQUENTIAL_COUNTER, '6');
        return INITIAL_COMPLAINTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_COMPLAINTS;
    }
  },

  saveComplaints(complaints: Complaint[]): void {
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(complaints));
  },

  getNextSequentialCode(): { sequentialCode: string; sequentialNumber: number } {
    const complaints = this.getComplaints();
    const currentYear = new Date().getFullYear();
    const maxNum = complaints.reduce((max, c) => Math.max(max, c.sequentialNumber || 0), 0);
    const nextNumber = maxNum + 1;
    const formatted = `REC-${currentYear}-${String(nextNumber).padStart(4, '0')}`;
    return { sequentialCode: formatted, sequentialNumber: nextNumber };
  },

  createComplaint(complaintData: Omit<Complaint, 'id' | 'sequentialCode' | 'sequentialNumber' | 'createdAt' | 'updatedAt' | 'history'>): Complaint {
    const { sequentialCode, sequentialNumber } = this.getNextSequentialCode();
    const now = new Date().toISOString();
    const user = this.getCurrentUser();

    const newComplaint: Complaint = {
      ...complaintData,
      id: `rec-${Date.now()}`,
      sequentialCode,
      sequentialNumber,
      createdAt: now,
      updatedAt: now,
      history: [
        {
          id: `hist-${Date.now()}`,
          date: now,
          userId: user.id,
          userName: user.name,
          action: `Ocorrência registrada com ${complaintData.items.length} produto(s)`,
          newStatus: complaintData.status,
          notes: complaintData.generalNotes,
        },
      ],
    };

    const complaints = this.getComplaints();
    complaints.unshift(newComplaint);
    this.saveComplaints(complaints);
    return newComplaint;
  },

  updateComplaintStatus(
    complaintId: string,
    newStatus: Complaint['status'],
    notes?: string
  ): Complaint | null {
    const complaints = this.getComplaints();
    const index = complaints.findIndex((c) => c.id === complaintId);
    if (index === -1) return null;

    const user = this.getCurrentUser();
    const now = new Date().toISOString();
    const prevStatus = complaints[index].status;

    complaints[index] = {
      ...complaints[index],
      status: newStatus,
      updatedAt: now,
      closedAt: (newStatus === 'resolvido' || newStatus === 'cancelado') ? now : undefined,
      resolutionNotes: notes || complaints[index].resolutionNotes,
      history: [
        ...complaints[index].history,
        {
          id: `hist-${Date.now()}`,
          date: now,
          userId: user.id,
          userName: user.name,
          action: `Status alterado de "${prevStatus}" para "${newStatus}"`,
          previousStatus: prevStatus,
          newStatus,
          notes,
        },
      ],
    };

    this.saveComplaints(complaints);
    return complaints[index];
  },

  updateComplaintItems(
    complaintId: string,
    newItems: ComplaintItem[],
    userNote?: string
  ): Complaint | null {
    const complaints = this.getComplaints();
    const index = complaints.findIndex((c) => c.id === complaintId);
    if (index === -1) return null;

    const complaint = complaints[index];
    const oldItems = complaint.items;
    const user = this.getCurrentUser();
    const now = new Date().toISOString();

    // Check what was added, modified, or removed
    const addedItems = newItems.filter((ni) => !oldItems.some((oi) => oi.id === ni.id));
    const removedItems = oldItems.filter((oi) => !newItems.some((ni) => ni.id === oi.id));
    const modifiedItems = newItems.filter((ni) => {
      const match = oldItems.find((oi) => oi.id === ni.id);
      if (!match) return false;
      return (
        match.reference !== ni.reference ||
        match.productName !== ni.productName ||
        match.quantity !== ni.quantity ||
        match.defectDescription !== ni.defectDescription
      );
    });

    const changeDetails: string[] = [];
    if (addedItems.length > 0) {
      const addedDesc = addedItems
        .map((it) => `+ ${it.reference} (${it.productName}, Qtd: ${it.quantity})`)
        .join('; ');
      changeDetails.push(`Adicionados: ${addedDesc}`);
    }
    if (modifiedItems.length > 0) {
      const modDesc = modifiedItems
        .map((it) => {
          const match = oldItems.find((oi) => oi.id === it.id)!;
          const diffs: string[] = [];
          if (match.reference !== it.reference) diffs.push(`ref ${match.reference} -> ${it.reference}`);
          if (match.quantity !== it.quantity) diffs.push(`qtd ${match.quantity} -> ${it.quantity}`);
          if (match.defectDescription !== it.defectDescription) diffs.push('defeito atualizado');
          return `${it.reference} (${diffs.join(', ')})`;
        })
        .join('; ');
      changeDetails.push(`Alterados: ${modDesc}`);
    }
    if (removedItems.length > 0) {
      const remDesc = removedItems
        .map((it) => `- ${it.reference} (${it.productName})`)
        .join('; ');
      changeDetails.push(`Removidos: ${remDesc}`);
    }

    if (userNote && userNote.trim()) {
      changeDetails.push(`Observação: ${userNote.trim()}`);
    }

    const historyNote = changeDetails.join(' | ') || 'Produtos da ocorrência atualizados';

    complaints[index] = {
      ...complaint,
      items: newItems,
      updatedAt: now,
      history: [
        ...complaint.history,
        {
          id: `hist-${Date.now()}`,
          date: now,
          userId: user.id,
          userName: user.name,
          action: `Alteração de produtos da ocorrência (${newItems.length} produto(s) no chamado)`,
          notes: historyNote,
        },
      ],
    };

    this.saveComplaints(complaints);
    return complaints[index];
  },

  updateComplaint(id: string, updates: Partial<Complaint>): void {
    const complaints = this.getComplaints().map((c) =>
      c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
    );
    this.saveComplaints(complaints);
  },

  addComplaintAttachment(complaintId: string, attachment: ComplaintAttachment): Complaint | null {
    const complaints = this.getComplaints();
    const index = complaints.findIndex((c) => c.id === complaintId);
    if (index === -1) return null;

    const user = this.getCurrentUser();
    const now = new Date().toISOString();
    const currentAttachments = complaints[index].attachments || [];

    complaints[index] = {
      ...complaints[index],
      attachments: [...currentAttachments, attachment],
      updatedAt: now,
      history: [
        ...complaints[index].history,
        {
          id: `hist-${Date.now()}`,
          date: now,
          userId: user.id,
          userName: user.name,
          action: `Anexo adicionado: "${attachment.name}"`,
          notes: `Arquivo ${attachment.name} (${(attachment.size / 1024).toFixed(1)} KB) anexado à ocorrência.`,
        },
      ],
    };

    this.saveComplaints(complaints);
    return complaints[index];
  },

  removeComplaintAttachment(complaintId: string, attachmentId: string): Complaint | null {
    const complaints = this.getComplaints();
    const index = complaints.findIndex((c) => c.id === complaintId);
    if (index === -1) return null;

    const currentAttachments = complaints[index].attachments || [];
    const removedAtt = currentAttachments.find((a) => a.id === attachmentId);
    const updatedAttachments = currentAttachments.filter((a) => a.id !== attachmentId);

    const user = this.getCurrentUser();
    const now = new Date().toISOString();

    complaints[index] = {
      ...complaints[index],
      attachments: updatedAttachments,
      updatedAt: now,
      history: [
        ...complaints[index].history,
        {
          id: `hist-${Date.now()}`,
          date: now,
          userId: user.id,
          userName: user.name,
          action: `Anexo removido: "${removedAtt ? removedAtt.name : 'Arquivo'}"`,
          notes: `Arquivo removido da ocorrência.`,
        },
      ],
    };

    this.saveComplaints(complaints);
    return complaints[index];
  },

  deleteComplaint(id: string): void {
    const complaints = this.getComplaints().filter((c) => c.id !== id);
    this.saveComplaints(complaints);
  },

  // Reset to default seeds
  resetToDefaults(): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.CLIENT_TYPES, JSON.stringify(INITIAL_CLIENT_TYPES));
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(INITIAL_COMPLAINTS));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, INITIAL_USERS[0].id);
    localStorage.setItem(STORAGE_KEYS.SEQUENTIAL_COUNTER, '6');
  },
};
