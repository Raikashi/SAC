import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Building2,
  Calendar,
  AlertCircle,
  Download,
  CheckCircle2,
  Clock,
  Sparkles,
  Paperclip,
} from 'lucide-react';
import {
  Complaint,
  ClientType,
  ComplaintStatus,
  STATUS_LABELS,
  User,
} from '../types';
import { storageService } from '../services/storage';

interface ComplaintsListProps {
  complaints: Complaint[];
  clientTypes: ClientType[];
  currentUser: User;
  onSelectComplaint: (complaint: Complaint) => void;
  onNavigateToNew: () => void;
}

export const ComplaintsList: React.FC<ComplaintsListProps> = ({
  complaints,
  clientTypes,
  currentUser,
  onSelectComplaint,
  onNavigateToNew,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [clientTypeFilter, setClientTypeFilter] = useState<string>('all');

  const canRegister = storageService.hasPermission(currentUser, 'canRegisterComplaints');

  // Metrics summary
  const metrics = useMemo(() => {
    const total = complaints.length;
    const abertos = complaints.filter((c) => c.status === 'aberto').length;
    const emTratativa = complaints.filter(
      (c) => c.status === 'em_analise' || c.status === 'em_tratativa' || c.status === 'aguardando_laudo'
    ).length;
    const resolvidos = complaints.filter((c) => c.status === 'resolvido').length;
    const cancelados = complaints.filter((c) => c.status === 'cancelado').length;
    return { total, abertos, emTratativa, resolvidos, cancelados };
  }, [complaints]);

  // Filtered list
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const matchSearch =
        c.sequentialCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.clientDocument.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.items.some(
          (it) =>
            it.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
            it.productName.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      const matchType = clientTypeFilter === 'all' || c.clientTypeId === clientTypeFilter;

      return matchSearch && matchStatus && matchType;
    });
  }, [complaints, searchTerm, statusFilter, clientTypeFilter]);

  // Export CSV helper
  const handleExportCSV = () => {
    const headers = [
      'Código Sequencial',
      'Data de Abertura',
      'Cliente',
      'Tipo de Cliente',
      'CPF/CNPJ',
      'Telefone',
      'Status',
      'Prioridade',
      'Quantidade de Itens',
      'Peças Totais',
      'Referências dos Produtos',
    ];

    const rows = filteredComplaints.map((c) => [
      c.sequentialCode,
      new Date(c.createdAt).toLocaleDateString('pt-BR'),
      `"${c.clientName.replace(/"/g, '""')}"`,
      `"${c.clientTypeName}"`,
      c.clientDocument,
      c.clientPhone,
      STATUS_LABELS[c.status]?.label || c.status,
      c.priority,
      c.items.length,
      c.items.reduce((acc, it) => acc + (it.quantity || 1), 0),
      `"${c.items.map((it) => it.reference).join(', ')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reclamacoes_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row (Equilíbrio Azul & Menta) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total: Azul Forte */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total de Ocorrências
            </span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
              <Sparkles className="w-4 h-4 text-blue-600" />
            </span>
          </div>
          <p className="font-mono text-2xl font-bold text-blue-950 mt-2 tabular-nums">
            {metrics.total}
          </p>
          <span className="text-xs text-slate-400 mt-0.5 block">
            Registros sequenciados
          </span>
        </div>

        {/* Abertos: Azul Claro */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Abertos / Triagem
            </span>
            <span className="p-1.5 rounded-lg bg-sky-50 text-sky-700">
              <AlertCircle className="w-4 h-4 text-sky-600" />
            </span>
          </div>
          <p className="font-mono text-2xl font-bold text-sky-700 mt-2 tabular-nums">
            {metrics.abertos}
          </p>
          <span className="text-xs text-slate-400 mt-0.5 block">
            Aguardando análise técnica
          </span>
        </div>

        {/* Em Tratativa: Âmbar Suave */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Em Tratativa / Laudo
            </span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
              <Clock className="w-4 h-4 text-amber-600" />
            </span>
          </div>
          <p className="font-mono text-2xl font-bold text-amber-700 mt-2 tabular-nums">
            {metrics.emTratativa}
          </p>
          <span className="text-xs text-slate-400 mt-0.5 block">
            Em verificação / peças
          </span>
        </div>

        {/* Resolvidos: Menta Fresca */}
        <div className="bg-white p-4 rounded-xl border border-teal-200/80 shadow-2xs bg-gradient-to-br from-white to-teal-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-teal-800 uppercase tracking-wider">
              Concluídos / Resolvidos
            </span>
            <span className="p-1.5 rounded-lg bg-teal-100 text-teal-700">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
            </span>
          </div>
          <p className="font-mono text-2xl font-bold text-teal-700 mt-2 tabular-nums">
            {metrics.resolvidos}
          </p>
          <span className="text-xs text-teal-600/80 mt-0.5 block font-medium">
            Finalizados com êxito
          </span>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Top Controls */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-2 max-w-xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filtrar por código (REC-...), cliente, CPF/CNPJ ou referência do produto..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            {/* Filter by Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shrink-0 text-slate-700"
            >
              <option value="all">Todos os Status</option>
              <option value="aberto">Aberto</option>
              <option value="em_analise">Em Análise</option>
              <option value="em_tratativa">Em Tratativa</option>
              <option value="aguardando_laudo">Aguardando Laudo</option>
              <option value="resolvido">Resolvido</option>
              <option value="cancelado">Cancelado</option>
            </select>

            {/* Filter by Client Type (Database TIPOS DE CLIENTES) */}
            <select
              value={clientTypeFilter}
              onChange={(e) => setClientTypeFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shrink-0 text-slate-700"
            >
              <option value="all">Todos os Tipos de Cliente</option>
              {clientTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Action buttons (Combinação de Menta e Azul) */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:border-teal-300 hover:bg-teal-50/40 rounded-lg transition-colors flex items-center gap-1.5"
              title="Exportar dados filtrados para CSV"
            >
              <Download className="w-3.5 h-3.5 text-teal-600" />
              <span>Exportar CSV</span>
            </button>

            {canRegister && (
              <button
                type="button"
                onClick={onNavigateToNew}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-700 to-teal-600 hover:from-blue-800 hover:to-teal-700 rounded-lg transition-all flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 text-teal-200" />
                <span>Nova Reclamação</span>
              </button>
            )}
          </div>
        </div>

        {/* Complaints Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Código Sequencial</th>
                <th className="py-3 px-4">Data</th>
                <th className="py-3 px-4">Cliente / Razão Social</th>
                <th className="py-3 px-4">Tipo de Cliente</th>
                <th className="py-3 px-4">Produtos / Peças</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Prioridade</th>
                <th className="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <AlertCircle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-medium">Nenhuma ocorrência encontrada</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Ajuste os filtros de pesquisa ou registre uma nova reclamação.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((c) => {
                  const statusInfo = STATUS_LABELS[c.status] || {
                    label: c.status,
                    badge: 'bg-slate-100 text-slate-700',
                  };
                  const totalPieces = c.items.reduce(
                    (acc, it) => acc + (it.quantity || 1),
                    0
                  );

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-teal-50/20 transition-colors cursor-pointer group"
                      onClick={() => onSelectComplaint(c)}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-blue-950 tabular-nums">
                            {c.sequentialCode}
                          </span>
                          {c.attachments && c.attachments.length > 0 && (
                            <span
                              className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-teal-800 bg-teal-50 border border-teal-200/80 px-1.5 py-0.5 rounded-full"
                              title={`${c.attachments.length} anexo(s) disponível(is)`}
                            >
                              <Paperclip className="w-2.5 h-2.5 text-teal-600" />
                              <span>{c.attachments.length}</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono tabular-nums whitespace-nowrap">
                        {new Date(c.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900 group-hover:text-teal-700 transition-colors">
                          {c.clientName}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                          {c.clientDocument}
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          <Building2 className="w-3 h-3 text-teal-600" />
                          {c.clientTypeName}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-medium text-slate-800">
                            {c.items.length} {c.items.length === 1 ? 'item' : 'itens'} ({totalPieces} {totalPieces === 1 ? 'peça' : 'peças'})
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono truncate max-w-xs">
                          {c.items.map((it) => it.reference).join(', ')}
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full border ${statusInfo.badge}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="capitalize text-slate-700 text-xs font-medium">
                          {c.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectComplaint(c);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-blue-700 hover:text-teal-700 hover:bg-teal-50 rounded border border-transparent hover:border-teal-200 transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5 text-teal-600" />
                          <span>Ver / Tratar</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer info */}
        <div className="px-4 py-3 bg-slate-50/60 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>
            Exibindo <strong>{filteredComplaints.length}</strong> de{' '}
            <strong>{complaints.length}</strong> ocorrências
          </span>
          <span className="text-slate-400">
            Clique na linha para visualizar todos os detalhes e o histórico de auditoria
          </span>
        </div>
      </div>
    </div>
  );
};
