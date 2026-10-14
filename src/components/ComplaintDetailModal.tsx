import React, { useState } from 'react';
import {
  X,
  Clock,
  Printer,
  User,
  Building2,
  Calendar,
  AlertTriangle,
  Receipt,
  FileText,
  Phone,
  Mail,
  CheckCircle,
  MessageSquare,
  Plus,
  Trash2,
  Edit3,
  Search,
  CheckCircle2,
  Package,
  Paperclip,
  UploadCloud,
  File,
  Image as ImageIcon,
  Download,
  Eye,
  ExternalLink,
} from 'lucide-react';
import {
  Complaint,
  ComplaintItem,
  ComplaintAttachment,
  ComplaintStatus,
  Product,
  STATUS_LABELS,
  User as UserType,
} from '../types';
import { storageService } from '../services/storage';
import { ProductSearchModal } from './ProductSearchModal';

interface ComplaintDetailModalProps {
  complaint: Complaint;
  currentUser: UserType;
  products?: Product[];
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated: (updatedComplaint: Complaint) => void;
}

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  complaint,
  currentUser,
  products = [],
  isOpen,
  onClose,
  onStatusUpdated,
}) => {
  // Status update states
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<ComplaintStatus>(complaint.status);
  const [statusNotes, setStatusNotes] = useState('');
  const [statusErrorMsg, setStatusErrorMsg] = useState('');

  // Items edit & add states
  const [isEditingItems, setIsEditingItems] = useState(false);
  const [editableItems, setEditableItems] = useState<ComplaintItem[]>([]);
  const [itemsChangeNote, setItemsChangeNote] = useState('');
  const [itemsErrorMsg, setItemsErrorMsg] = useState('');

  // Attachments preview & upload states
  const [previewAttachment, setPreviewAttachment] = useState<ComplaintAttachment | null>(null);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);

  // Catalog search modal for item editing
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [activeItemIndexForModal, setActiveItemIndexForModal] = useState<number | null>(null);

  const canChangeStatus = storageService.hasPermission(currentUser, 'canChangeStatus');
  const canEditItems =
    storageService.hasPermission(currentUser, 'canEditComplaints') ||
    storageService.hasPermission(currentUser, 'canRegisterComplaints') ||
    currentUser.role === 'admin' ||
    currentUser.role === 'gestor';

  if (!isOpen) return null;

  // Handle status update
  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStatus === complaint.status && !statusNotes.trim()) {
      setIsUpdatingStatus(false);
      return;
    }

    try {
      const updated = storageService.updateComplaintStatus(
        complaint.id,
        newStatus,
        statusNotes.trim() || undefined
      );
      if (updated) {
        onStatusUpdated(updated);
        setIsUpdatingStatus(false);
        setStatusNotes('');
        setStatusErrorMsg('');
      }
    } catch {
      setStatusErrorMsg('Erro ao atualizar status.');
    }
  };

  // Start items edit
  const handleStartEditItems = () => {
    // Clone items
    setEditableItems(
      complaint.items.map((it) => ({
        ...it,
      }))
    );
    setItemsChangeNote('');
    setItemsErrorMsg('');
    setIsEditingItems(true);
  };

  const handleCancelEditItems = () => {
    setIsEditingItems(false);
    setEditableItems([]);
    setItemsErrorMsg('');
  };

  // Item modifications in edit mode
  const handleItemFieldChange = (
    index: number,
    field: keyof ComplaintItem,
    value: any
  ) => {
    const updated = [...editableItems];
    (updated[index] as any)[field] = value;
    setEditableItems(updated);
  };

  // Reference change with auto-fill from catalog
  const handleReferenceChange = (index: number, refValue: string) => {
    const updated = [...editableItems];
    updated[index].reference = refValue;

    const matched = storageService.findProductByReference(refValue);
    if (matched) {
      updated[index].productName = matched.name;
      updated[index].productId = matched.id;
    }
    setEditableItems(updated);
  };

  const handleAddEditableItem = () => {
    setEditableItems([
      ...editableItems,
      {
        id: `item-${Date.now()}-${editableItems.length}`,
        reference: '',
        productName: '',
        quantity: 1,
        defectDescription: '',
      },
    ]);
  };

  const handleRemoveEditableItem = (index: number) => {
    if (editableItems.length <= 1) {
      setItemsErrorMsg('A ocorrência deve conter pelo menos 1 produto.');
      return;
    }
    setEditableItems(editableItems.filter((_, i) => i !== index));
    setItemsErrorMsg('');
  };

  const handleOpenSearchModal = (index: number) => {
    setActiveItemIndexForModal(index);
    setIsSearchModalOpen(true);
  };

  const handleSelectProductFromModal = (product: Product) => {
    if (activeItemIndexForModal === null) return;
    const updated = [...editableItems];
    updated[activeItemIndexForModal].reference = product.reference;
    updated[activeItemIndexForModal].productName = product.name;
    updated[activeItemIndexForModal].productId = product.id;
    setEditableItems(updated);
    setActiveItemIndexForModal(null);
  };

  const handleSaveItems = (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (editableItems.length === 0) {
      setItemsErrorMsg('Adicione pelo menos 1 produto à ocorrência.');
      return;
    }

    for (let i = 0; i < editableItems.length; i++) {
      const it = editableItems[i];
      if (!it.reference.trim()) {
        setItemsErrorMsg(`O Item #${i + 1} precisa ter uma referência informada.`);
        return;
      }
      if (!it.productName.trim()) {
        setItemsErrorMsg(`O Item #${i + 1} precisa ter um nome de produto.`);
        return;
      }
      if (!it.quantity || it.quantity < 1) {
        setItemsErrorMsg(`O Item #${i + 1} possui quantidade inválida.`);
        return;
      }
      if (!it.defectDescription.trim()) {
        setItemsErrorMsg(`O Item #${i + 1} precisa ter a descrição do defeito preenchida.`);
        return;
      }
    }

    const cleanItems = editableItems.map((it) => ({
      ...it,
      reference: it.reference.trim().toUpperCase(),
      productName: it.productName.trim(),
      defectDescription: it.defectDescription.trim(),
      quantity: Number(it.quantity) || 1,
    }));

    const updated = storageService.updateComplaintItems(
      complaint.id,
      cleanItems,
      itemsChangeNote.trim() || undefined
    );

    if (updated) {
      onStatusUpdated(updated);
      setIsEditingItems(false);
      setItemsErrorMsg('');
    } else {
      setItemsErrorMsg('Erro ao salvar produtos da ocorrência.');
    }
  };

  const handleUploadNewAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingAttachment(true);
    const file = files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const newAtt: ComplaintAttachment = {
        id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        dataUrl: reader.result as string,
        uploadedAt: new Date().toISOString(),
      };
      const updated = storageService.addComplaintAttachment(complaint.id, newAtt);
      setIsUploadingAttachment(false);
      if (updated) {
        onStatusUpdated(updated);
      }
      e.target.value = '';
    };

    reader.onerror = () => {
      setIsUploadingAttachment(false);
      e.target.value = '';
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    const updated = storageService.removeComplaintAttachment(complaint.id, attachmentId);
    if (updated) {
      onStatusUpdated(updated);
    }
  };

  const handleDownloadAttachment = (attachment: ComplaintAttachment) => {
    if (!attachment.dataUrl) return;
    const a = document.createElement('a');
    a.href = attachment.dataUrl;
    a.download = attachment.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    window.print();
  };

  const statusCfg = STATUS_LABELS[complaint.status] || {
    label: complaint.status,
    badge: 'bg-slate-100 text-slate-700',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200">
        {/* Top Header (Azul + Menta) */}
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50/70 to-teal-50/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold text-blue-950 tabular-nums">
                  {complaint.sequentialCode}
                </span>
                <span
                  className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${statusCfg.badge}`}
                >
                  {statusCfg.label}
                </span>
                <span className="text-xs text-slate-500">
                  Prioridade: <strong className="capitalize text-slate-800">{complaint.priority}</strong>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Registrado em {new Date(complaint.createdAt).toLocaleString('pt-BR')} por{' '}
                <strong className="text-slate-700">{complaint.registeredByUserName}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 text-slate-600 hover:text-blue-800 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200"
              title="Imprimir / Exportar Ficha"
            >
              <Printer className="w-4 h-4 text-blue-700" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* Seção 1: Dados do Cliente */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>Dados do Cliente & Cadastro</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Nome / Razão Social</span>
                <span className="font-semibold text-slate-800 text-sm">
                  {complaint.clientName}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Tipo de Cliente</span>
                <span className="inline-flex items-center gap-1 font-medium text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  <Building2 className="w-3 h-3 text-teal-600" />
                  {complaint.clientTypeName}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">CPF / CNPJ</span>
                <span className="font-mono text-slate-800 tabular-nums">
                  {complaint.clientDocument}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Telefone / WhatsApp</span>
                <span className="font-mono text-slate-800 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-teal-600" />
                  {complaint.clientPhone}
                </span>
              </div>

              {complaint.clientEmail && (
                <div>
                  <span className="text-slate-400 block mb-0.5">E-mail</span>
                  <span className="text-slate-800 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-blue-500" />
                    {complaint.clientEmail}
                  </span>
                </div>
              )}

              {complaint.clientCityState && (
                <div>
                  <span className="text-slate-400 block mb-0.5">Cidade / UF</span>
                  <span className="text-slate-800">{complaint.clientCityState}</span>
                </div>
              )}

              {complaint.invoiceNumber && (
                <div>
                  <span className="text-slate-400 block mb-0.5">Nota Fiscal (NF)</span>
                  <span className="font-mono text-slate-800 flex items-center gap-1">
                    <Receipt className="w-3 h-3 text-blue-500" />
                    {complaint.invoiceNumber}
                  </span>
                </div>
              )}

              {complaint.invoiceDate && (
                <div>
                  <span className="text-slate-400 block mb-0.5">Data de Emissão</span>
                  <span className="text-slate-800 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-teal-600" />
                    {new Date(complaint.invoiceDate).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Seção 2: Itens Reclamados & Gestão de Produtos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-teal-600" />
                <span>Itens com Defeito ({complaint.items.length})</span>
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">
                  Total de peças:{' '}
                  <strong className="text-blue-900 font-bold">
                    {complaint.items.reduce((acc, it) => acc + (it.quantity || 1), 0)}
                  </strong>
                </span>
                {canEditItems && !isEditingItems && (
                  <button
                    type="button"
                    onClick={handleStartEditItems}
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors shadow-2xs"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-teal-600" />
                    <span>Alterar ou Adicionar Produtos</span>
                  </button>
                )}
              </div>
            </div>

            {/* Modo de Visualização Padrão */}
            {!isEditingItems && (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3 w-12 text-center">#</th>
                      <th className="py-2.5 px-3 w-32">Referência</th>
                      <th className="py-2.5 px-3">Nome do Produto</th>
                      <th className="py-2.5 px-3 w-16 text-center">Qtd</th>
                      <th className="py-2.5 px-3">Descrição do Defeito</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {complaint.items.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 text-center text-slate-400 font-mono">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">
                          <span className="bg-blue-50 text-blue-900 px-2 py-0.5 rounded border border-blue-200/80">
                            {item.reference}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-800">
                          {item.productName}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900 tabular-nums">
                          {item.quantity}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {item.defectDescription}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* MODO DE EDIÇÃO E ADIÇÃO DE PRODUTOS */}
            {isEditingItems && (
              <form
                onSubmit={handleSaveItems}
                className="p-4 rounded-xl border border-teal-300 bg-teal-50/20 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-teal-100 pb-2">
                  <div>
                    <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Edit3 className="w-4 h-4 text-teal-600" />
                      <span>Alteração / Adição de Produtos no Chamado</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Modifique itens existentes ou adicione novos. Todas as inclusões e alterações serão gravadas no histórico.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddEditableItem}
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-gradient-to-r from-blue-700 to-teal-600 hover:from-blue-800 hover:to-teal-700 rounded-lg transition-all shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Novo Produto</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {editableItems.map((item, index) => {
                    const matchedProduct = storageService.findProductByReference(item.reference);

                    return (
                      <div
                        key={item.id}
                        className="p-3 bg-white rounded-lg border border-slate-200 space-y-2 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 inline-flex items-center justify-center text-[10px] font-mono font-bold">
                              {index + 1}
                            </span>
                            <span>Item #{index + 1}</span>
                          </span>

                          {editableItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveEditableItem(index)}
                              className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 p-1 hover:bg-red-50 rounded transition-colors"
                              title="Remover produto da ocorrência"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remover</span>
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 text-xs">
                          {/* Referência com auto-lookup */}
                          <div className="md:col-span-3">
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Referência *
                            </label>
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={item.reference}
                                onChange={(e) => handleReferenceChange(index, e.target.value)}
                                placeholder="REF-..."
                                className="w-full px-2.5 py-1.5 text-xs font-mono uppercase bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                              />
                              <button
                                type="button"
                                onClick={() => handleOpenSearchModal(index)}
                                title="Buscar no Catálogo"
                                className="p-1.5 text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg shrink-0"
                              >
                                <Search className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            {matchedProduct && (
                              <span className="text-[10px] text-teal-700 font-semibold flex items-center gap-0.5 mt-0.5">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>No catálogo</span>
                              </span>
                            )}
                          </div>

                          {/* Nome do Produto */}
                          <div className="md:col-span-7">
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Nome do Produto * (Preenchimento Automático)
                            </label>
                            <input
                              type="text"
                              value={item.productName}
                              onChange={(e) =>
                                handleItemFieldChange(index, 'productName', e.target.value)
                              }
                              placeholder="Identificado pela referência..."
                              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                            />
                          </div>

                          {/* Quantidade */}
                          <div className="md:col-span-2">
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Qtd *
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
                              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-mono tabular-nums"
                            />
                          </div>

                          {/* Descrição do Defeito */}
                          <div className="md:col-span-12">
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Descrição do Defeito *
                            </label>
                            <input
                              type="text"
                              value={item.defectDescription}
                              onChange={(e) =>
                                handleItemFieldChange(index, 'defectDescription', e.target.value)
                              }
                              placeholder="Descreva o sintoma ou anomalia apresentada..."
                              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Justificativa da Alteração */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Justificativa / Motivo da Alteração (registrada no histórico):
                  </label>
                  <input
                    type="text"
                    value={itemsChangeNote}
                    onChange={(e) => setItemsChangeNote(e.target.value)}
                    placeholder="Ex: Cliente comunicou 2º item com defeito após abertura inicial do chamado..."
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>

                {itemsErrorMsg && (
                  <p className="text-xs text-red-600 flex items-center gap-1 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{itemsErrorMsg}</span>
                  </p>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-teal-100">
                  <button
                    type="button"
                    onClick={handleCancelEditItems}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-700 to-teal-600 hover:from-blue-800 hover:to-teal-700 rounded-lg transition-all flex items-center gap-1.5 shadow-2xs"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-teal-200" />
                    <span>Salvar Alterações e Registrar no Histórico</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Seção 2.5: Anexos e Evidências da Ocorrência */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-teal-600" />
                  <span>
                    Anexos & Evidências ({complaint.attachments?.length || 0})
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Fotos de defeitos, comprovantes de entrega, laudos de bancada ou notas fiscais anexadas.
                </p>
              </div>

              {/* Botão de Adicionar Novo Anexo à Ocorrência */}
              <div className="relative shrink-0">
                <input
                  type="file"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  onChange={handleUploadNewAttachment}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  title="Anexar novo arquivo a esta ocorrência"
                />
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors shadow-2xs pointer-events-none"
                >
                  {isUploadingAttachment ? (
                    <>
                      <div className="w-3 h-3 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-3.5 h-3.5 text-teal-600" />
                      <span>Adicionar Novo Anexo</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Lista de Anexos */}
            {(!complaint.attachments || complaint.attachments.length === 0) ? (
              <div className="py-6 text-center text-slate-400 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                <Paperclip className="w-7 h-7 mx-auto text-slate-300 mb-1.5" />
                <p className="text-xs font-medium text-slate-600">
                  Nenhum arquivo ou foto anexado a esta ocorrência.
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Utilize o botão acima para adicionar fotos do defeito ou comprovantes.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {complaint.attachments.map((att) => {
                  const isImage = att.type.startsWith('image/');
                  const formattedSize =
                    att.size > 1024 * 1024
                      ? `${(att.size / (1024 * 1024)).toFixed(1)} MB`
                      : `${Math.round(att.size / 1024)} KB`;

                  return (
                    <div
                      key={att.id}
                      className="p-3 bg-slate-50 hover:bg-slate-100/90 rounded-xl border border-slate-200 transition-colors flex flex-col justify-between group"
                    >
                      <div className="flex items-start gap-2.5">
                        {/* Thumbnail ou Ícone */}
                        <div
                          className="w-12 h-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs cursor-pointer"
                          onClick={() => setPreviewAttachment(att)}
                          title="Clique para visualizar o anexo"
                        >
                          {isImage && att.dataUrl ? (
                            <img
                              src={att.dataUrl}
                              alt={att.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : isImage ? (
                            <ImageIcon className="w-6 h-6 text-teal-600" />
                          ) : (
                            <File className="w-6 h-6 text-blue-600" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1 text-xs">
                          <p
                            className="font-semibold text-slate-800 truncate"
                            title={att.name}
                          >
                            {att.name}
                          </p>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono mt-0.5">
                            <span>{formattedSize}</span>
                            <span>·</span>
                            <span className="uppercase text-[10px] bg-slate-200/80 px-1 rounded">
                              {att.name.split('.').pop() || 'ARQ'}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {new Date(att.uploadedAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>

                      {/* Botões de Ação do Anexo */}
                      <div className="flex items-center justify-end gap-1.5 mt-2.5 pt-2 border-t border-slate-200/80 text-[11px]">
                        <button
                          type="button"
                          onClick={() => setPreviewAttachment(att)}
                          className="px-2 py-1 text-slate-600 hover:text-teal-700 hover:bg-white rounded transition-colors flex items-center gap-1"
                          title="Visualizar anexo"
                        >
                          <Eye className="w-3.5 h-3.5 text-teal-600" />
                          <span>Ver</span>
                        </button>

                        {att.dataUrl && (
                          <button
                            type="button"
                            onClick={() => handleDownloadAttachment(att)}
                            className="px-2 py-1 text-slate-600 hover:text-blue-700 hover:bg-white rounded transition-colors flex items-center gap-1"
                            title="Baixar arquivo"
                          >
                            <Download className="w-3.5 h-3.5 text-blue-600" />
                            <span>Baixar</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(att.id)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors ml-auto"
                          title="Remover anexo da ocorrência"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Seção 3: Observações Gerais e Resolução */}
          {(complaint.generalNotes || complaint.resolutionNotes) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {complaint.generalNotes && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <span className="font-semibold text-slate-700 block mb-1">
                    Observações Iniciais:
                  </span>
                  <p className="text-slate-600 whitespace-pre-line">
                    {complaint.generalNotes}
                  </p>
                </div>
              )}
              {complaint.resolutionNotes && (
                <div className="bg-teal-50/50 border border-teal-200 rounded-xl p-3">
                  <span className="font-semibold text-teal-900 block mb-1">
                    Tratativa Técnica / Laudo de Encerramento:
                  </span>
                  <p className="text-slate-700 whitespace-pre-line">
                    {complaint.resolutionNotes}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Seção 4: Alteração de Status */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-teal-600" />
                  <span>Tratativa & Mudança de Status</span>
                </h4>
                <p className="text-xs text-slate-500">
                  {canChangeStatus
                    ? 'Avance ou encerre esta ocorrência registrando uma justificativa.'
                    : 'Apenas Gestores, Analistas de Qualidade e Administradores possuem permissão para alterar o status.'}
                </p>
              </div>

              {canChangeStatus && !isUpdatingStatus && (
                <button
                  type="button"
                  onClick={() => setIsUpdatingStatus(true)}
                  className="px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors"
                >
                  Alterar Status / Tratativa
                </button>
              )}
            </div>

            {isUpdatingStatus && (
              <form onSubmit={handleSaveStatus} className="pt-2 border-t border-slate-100 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Novo Status:
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    >
                      <option value="aberto">Aberto</option>
                      <option value="em_analise">Em Análise Técnica</option>
                      <option value="em_tratativa">Em Tratativa Comercial</option>
                      <option value="aguardando_laudo">Aguardando Laudo / Peça</option>
                      <option value="resolvido">Resolvido / Concluído</option>
                      <option value="cancelado">Cancelado / Improcedente</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Observação / Laudo da Movimentação:
                    </label>
                    <input
                      type="text"
                      value={statusNotes}
                      onChange={(e) => setStatusNotes(e.target.value)}
                      placeholder="Ex: Laudo concluído, produto substituído..."
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>
                </div>

                {statusErrorMsg && (
                  <p className="text-xs text-red-600">{statusErrorMsg}</p>
                )}

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsUpdatingStatus(false)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-700 to-teal-600 hover:from-blue-800 hover:to-teal-700 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-teal-200" />
                    <span>Salvar Nova Situação</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Seção 5: Histórico de Auditoria & Linha do Tempo */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              <span>Histórico de Auditoria & Linha do Tempo</span>
            </h4>
            <div className="space-y-3 border-l-2 border-teal-200 ml-2 pl-4 py-1">
              {complaint.history.map((h, i) => {
                const isProductAction =
                  h.action.toLowerCase().includes('produto') ||
                  h.action.toLowerCase().includes('item');
                const isAttachmentAction = h.action.toLowerCase().includes('anexo');
                const isStatusAction = h.action.toLowerCase().includes('status');

                return (
                  <div key={h.id || i} className="relative text-xs">
                    <div
                      className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white shadow-2xs ${
                        isProductAction
                          ? 'bg-teal-600'
                          : isAttachmentAction
                          ? 'bg-blue-600'
                          : isStatusAction
                          ? 'bg-amber-500'
                          : 'bg-slate-400'
                      }`}
                    />
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-800">{h.userName}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-500 font-mono tabular-nums">
                        {new Date(h.date).toLocaleString('pt-BR')}
                      </span>
                      {isProductAction && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 border border-teal-200">
                          <Package className="w-3 h-3 text-teal-700" />
                          <span>Produtos Alterados</span>
                        </span>
                      )}
                      {isAttachmentAction && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                          <Paperclip className="w-3 h-3 text-blue-700" />
                          <span>Anexo</span>
                        </span>
                      )}
                    </div>
                    <p className="text-slate-800 font-semibold mt-0.5 flex items-center gap-1.5">
                      {h.action}
                    </p>
                    {h.notes && (
                      <div
                        className={`text-[11px] mt-1.5 p-2.5 rounded-lg border whitespace-pre-line ${
                          isProductAction
                            ? 'bg-teal-50/60 border-teal-200 text-teal-950 font-medium'
                            : isAttachmentAction
                            ? 'bg-blue-50/60 border-blue-200 text-blue-950 font-medium'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        {h.notes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Identificador único: {complaint.id}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium transition-colors"
          >
            Fechar Visualização
          </button>
        </div>
      </div>

      {/* Modal de Busca no Catálogo para alteração de produtos */}
      <ProductSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        products={products}
        onSelectProduct={handleSelectProductFromModal}
      />

      {/* Modal de Pré-Visualização de Anexo (Foto / Documento) */}
      {previewAttachment && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[85vh]">
            <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <Paperclip className="w-4 h-4 text-teal-600 shrink-0" />
                <span className="font-semibold text-xs text-slate-800 truncate">
                  {previewAttachment.name}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  ({(previewAttachment.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <div className="flex items-center gap-2">
                {previewAttachment.dataUrl && (
                  <button
                    type="button"
                    onClick={() => handleDownloadAttachment(previewAttachment)}
                    className="px-2.5 py-1 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 text-teal-600" />
                    <span>Baixar</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewAttachment(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-slate-900/5 min-h-[300px]">
              {previewAttachment.type.startsWith('image/') && previewAttachment.dataUrl ? (
                <img
                  src={previewAttachment.dataUrl}
                  alt={previewAttachment.name}
                  className="max-h-[60vh] max-w-full rounded-lg object-contain shadow-sm"
                />
              ) : previewAttachment.type === 'application/pdf' && previewAttachment.dataUrl ? (
                <iframe
                  src={previewAttachment.dataUrl}
                  title={previewAttachment.name}
                  className="w-full h-[60vh] rounded-lg border border-slate-200"
                />
              ) : (
                <div className="text-center p-8 text-slate-500">
                  <File className="w-16 h-16 mx-auto text-blue-500 mb-3" />
                  <p className="font-semibold text-sm text-slate-800">
                    {previewAttachment.name}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Visualização direta não suportada para este formato ({previewAttachment.type || 'arquivo'}).
                  </p>
                  {previewAttachment.dataUrl && (
                    <button
                      type="button"
                      onClick={() => handleDownloadAttachment(previewAttachment)}
                      className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs inline-flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Fazer Download do Arquivo</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
