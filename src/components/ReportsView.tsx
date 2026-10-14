import React, { useState, useMemo } from 'react';
import {
  Calendar,
  BarChart3,
  PieChart,
  Printer,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  Package,
  Layers,
  ArrowUpRight,
  RotateCcw,
  Check,
  X,
  FilterX,
  Eye,
} from 'lucide-react';
import {
  Complaint,
  ClientType,
  ComplaintStatus,
  STATUS_LABELS,
} from '../types';

interface ReportsViewProps {
  complaints: Complaint[];
  clientTypes: ClientType[];
  onSelectComplaint?: (complaint: Complaint) => void;
}

type ReportType = 'quantity' | 'status';

export const ReportsView: React.FC<ReportsViewProps> = ({
  complaints,
  clientTypes,
  onSelectComplaint,
}) => {
  const [reportType, setReportType] = useState<ReportType>('quantity');

  // Date range filters (Default: last 60 days or all)
  const defaultStartDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 60);
    return d.toISOString().slice(0, 10);
  }, []);

  const defaultEndDate = useMemo(() => {
    return new Date().toISOString().slice(0, 10);
  }, []);

  const [startDate, setStartDate] = useState<string>(defaultStartDate);
  const [endDate, setEndDate] = useState<string>(defaultEndDate);
  const [selectedClientTypeId, setSelectedClientTypeId] = useState<string>('all');

  // Status drill-down filter in Status Report ("Aberto", "Em Análise", "em Tratativa", etc. ou "all" para Sem Filtro)
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<ComplaintStatus | 'all'>('all');

  // Quick preset filters
  const applyPreset = (preset: '7days' | '30days' | 'thisMonth' | 'all') => {
    const now = new Date();
    const endStr = now.toISOString().slice(0, 10);
    setEndDate(endStr);

    if (preset === '7days') {
      const start = new Date();
      start.setDate(now.getDate() - 7);
      setStartDate(start.toISOString().slice(0, 10));
    } else if (preset === '30days') {
      const start = new Date();
      start.setDate(now.getDate() - 30);
      setStartDate(start.toISOString().slice(0, 10));
    } else if (preset === 'thisMonth') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(start.toISOString().slice(0, 10));
    } else if (preset === 'all') {
      setStartDate('2025-01-01');
    }
  };

  // Filter complaints within date range and client type
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const itemDate = c.createdAt.slice(0, 10);
      const inRange = (!startDate || itemDate >= startDate) && (!endDate || itemDate <= endDate);
      const matchClientType =
        selectedClientTypeId === 'all' || c.clientTypeId === selectedClientTypeId;
      return inRange && matchClientType;
    });
  }, [complaints, startDate, endDate, selectedClientTypeId]);

  // Complaints filtered for the Status drill-down table
  const statusTableComplaints = useMemo(() => {
    if (selectedStatusFilter === 'all') {
      return filteredComplaints;
    }
    return filteredComplaints.filter((c) => c.status === selectedStatusFilter);
  }, [filteredComplaints, selectedStatusFilter]);

  // Quantity Report Calculations
  const quantityMetrics = useMemo(() => {
    const totalRecords = filteredComplaints.length;
    const totalItems = filteredComplaints.reduce(
      (sum, c) => sum + c.items.length,
      0
    );
    const totalPieces = filteredComplaints.reduce(
      (sum, c) =>
        sum + c.items.reduce((itemSum, it) => itemSum + (Number(it.quantity) || 1), 0),
      0
    );

    // Calculate days in period
    let daysDiff = 1;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      daysDiff = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
    }
    const dailyAverage = (totalRecords / daysDiff).toFixed(2);

    // Distribution by client type
    const byClientType: Record<string, { count: number; pieces: number; name: string }> = {};
    clientTypes.forEach((t) => {
      byClientType[t.id] = { count: 0, pieces: 0, name: t.name };
    });

    filteredComplaints.forEach((c) => {
      const typeId = c.clientTypeId;
      if (!byClientType[typeId]) {
        byClientType[typeId] = { count: 0, pieces: 0, name: c.clientTypeName };
      }
      byClientType[typeId].count += 1;
      const pieces = c.items.reduce((acc, it) => acc + (Number(it.quantity) || 1), 0);
      byClientType[typeId].pieces += pieces;
    });

    // Top claimed products
    const productCounts: Record<string, { reference: string; name: string; count: number; pieces: number }> = {};
    filteredComplaints.forEach((c) => {
      c.items.forEach((it) => {
        const ref = it.reference || 'SEM_REF';
        if (!productCounts[ref]) {
          productCounts[ref] = {
            reference: ref,
            name: it.productName || 'Não especificado',
            count: 0,
            pieces: 0,
          };
        }
        productCounts[ref].count += 1;
        productCounts[ref].pieces += Number(it.quantity) || 1;
      });
    });

    const topProducts = Object.values(productCounts)
      .sort((a, b) => b.pieces - a.pieces)
      .slice(0, 5);

    return {
      totalRecords,
      totalItems,
      totalPieces,
      dailyAverage,
      daysDiff,
      byClientType: Object.values(byClientType).filter((t) => t.count > 0 || totalRecords === 0),
      topProducts,
    };
  }, [filteredComplaints, clientTypes, startDate, endDate]);

  // Status Report Calculations
  const statusMetrics = useMemo(() => {
    const total = filteredComplaints.length;
    const statusKeys: ComplaintStatus[] = [
      'aberto',
      'em_analise',
      'em_tratativa',
      'aguardando_laudo',
      'resolvido',
      'cancelado',
    ];

    const distribution: Record<
      ComplaintStatus,
      { count: number; pieces: number; percentage: number }
    > = {
      aberto: { count: 0, pieces: 0, percentage: 0 },
      em_analise: { count: 0, pieces: 0, percentage: 0 },
      em_tratativa: { count: 0, pieces: 0, percentage: 0 },
      aguardando_laudo: { count: 0, pieces: 0, percentage: 0 },
      resolvido: { count: 0, pieces: 0, percentage: 0 },
      cancelado: { count: 0, pieces: 0, percentage: 0 },
    };

    filteredComplaints.forEach((c) => {
      if (distribution[c.status]) {
        distribution[c.status].count += 1;
        const pieces = c.items.reduce((acc, it) => acc + (Number(it.quantity) || 1), 0);
        distribution[c.status].pieces += pieces;
      }
    });

    statusKeys.forEach((k) => {
      distribution[k].percentage = total > 0 ? (distribution[k].count / total) * 100 : 0;
    });

    const resolvedCount = distribution.resolvido.count;
    const resolvedRate = total > 0 ? ((resolvedCount / total) * 100).toFixed(1) : '0';

    return {
      total,
      distribution,
      resolvedRate,
      statusKeys,
    };
  }, [filteredComplaints]);

  // Export functions
  const handleExportCSV = () => {
    if (reportType === 'quantity') {
      const headers = ['Código', 'Data', 'Cliente', 'Tipo de Cliente', 'Peças Reclamadas', 'Produtos'];
      const rows = filteredComplaints.map((c) => [
        c.sequentialCode,
        new Date(c.createdAt).toLocaleDateString('pt-BR'),
        `"${c.clientName.replace(/"/g, '""')}"`,
        `"${c.clientTypeName}"`,
        c.items.reduce((acc, it) => acc + (it.quantity || 1), 0),
        `"${c.items.map((i) => `${i.reference} (${i.productName})`).join('; ')}"`,
      ]);
      const csv = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
      const link = document.createElement('a');
      link.href = encodeURI(csv);
      link.download = `relatorio_quantidade_${startDate}_a_${endDate}.csv`;
      link.click();
    } else {
      if (selectedStatusFilter !== 'all') {
        const headers = ['Status', 'Código', 'Data Abertura', 'Cliente', 'Tipo de Cliente', 'Itens', 'Peças', 'Última Tratativa'];
        const rows = statusTableComplaints.map((c) => [
          `"${STATUS_LABELS[c.status]?.label || c.status}"`,
          c.sequentialCode,
          new Date(c.createdAt).toLocaleDateString('pt-BR'),
          `"${c.clientName.replace(/"/g, '""')}"`,
          `"${c.clientTypeName}"`,
          c.items.length,
          c.items.reduce((acc, it) => acc + (it.quantity || 1), 0),
          `"${(c.history[c.history.length - 1]?.action || 'Registro inicial').replace(/"/g, '""')}"`,
        ]);
        const csv = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
        const link = document.createElement('a');
        link.href = encodeURI(csv);
        link.download = `relatorio_status_${selectedStatusFilter}_${startDate}_a_${endDate}.csv`;
        link.click();
      } else {
        const headers = ['Status', 'Total de Ocorrências', 'Peças Totais', 'Percentual (%)'];
        const rows = statusMetrics.statusKeys.map((k) => [
          `"${STATUS_LABELS[k]?.label || k}"`,
          statusMetrics.distribution[k].count,
          statusMetrics.distribution[k].pieces,
          `${statusMetrics.distribution[k].percentage.toFixed(1)}%`,
        ]);
        const csv = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
        const link = document.createElement('a');
        link.href = encodeURI(csv);
        link.download = `relatorio_status_${startDate}_a_${endDate}.csv`;
        link.click();
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Report Header & Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-700 mb-1">
              <span className="w-2 h-2 rounded-full bg-teal-500" />
              <span className="text-blue-900 font-bold">Painel Analítico</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              Relatórios Gerenciais de Reclamações
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Análises de volume de chamados e distribuição de status dentro do período selecionado
            </p>
          </div>

          {/* Report Type Selector (Segmented buttons com Azul & Menta) */}
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => setReportType('quantity')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
                reportType === 'quantity'
                  ? 'bg-gradient-to-r from-blue-700 to-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Quantidade por Período</span>
            </button>
            <button
              type="button"
              onClick={() => setReportType('status')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
                reportType === 'status'
                  ? 'bg-gradient-to-r from-blue-700 to-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PieChart className="w-4 h-4" />
              <span>Status das Ocorrências</span>
            </button>
          </div>
        </div>

        {/* Date Filters & Presets */}
        <div className="pt-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          {/* Data Inicial */}
          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-teal-600" />
              <span>Data Inicial</span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          {/* Data Final */}
          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-teal-600" />
              <span>Data Final</span>
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          {/* Filtro Tipo de Cliente */}
          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Tipo de Cliente</span>
            </label>
            <select
              value={selectedClientTypeId}
              onChange={(e) => setSelectedClientTypeId(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-700"
            >
              <option value="all">Todos os Tipos</option>
              {clientTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="md:col-span-3 flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex-1 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:border-teal-300 hover:bg-teal-50/40 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              title="Exportar dados do relatório para arquivo CSV"
            >
              <Download className="w-3.5 h-3.5 text-teal-600" />
              <span>Exportar</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              title="Imprimir visualização do relatório"
            >
              <Printer className="w-3.5 h-3.5 text-blue-600" />
              <span>Imprimir</span>
            </button>
          </div>

          {/* Fast Preset Links */}
          <div className="md:col-span-12 flex items-center gap-2 pt-1 text-xs text-slate-500 flex-wrap">
            <span className="text-slate-400 text-[11px]">Atalhos rápidos:</span>
            <button
              type="button"
              onClick={() => applyPreset('7days')}
              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 text-[11px] transition-colors"
            >
              Últimos 7 dias
            </button>
            <button
              type="button"
              onClick={() => applyPreset('30days')}
              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 text-[11px] transition-colors"
            >
              Últimos 30 dias
            </button>
            <button
              type="button"
              onClick={() => applyPreset('thisMonth')}
              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 text-[11px] transition-colors"
            >
              Mês Atual
            </button>
            <button
              type="button"
              onClick={() => applyPreset('all')}
              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 text-[11px] transition-colors"
            >
              Todo o Período
            </button>
            <span className="text-slate-400 ml-auto text-[11px] font-mono">
              Período: {startDate} até {endDate} ({quantityMetrics.daysDiff} dias)
            </span>
          </div>
        </div>
      </div>

      {/* REPORT CONTENT 1: QUANTIDADE DE REGISTROS DENTRO DO PERÍODO */}
      {reportType === 'quantity' && (
        <div className="space-y-6">
          {/* KPI Cards (Combinação Azul & Menta) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Total de Ocorrências no Período
              </span>
              <p className="font-mono text-3xl font-bold text-blue-950 mt-2 tabular-nums">
                {quantityMetrics.totalRecords}
              </p>
              <span className="text-xs text-slate-400 mt-1 block">
                Registros sequenciados abertos
              </span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-teal-200/80 shadow-xs bg-gradient-to-br from-white to-teal-50/30">
              <span className="text-xs font-semibold text-teal-800 uppercase tracking-wider block">
                Total de Peças com Defeito
              </span>
              <p className="font-mono text-3xl font-bold text-teal-700 mt-2 tabular-nums">
                {quantityMetrics.totalPieces}
              </p>
              <span className="text-xs text-teal-600/80 mt-1 block font-medium">
                Unidades físicas reclamadas
              </span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Média de Ocorrências / Dia
              </span>
              <p className="font-mono text-3xl font-bold text-slate-900 mt-2 tabular-nums">
                {quantityMetrics.dailyAverage}
              </p>
              <span className="text-xs text-slate-400 mt-1 block">
                Calculado em {quantityMetrics.daysDiff} dias de janela
              </span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Média de Peças por Ocorrência
              </span>
              <p className="font-mono text-3xl font-bold text-blue-900 mt-2 tabular-nums">
                {quantityMetrics.totalRecords > 0
                  ? (quantityMetrics.totalPieces / quantityMetrics.totalRecords).toFixed(1)
                  : '0'}
              </p>
              <span className="text-xs text-slate-400 mt-1 block">
                Itens defeituosos por chamado
              </span>
            </div>
          </div>

          {/* Breakdown by Client Type (Consumidor Final vs Lojista etc.) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-teal-600" />
                <span>Volume por Tipo de Cliente (Banco TIPOS DE CLIENTES)</span>
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Comparativo da quantidade de registros entre Consumidor Final, Lojista e parceiros
              </p>

              <div className="space-y-3">
                {quantityMetrics.byClientType.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">
                    Nenhum registro para este período
                  </p>
                ) : (
                  quantityMetrics.byClientType.map((ct) => {
                    const pct =
                      quantityMetrics.totalRecords > 0
                        ? (ct.count / quantityMetrics.totalRecords) * 100
                        : 0;

                    return (
                      <div key={ct.name} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-700">
                            {ct.name}
                          </span>
                          <span className="font-mono text-slate-600 tabular-nums">
                            {ct.count} ocorrências ({pct.toFixed(1)}%) · {ct.pieces} peças
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-600 to-teal-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Top Claimed Products */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-blue-600" />
                <span>Top Produtos Mais Reclamados no Período</span>
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Identificação por Referência e volume de unidades afetadas
              </p>

              <div className="space-y-3">
                {quantityMetrics.topProducts.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">
                    Nenhum produto com defeito registrado no período
                  </p>
                ) : (
                  quantityMetrics.topProducts.map((p, idx) => (
                    <div
                      key={p.reference}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs"
                    >
                      <div className="min-w-0 pr-3">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-900 font-mono text-[11px] font-bold inline-flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="font-mono font-bold text-blue-950 bg-white px-2 py-0.5 rounded border border-blue-200/80">
                            {p.reference}
                          </span>
                          <span className="font-medium text-slate-800 truncate">
                            {p.name}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono font-bold text-teal-700 tabular-nums block">
                          {p.pieces} {p.pieces === 1 ? 'peça' : 'peças'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {p.count} chamados
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Itemized Table of Records in Period */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Registros Individuais no Período ({filteredComplaints.length})
              </h3>
              <span className="text-xs text-slate-500">
                Ordenado por sequência de registro
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Código</th>
                    <th className="py-2.5 px-4">Data</th>
                    <th className="py-2.5 px-4">Cliente</th>
                    <th className="py-2.5 px-4">Tipo</th>
                    <th className="py-2.5 px-4 text-center">Itens</th>
                    <th className="py-2.5 px-4 text-center">Peças</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredComplaints.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        Nenhuma ocorrência registrada no intervalo de datas definido.
                      </td>
                    </tr>
                  ) : (
                    filteredComplaints.map((c) => {
                      const st = STATUS_LABELS[c.status] || {
                        label: c.status,
                        badge: 'bg-slate-100 text-slate-700',
                      };
                      const pieces = c.items.reduce(
                        (acc, it) => acc + (it.quantity || 1),
                        0
                      );

                      return (
                        <tr key={c.id} className="hover:bg-slate-50/60">
                          <td className="py-2.5 px-4 font-mono font-bold text-blue-950 tabular-nums">
                            {c.sequentialCode}
                          </td>
                          <td className="py-2.5 px-4 text-slate-500 font-mono tabular-nums">
                            {new Date(c.createdAt).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="py-2.5 px-4 font-medium text-slate-800">
                            {c.clientName}
                          </td>
                          <td className="py-2.5 px-4 text-slate-600">
                            {c.clientTypeName}
                          </td>
                          <td className="py-2.5 px-4 text-center font-mono tabular-nums">
                            {c.items.length}
                          </td>
                          <td className="py-2.5 px-4 text-center font-mono font-bold text-blue-950 tabular-nums">
                            {pieces}
                          </td>
                          <td className="py-2.5 px-4">
                            <span
                              className={`px-2 py-0.5 text-[11px] font-semibold rounded-full border ${st.badge}`}
                            >
                              {st.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REPORT CONTENT 2: STATUS DAS OCORRÊNCIAS DENTRO DO PERÍODO */}
      {reportType === 'status' && (
        <div className="space-y-6">
          {/* Status Distribution Summary Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Distribuição Visual de Status no Período
                </h3>
                <p className="text-xs text-slate-500">
                  Proporção de chamados em cada etapa do ciclo de vida da ocorrência
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500">Taxa de Resolução:</span>
                <span className="font-mono text-lg font-bold text-teal-700 ml-1.5 tabular-nums">
                  {statusMetrics.resolvedRate}%
                </span>
              </div>
            </div>

            {/* Segmented Distribution Bar (Clickable) */}
            <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
              {statusMetrics.total === 0 ? (
                <div className="w-full h-full bg-slate-200" />
              ) : (
                statusMetrics.statusKeys.map((k) => {
                  const cfg = STATUS_LABELS[k];
                  const pct = statusMetrics.distribution[k].percentage;
                  if (pct === 0) return null;
                  const isSelected = selectedStatusFilter === k;

                  return (
                    <button
                      type="button"
                      key={k}
                      onClick={() => setSelectedStatusFilter((prev) => (prev === k ? 'all' : k))}
                      title={`Clique para filtrar por ${cfg.label}: ${pct.toFixed(1)}% (${statusMetrics.distribution[k].count})`}
                      style={{
                        width: `${pct}%`,
                        backgroundColor: cfg.color,
                      }}
                      className={`h-full transition-all duration-200 cursor-pointer hover:opacity-90 focus:outline-none ${
                        isSelected ? 'ring-2 ring-slate-900 ring-inset' : ''
                      }`}
                    />
                  );
                })
              )}
            </div>

            {/* Legend (Clickable chips to filter status) */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-600">
              <span className="text-[11px] font-semibold text-slate-400 mr-1 uppercase tracking-wider">
                Filtrar por:
              </span>
              {statusMetrics.statusKeys.map((k) => {
                const cfg = STATUS_LABELS[k];
                const item = statusMetrics.distribution[k];
                const isSelected = selectedStatusFilter === k;

                return (
                  <button
                    type="button"
                    key={k}
                    onClick={() => setSelectedStatusFilter((prev) => (prev === k ? 'all' : k))}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all text-xs font-medium border ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs font-semibold'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                    title={`Clique para filtrar por ${cfg.label}`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cfg.color }}
                    />
                    <span>{cfg.label}:</span>
                    <strong className="font-mono tabular-nums">{item.count}</strong>
                    {isSelected && <Check className="w-3 h-3 text-teal-400 ml-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Filter Control Bar with "Sem Filtro" Button */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
                <Filter className="w-4 h-4 text-teal-600" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <span>Filtrar Detalhamento por Ocorrência</span>
                  {selectedStatusFilter !== 'all' && (
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                        STATUS_LABELS[selectedStatusFilter]?.badge || ''
                      }`}
                    >
                      {STATUS_LABELS[selectedStatusFilter]?.label}
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Clique em um dos cartões abaixo para filtrar os registros ou use o botão ao lado para ver todos.
                </p>
              </div>
            </div>

            {/* BOTÃO SEM FILTRO (Para quando clicado aparecer o detalhamento dos registros por completo) */}
            <button
              type="button"
              onClick={() => setSelectedStatusFilter('all')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 shadow-2xs shrink-0 ${
                selectedStatusFilter === 'all'
                  ? 'bg-gradient-to-r from-blue-700 to-teal-600 text-white shadow-xs'
                  : 'bg-white hover:bg-teal-50 text-teal-800 border border-teal-300 font-bold hover:border-teal-400'
              }`}
              title="Limpar filtros e exibir o detalhamento completo de todas as ocorrências"
            >
              {selectedStatusFilter === 'all' ? (
                <>
                  <Check className="w-4 h-4 text-teal-200" />
                  <span>Sem Filtro (Exibindo Todos: {filteredComplaints.length})</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4 text-teal-600" />
                  <span>Sem Filtro (Mostrar Completo: {filteredComplaints.length})</span>
                </>
              )}
            </button>
          </div>

          {/* Cards for each Status (Clicáveis para filtrar o detalhamento) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {statusMetrics.statusKeys.map((k) => {
              const cfg = STATUS_LABELS[k];
              const st = statusMetrics.distribution[k];
              const isSelected = selectedStatusFilter === k;

              return (
                <div
                  key={k}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedStatusFilter((prev) => (prev === k ? 'all' : k))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedStatusFilter((prev) => (prev === k ? 'all' : k));
                    }
                  }}
                  className={`bg-white rounded-xl p-5 shadow-xs relative overflow-hidden cursor-pointer transition-all duration-200 text-left select-none border ${
                    isSelected
                      ? 'border-2 border-teal-600 shadow-md bg-teal-50/20 ring-2 ring-teal-500/20 scale-[1.01]'
                      : 'border-slate-200 hover:border-teal-300 hover:shadow-md'
                  }`}
                  title={`Clique para filtrar o detalhamento por "${cfg.label}"`}
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ backgroundColor: cfg.color }}
                  />

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: cfg.color }}
                      />
                      <span>{cfg.label}</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      {isSelected && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-900 text-white flex items-center gap-1 shadow-2xs">
                          <Check className="w-3 h-3 text-teal-300" />
                          <span>Filtrado</span>
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 text-[11px] font-semibold rounded-full border ${cfg.badge}`}
                      >
                        {st.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-baseline justify-between">
                    <div>
                      <span className="font-mono text-3xl font-bold text-slate-900 tabular-nums">
                        {st.count}
                      </span>
                      <span className="text-xs text-slate-500 ml-1.5">
                        {st.count === 1 ? 'ocorrência' : 'ocorrências'}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-sm font-semibold text-slate-700 tabular-nums">
                        {st.pieces}
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        peças afetadas
                      </span>
                    </div>
                  </div>

                  {/* Indicador de ação ao clicar */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span
                      className={`font-semibold ${
                        isSelected ? 'text-teal-700' : 'text-slate-400'
                      }`}
                    >
                      {isSelected
                        ? '✓ Filtro ativo na tabela (clique para desmarcar)'
                        : 'Clique para filtrar na tabela'}
                    </span>
                    <ArrowUpRight
                      className={`w-3.5 h-3.5 transition-transform ${
                        isSelected
                          ? 'text-teal-700 rotate-90'
                          : 'text-slate-300 group-hover:text-slate-500'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Grouped Status Drill-down Table (Filtrada com base na escolha acima) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Detalhamento dos Registros por Situação
                  </h3>
                  {selectedStatusFilter !== 'all' ? (
                    <span
                      className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${
                        STATUS_LABELS[selectedStatusFilter]?.badge || ''
                      } flex items-center gap-1`}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: STATUS_LABELS[selectedStatusFilter]?.color }}
                      />
                      <span>Filtrado: {STATUS_LABELS[selectedStatusFilter]?.label}</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-slate-200/80 text-slate-700">
                      Sem Filtro (Todos)
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedStatusFilter !== 'all'
                    ? `Exibindo ${statusTableComplaints.length} de ${filteredComplaints.length} chamados com a situação selecionada`
                    : `Total de ${statusTableComplaints.length} chamados registrados no período`}
                </p>
              </div>

              {/* Botão Sem Filtro dentro do cabeçalho da tabela */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedStatusFilter('all')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs ${
                    selectedStatusFilter === 'all'
                      ? 'bg-white text-slate-500 border border-slate-200'
                      : 'bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 font-bold'
                  }`}
                  title="Mostrar o detalhamento dos registros por completo (Sem Filtro)"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-teal-600" />
                  <span>
                    {selectedStatusFilter === 'all'
                      ? 'Sem Filtro (Completo)'
                      : 'Limpar Filtro / Sem Filtro'}
                  </span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Código</th>
                    <th className="py-2.5 px-4">Data Abertura</th>
                    <th className="py-2.5 px-4">Cliente</th>
                    <th className="py-2.5 px-4">Tipo de Cliente</th>
                    <th className="py-2.5 px-4 text-center">Itens / Peças</th>
                    <th className="py-2.5 px-4">Última Tratativa</th>
                    {onSelectComplaint && <th className="py-2.5 px-4 text-right">Ação</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {statusTableComplaints.length === 0 ? (
                    <tr>
                      <td colSpan={onSelectComplaint ? 8 : 7} className="py-10 text-center text-slate-400">
                        <AlertCircle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        <p className="text-sm font-semibold text-slate-700">
                          {selectedStatusFilter !== 'all'
                            ? `Nenhuma ocorrência com status "${STATUS_LABELS[selectedStatusFilter]?.label}" encontrada no período selecionado.`
                            : 'Nenhum registro encontrado no intervalo de datas definido.'}
                        </p>
                        {selectedStatusFilter !== 'all' && (
                          <button
                            type="button"
                            onClick={() => setSelectedStatusFilter('all')}
                            className="mt-3 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-700 to-teal-600 rounded-lg shadow-xs hover:from-blue-800 hover:to-teal-700 transition-colors inline-flex items-center gap-1.5"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Remover Filtro (Exibir Todos os {filteredComplaints.length} Registros)</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    statusTableComplaints.map((c) => {
                      const cfg = STATUS_LABELS[c.status];
                      const lastHist = c.history[c.history.length - 1];
                      const totalPieces = c.items.reduce(
                        (acc, it) => acc + (Number(it.quantity) || 1),
                        0
                      );

                      return (
                        <tr
                          key={c.id}
                          className="hover:bg-teal-50/20 transition-colors cursor-pointer group"
                          onClick={() => onSelectComplaint?.(c)}
                        >
                          <td className="py-2.5 px-4">
                            <span
                              className={`px-2 py-0.5 text-[11px] font-semibold rounded-full border ${cfg.badge}`}
                            >
                              {cfg.label}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 font-mono font-bold text-blue-950 tabular-nums">
                            {c.sequentialCode}
                          </td>
                          <td className="py-2.5 px-4 text-slate-500 font-mono tabular-nums">
                            {new Date(c.createdAt).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="py-2.5 px-4 font-medium text-slate-800 group-hover:text-teal-700 transition-colors">
                            {c.clientName}
                          </td>
                          <td className="py-2.5 px-4 text-slate-600">
                            <span className="inline-flex items-center gap-1 text-[11px] bg-slate-100 px-2 py-0.5 rounded">
                              <Building2 className="w-3 h-3 text-teal-600" />
                              <span>{c.clientTypeName}</span>
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-center font-mono tabular-nums">
                            <span className="font-semibold text-slate-800">
                              {c.items.length} {c.items.length === 1 ? 'item' : 'itens'}
                            </span>
                            <span className="text-slate-400 text-[11px] block">
                              ({totalPieces} {totalPieces === 1 ? 'peça' : 'peças'})
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-slate-500 max-w-xs truncate" title={lastHist?.notes || lastHist?.action}>
                            {lastHist ? lastHist.action : 'Registro inicial'}
                          </td>
                          {onSelectComplaint && (
                            <td className="py-2.5 px-4 text-right whitespace-nowrap">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectComplaint(c);
                                }}
                                className="px-2.5 py-1 text-xs font-semibold text-teal-700 hover:text-teal-900 hover:bg-teal-50 rounded border border-transparent hover:border-teal-200 transition-colors inline-flex items-center gap-1"
                                title="Ver detalhes da ocorrência"
                              >
                                <Eye className="w-3.5 h-3.5 text-teal-600" />
                                <span>Ver</span>
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
