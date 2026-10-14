import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  Building2,
  User as UserIcon,
  Phone,
  Mail,
  MapPin,
  Receipt,
  Sparkles,
  Paperclip,
  UploadCloud,
  File,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import {
  ClientType,
  Product,
  ComplaintItem,
  ComplaintAttachment,
  ComplaintPriority,
  ComplaintStatus,
} from '../types';
import { storageService } from '../services/storage';
import { ProductSearchModal } from './ProductSearchModal';

interface ComplaintFormProps {
  onSuccess: (complaintCode: string) => void;
  clientTypes: ClientType[];
  products: Product[];
  onOpenClientTypesManager?: () => void;
}

export const ComplaintForm: React.FC<ComplaintFormProps> = ({
  onSuccess,
  clientTypes,
  products,
  onOpenClientTypesManager,
}) => {
  // Next code preview
  const [nextCodeInfo, setNextCodeInfo] = useState<{
    sequentialCode: string;
    sequentialNumber: number;
  }>({ sequentialCode: '', sequentialNumber: 0 });

  useEffect(() => {
    setNextCodeInfo(storageService.getNextSequentialCode());
  }, []);

  // Form states
  const [clientName, setClientName] = useState('');
  const [clientDocument, setClientDocument] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientCityState, setClientCityState] = useState('');
  const [clientTypeId, setClientTypeId] = useState<string>(
    clientTypes.find((c) => c.isDefault)?.id || clientTypes[0]?.id || ''
  );
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [priority, setPriority] = useState<ComplaintPriority>('media');
  const [status, setStatus] = useState<ComplaintStatus>('aberto');
  const [generalNotes, setGeneralNotes] = useState('');

  // Complaint items list
  const [items, setItems] = useState<ComplaintItem[]>([
    {
      id: `item-${Date.now()}-0`,
      reference: '',
      productName: '',
      quantity: 1,
      defectDescription: '',
    },
  ]);

  // Attachments state
  const [attachments, setAttachments] = useState<ComplaintAttachment[]>([]);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);

  // Modal for catalog search
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [activeItemIndexForModal, setActiveItemIndexForModal] = useState<number | null>(null);

  // Errors feedback
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingFiles(true);
    const newAttachments: ComplaintAttachment[] = [];
    const filesArray = Array.from(files);

    let processedCount = 0;
    filesArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        newAttachments.push({
          id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          dataUrl: reader.result as string,
          uploadedAt: new Date().toISOString(),
        });
        processedCount++;
        if (processedCount === filesArray.length) {
          setAttachments((prev) => [...prev, ...newAttachments]);
          setIsUploadingFiles(false);
          e.target.value = '';
        }
      };
      reader.onerror = () => {
        processedCount++;
        if (processedCount === filesArray.length) {
          setIsUploadingFiles(false);
          e.target.value = '';
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // Auto-fill logic when reference changes
  const handleReferenceChange = (index: number, newRef: string) => {
    const updated = [...items];
    updated[index].reference = newRef;

    // Search catalog
    const matched = storageService.findProductByReference(newRef);
    if (matched) {
      updated[index].productName = matched.name;
      updated[index].productId = matched.id;
    }

    setItems(updated);
  };

  const handleItemFieldChange = (
    index: number,
    field: keyof ComplaintItem,
    value: any
  ) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    setItems(updated);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: `item-${Date.now()}-${items.length}`,
        reference: '',
        productName: '',
        quantity: 1,
        defectDescription: '',
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleOpenSearchModal = (index: number) => {
    setActiveItemIndexForModal(index);
    setIsSearchModalOpen(true);
  };

  const handleSelectProductFromModal = (product: Product) => {
    if (activeItemIndexForModal === null) return;
    const updated = [...items];
    updated[activeItemIndexForModal].reference = product.reference;
    updated[activeItemIndexForModal].productName = product.name;
    updated[activeItemIndexForModal].productId = product.id;
    setItems(updated);
    setActiveItemIndexForModal(null);
  };

  // Form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!clientName.trim()) newErrors.clientName = 'Nome do cliente é obrigatório.';
    if (!clientDocument.trim()) newErrors.clientDocument = 'CPF ou CNPJ é obrigatório.';
    if (!clientPhone.trim()) newErrors.clientPhone = 'Telefone de contato é obrigatório.';
    if (!clientTypeId) newErrors.clientTypeId = 'Selecione o tipo de cliente.';

    // Validate items
    items.forEach((item, idx) => {
      if (!item.reference.trim()) {
        newErrors[`item_${idx}_ref`] = 'Referência é obrigatória.';
      }
      if (!item.productName.trim()) {
        newErrors[`item_${idx}_name`] = 'Nome do produto é obrigatório.';
      }
      if (!item.quantity || item.quantity < 1) {
        newErrors[`item_${idx}_qty`] = 'Quantidade inválida.';
      }
      if (!item.defectDescription.trim()) {
        newErrors[`item_${idx}_defect`] = 'Descrição do defeito é obrigatória.';
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    const currentUser = storageService.getCurrentUser();
    const selectedClientType = clientTypes.find((c) => c.id === clientTypeId);

    try {
      const created = storageService.createComplaint({
        clientName: clientName.trim(),
        clientDocument: clientDocument.trim(),
        clientPhone: clientPhone.trim(),
        clientEmail: clientEmail.trim(),
        clientCityState: clientCityState.trim(),
        clientTypeId,
        clientTypeName: selectedClientType?.name || 'Não especificado',
        invoiceNumber: invoiceNumber.trim() || undefined,
        invoiceDate: invoiceDate || undefined,
        priority,
        status,
        generalNotes: generalNotes.trim(),
        items: items.map((it) => ({
          ...it,
          reference: it.reference.trim().toUpperCase(),
          productName: it.productName.trim(),
          defectDescription: it.defectDescription.trim(),
        })),
        attachments: attachments,
        registeredByUserId: currentUser.id,
        registeredByUserName: currentUser.name,
      });

      setIsSubmitting(false);
      onSuccess(created.sequentialCode);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Banner de Cabeçalho do Formulário (Harmonia Azul e Menta) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-700 text-xs font-semibold tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            <FileText className="w-4 h-4 text-blue-600" />
            <span className="text-blue-950 font-bold">Novo Registro de Ocorrência</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Cadastro de Reclamação de Cliente
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Preencha os dados do cliente, selecione o tipo de cadastro e liste os produtos com defeito.
          </p>
        </div>

        {/* Indicador do Código Sequencial (Azul + Menta) */}
        <div className="bg-gradient-to-br from-blue-50/80 to-teal-50/80 border border-teal-200/90 rounded-xl px-4 py-3 shrink-0 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-teal-100 text-teal-700">
            <Sparkles className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-blue-900 block uppercase tracking-wider">
              Código Sequencial Automático
            </span>
            <span className="font-mono text-lg font-bold text-teal-900 tabular-nums">
              {nextCodeInfo.sequentialCode || 'Gerando...'}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seção 1: Dados do Cliente e Tipo de Cliente */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-blue-600" />
              <span>Identificação do Cliente & Contato</span>
            </h2>
            <p className="text-xs text-slate-500">
              Defina o tipo de cliente (baseado no banco TIPOS DE CLIENTES) e os canais de contato
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* TIPO DE CLIENTE */}
            <div className="md:col-span-1">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>Tipo de Cliente *</span>
                </label>
                {onOpenClientTypesManager && (
                  <button
                    type="button"
                    onClick={onOpenClientTypesManager}
                    className="text-[11px] text-teal-700 hover:text-teal-900 underline font-medium"
                  >
                    Gerenciar tipos
                  </button>
                )}
              </div>
              <select
                value={clientTypeId}
                onChange={(e) => setClientTypeId(e.target.value)}
                className={`w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 ${
                  errors.clientTypeId ? 'border-red-400 bg-red-50/30' : 'border-slate-200'
                }`}
              >
                <option value="">Selecione o Tipo de Cliente...</option>
                {clientTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name} {type.isDefault ? '(Padrão)' : ''}
                  </option>
                ))}
              </select>
              {errors.clientTypeId && (
                <span className="text-[11px] text-red-600 mt-1 block">
                  {errors.clientTypeId}
                </span>
              )}
              <span className="text-[11px] text-teal-700 mt-1 block font-medium">
                Alimentado pelo banco "TIPOS DE CLIENTES"
              </span>
            </div>

            {/* Nome / Razão Social */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nome Completo / Razão Social *
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ex: Roberto Alves de Santana ou Eletro Peças Ltda"
                className={`w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                  errors.clientName ? 'border-red-400 bg-red-50/30' : 'border-slate-200'
                }`}
              />
              {errors.clientName && (
                <span className="text-[11px] text-red-600 mt-1 block">
                  {errors.clientName}
                </span>
              )}
            </div>

            {/* CPF / CNPJ */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                CPF ou CNPJ *
              </label>
              <input
                type="text"
                value={clientDocument}
                onChange={(e) => setClientDocument(e.target.value)}
                placeholder="000.000.000-00 ou 00.000.000/0001-00"
                className={`w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                  errors.clientDocument ? 'border-red-400 bg-red-50/30' : 'border-slate-200'
                }`}
              />
              {errors.clientDocument && (
                <span className="text-[11px] text-red-600 mt-1 block">
                  {errors.clientDocument}
                </span>
              )}
            </div>

            {/* Telefone / WhatsApp */}
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-teal-600" />
                <span>Telefone / WhatsApp *</span>
              </label>
              <input
                type="text"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="(00) 90000-0000"
                className={`w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                  errors.clientPhone ? 'border-red-400 bg-red-50/30' : 'border-slate-200'
                }`}
              />
              {errors.clientPhone && (
                <span className="text-[11px] text-red-600 mt-1 block">
                  {errors.clientPhone}
                </span>
              )}
            </div>

            {/* E-mail */}
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-blue-500" />
                <span>E-mail</span>
              </label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="cliente@exemplo.com.br"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            {/* Cidade / UF */}
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-teal-600" />
                <span>Cidade / UF</span>
              </label>
              <input
                type="text"
                value={clientCityState}
                onChange={(e) => setClientCityState(e.target.value)}
                placeholder="Ex: Curitiba - PR"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            {/* Nota Fiscal */}
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <Receipt className="w-3.5 h-3.5 text-blue-500" />
                <span>Número da Nota Fiscal (NF)</span>
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="Ex: NF-92810"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            {/* Data da NF */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Data de Emissão da NF
              </label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Seção 2: ITENS DA RECLAMAÇÃO */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-600" />
                <span>Itens da Reclamação (Cadastro de Produtos)</span>
              </h2>
              <p className="text-xs text-slate-500">
                Digite a Referência cadastrada para preencher o Nome do produto automaticamente ou use o botão de busca.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-colors shrink-0 shadow-2xs"
            >
              <Plus className="w-4 h-4 text-teal-600" />
              <span>Adicionar Outro Produto</span>
            </button>
          </div>

          {/* Lista de Itens */}
          <div className="space-y-4">
            {items.map((item, index) => {
              const matchedProduct = storageService.findProductByReference(item.reference);

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 inline-flex items-center justify-center text-[11px] font-mono font-bold">
                        {index + 1}
                      </span>
                      <span>Item #{index + 1}</span>
                    </span>

                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 p-1 hover:bg-red-50 rounded transition-colors"
                        title="Remover este item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remover</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    {/* Campo Referência */}
                    <div className="md:col-span-3">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Referência *
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={item.reference}
                          onChange={(e) => handleReferenceChange(index, e.target.value)}
                          placeholder="Ex: REF-101"
                          className={`w-full px-3 py-2 text-sm font-mono bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 uppercase ${
                            errors[`item_${index}_ref`]
                              ? 'border-red-400 bg-red-50/20'
                              : 'border-slate-300'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => handleOpenSearchModal(index)}
                          title="Pesquisar no Cadastro de Produtos"
                          className="p-2 text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 rounded-lg shrink-0 transition-colors"
                        >
                          <Search className="w-4 h-4 text-blue-600" />
                        </button>
                      </div>
                      {errors[`item_${index}_ref`] && (
                        <span className="text-[11px] text-red-600 mt-1 block">
                          {errors[`item_${index}_ref`]}
                        </span>
                      )}

                      {matchedProduct ? (
                        <div className="flex items-center gap-1 text-[11px] text-teal-700 font-semibold mt-1">
                          <CheckCircle2 className="w-3 h-3 shrink-0 text-teal-600" />
                          <span>Localizado no cadastro</span>
                        </div>
                      ) : item.reference.trim().length > 0 ? (
                        <div className="text-[11px] text-slate-400 mt-1">
                          Não encontrado no catálogo (será mantido avulso)
                        </div>
                      ) : null}
                    </div>

                    {/* Nome do Produto */}
                    <div className="md:col-span-7">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Nome do Produto * (Preenchimento Automático)
                      </label>
                      <input
                        type="text"
                        value={item.productName}
                        onChange={(e) =>
                          handleItemFieldChange(index, 'productName', e.target.value)
                        }
                        placeholder="Nome do produto identificado automaticamente pela referência"
                        className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 ${
                          errors[`item_${index}_name`]
                            ? 'border-red-400 bg-red-50/20'
                            : 'border-slate-300'
                        } ${matchedProduct ? 'bg-teal-50/30 text-slate-900 font-medium' : ''}`}
                      />
                      {errors[`item_${index}_name`] && (
                        <span className="text-[11px] text-red-600 mt-1 block">
                          {errors[`item_${index}_name`]}
                        </span>
                      )}
                    </div>

                    {/* Quantidade */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Quantidade *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemFieldChange(
                            index,
                            'quantity',
                            Math.max(1, parseInt(e.target.value) || 1)
                          )
                        }
                        className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 tabular-nums ${
                          errors[`item_${index}_qty`]
                            ? 'border-red-400 bg-red-50/20'
                            : 'border-slate-300'
                        }`}
                      />
                      {errors[`item_${index}_qty`] && (
                        <span className="text-[11px] text-red-600 mt-1 block">
                          {errors[`item_${index}_qty`]}
                        </span>
                      )}
                    </div>

                    {/* Descrição do Defeito */}
                    <div className="md:col-span-12">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Descrição do Defeito *
                      </label>
                      <textarea
                        rows={2}
                        value={item.defectDescription}
                        onChange={(e) =>
                          handleItemFieldChange(index, 'defectDescription', e.target.value)
                        }
                        placeholder="Descreva detalhadamente o sintoma, anomalia física, falha de funcionamento ou problema apresentado..."
                        className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none ${
                          errors[`item_${index}_defect`]
                            ? 'border-red-400 bg-red-50/20'
                            : 'border-slate-300'
                        }`}
                      />
                      {errors[`item_${index}_defect`] && (
                        <span className="text-[11px] text-red-600 mt-1 block">
                          {errors[`item_${index}_defect`]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
            <span>
              Total de produtos distintos:{' '}
              <strong className="text-slate-800">{items.length}</strong>
            </span>
            <span>
              Total de peças com defeito:{' '}
              <strong className="text-blue-900 font-bold">
                {items.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0)}
              </strong>
            </span>
          </div>
        </div>

        {/* Seção 3: Prioridade, Status Inicial e Observações */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-semibold text-slate-900">
              Classificação & Observações Gerais
            </h2>
            <p className="text-xs text-slate-500">
              Defina o nível de urgência e anotações internas da ocorrência
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Prioridade do Atendimento
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as ComplaintPriority)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                <option value="baixa">Baixa (Prazos padrão de análise)</option>
                <option value="media">Média (Atendimento regular SAC)</option>
                <option value="alta">Alta (Cliente com risco de desistência)</option>
                <option value="urgente">Urgente (Lojista VIP / Notificação formal)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Status Inicial da Ocorrência
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ComplaintStatus)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                <option value="aberto">Aberto (Aguardando triagem)</option>
                <option value="em_analise">Em Análise (Encaminhado para Qualidade)</option>
                <option value="em_tratativa">Em Tratativa (Solução em andamento)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Observações Gerais / Instruções de Logística
              </label>
              <textarea
                rows={3}
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                placeholder="Observações adicionais para a equipe de pós-venda ou assistência..."
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Seção 4: Anexos e Documentos Comprobatórios */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-teal-600" />
                <h2 className="text-base font-semibold text-slate-900">
                  Anexos & Evidências da Ocorrência
                </h2>
                {attachments.length > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-teal-100 text-teal-800 border border-teal-200 font-mono">
                    {attachments.length} {attachments.length === 1 ? 'arquivo' : 'arquivos'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Fotos de avarias, laudos de bancada, notas fiscais (PDF) ou comprovantes de entrega.
              </p>
            </div>
          </div>

          {/* Upload Drop Zone / Input */}
          <div className="relative border-2 border-dashed border-teal-200 hover:border-teal-400 bg-teal-50/20 hover:bg-teal-50/40 rounded-xl p-6 transition-all text-center group cursor-pointer">
            <input
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              title="Clique ou arraste arquivos aqui para anexar"
            />
            <div className="flex flex-col items-center justify-center pointer-events-none">
              <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform shadow-2xs">
                <UploadCloud className="w-6 h-6 text-teal-600" />
              </div>
              <p className="text-xs font-bold text-slate-800">
                Clique para selecionar arquivos ou arraste fotos e documentos aqui
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Suporta fotos (JPG, PNG, WebP) e documentos (PDF, DOCX). Múltiplos arquivos permitidos.
              </p>
              {isUploadingFiles && (
                <div className="mt-2 text-xs font-semibold text-teal-700 animate-pulse flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                  <span>Processando anexos...</span>
                </div>
              )}
            </div>
          </div>

          {/* Lista de Anexos Anexados */}
          {attachments.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {attachments.map((att) => {
                const isImage = att.type.startsWith('image/');
                const formattedSize =
                  att.size > 1024 * 1024
                    ? `${(att.size / (1024 * 1024)).toFixed(1)} MB`
                    : `${Math.round(att.size / 1024)} KB`;

                return (
                  <div
                    key={att.id}
                    className="flex items-center gap-3 p-2.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 transition-colors group relative"
                  >
                    {/* Thumbnail or Icon */}
                    <div className="w-11 h-11 rounded-lg bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                      {isImage && att.dataUrl ? (
                        <img
                          src={att.dataUrl}
                          alt={att.name}
                          className="w-full h-full object-cover"
                        />
                      ) : isImage ? (
                        <ImageIcon className="w-5 h-5 text-teal-600" />
                      ) : (
                        <File className="w-5 h-5 text-blue-600" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1 text-xs">
                      <p
                        className="font-semibold text-slate-800 truncate"
                        title={att.name}
                      >
                        {att.name}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                        <span>{formattedSize}</span>
                        <span>·</span>
                        <span className="uppercase text-[10px] bg-slate-200/70 px-1 rounded">
                          {att.name.split('.').pop() || 'FILE'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(att.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                      title="Remover anexo"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Feedback de Erro Geral se houver */}
        {Object.keys(errors).length > 0 && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-semibold block mb-0.5">
                Por favor, verifique os campos obrigatórios com pendências:
              </span>
              <ul className="list-disc list-inside space-y-0.5">
                {Object.values(errors).slice(0, 4).map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Botão de Envio (Azul com acabamento Menta) */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-700 to-teal-600 hover:from-blue-800 hover:to-teal-700 active:from-blue-900 active:to-teal-800 rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-teal-200" />
            <span>
              {isSubmitting
                ? 'Gravando Registro...'
                : `Concluir e Gerar ${nextCodeInfo.sequentialCode || 'Registro'}`}
            </span>
          </button>
        </div>
      </form>

      {/* Modal de Busca no Catálogo de Produtos */}
      <ProductSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        products={products}
        onSelectProduct={handleSelectProductFromModal}
      />
    </div>
  );
};
