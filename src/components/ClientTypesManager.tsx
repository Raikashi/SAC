import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';
import { ClientType, User } from '../types';
import { storageService } from '../services/storage';

interface ClientTypesManagerProps {
  clientTypes: ClientType[];
  currentUser: User;
  onRefresh: () => void;
}

export const ClientTypesManager: React.FC<ClientTypesManagerProps> = ({
  clientTypes,
  currentUser,
  onRefresh,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeDescription, setNewTypeDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const canManage = storageService.hasPermission(currentUser, 'canManageClientTypes');

  const complaints = storageService.getComplaints();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim()) {
      setErrorMsg('Informe o nome do tipo de cliente.');
      return;
    }

    const exists = clientTypes.some(
      (t) => t.name.trim().toLowerCase() === newTypeName.trim().toLowerCase()
    );
    if (exists) {
      setErrorMsg('Já existe um tipo de cliente cadastrado com este nome.');
      return;
    }

    storageService.addClientType(newTypeName.trim(), newTypeDescription.trim());
    setNewTypeName('');
    setNewTypeDescription('');
    setIsAdding(false);
    setErrorMsg('');
    onRefresh();
  };

  const handleStartEdit = (type: ClientType) => {
    setEditingId(type.id);
    setEditName(type.name);
    setEditDescription(type.description || '');
  };

  const handleSaveEdit = (id: string) => {
    if (!editName.trim()) return;
    storageService.updateClientType(id, editName.trim(), editDescription.trim());
    setEditingId(null);
    onRefresh();
  };

  const handleDelete = (type: ClientType) => {
    const usageCount = complaints.filter((c) => c.clientTypeId === type.id).length;
    if (usageCount > 0) {
      if (
        !window.confirm(
          `Existem ${usageCount} ocorrência(s) vinculadas ao tipo "${type.name}". Deseja realmente remover?`
        )
      ) {
        return;
      }
    } else {
      if (!window.confirm(`Deseja remover o tipo de cliente "${type.name}"?`)) {
        return;
      }
    }

    storageService.deleteClientType(type.id);
    onRefresh();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-700">
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            <Building2 className="w-4 h-4 text-blue-600" />
            <span className="text-blue-950 font-bold">Base Estrutural</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            TIPOS DE CLIENTES
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gerenciamento da base de tipos de clientes (ex: Consumidor Final, Lojista) utilizada nas listas suspensas de reclamação.
          </p>
        </div>

        {canManage ? (
          <button
            type="button"
            onClick={() => {
              setIsAdding(true);
              setErrorMsg('');
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-700 to-teal-600 hover:from-blue-800 hover:to-teal-700 rounded-lg transition-all flex items-center gap-1.5 shrink-0 shadow-xs"
          >
            <Plus className="w-4 h-4 text-teal-200" />
            <span>Novo Tipo de Cliente</span>
          </button>
        ) : (
          <div className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Apenas Administradores e Gestores podem alterar este banco.</span>
          </div>
        )}
      </div>

      {/* Form de Adicionar Novo Tipo */}
      {isAdding && canManage && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-xl border border-teal-200 p-5 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-teal-900 uppercase tracking-wider">
              Cadastrar Novo Tipo de Cliente
            </h3>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome do Tipo de Cliente *
              </label>
              <input
                type="text"
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
                placeholder="Ex: Lojista Parceiro, Consumidor Final, Cooperativa..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Descrição ou Regra Comercial
              </label>
              <input
                type="text"
                value={newTypeDescription}
                onChange={(e) => setNewTypeDescription(e.target.value)}
                placeholder="Ex: Compras no atacado com faturamento mensal"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errorMsg}</span>
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-700 to-teal-600 hover:from-blue-800 hover:to-teal-700 rounded-lg transition-all flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Salvar no Banco "TIPOS DE CLIENTES"</span>
            </button>
          </div>
        </form>
      )}

      {/* Lista de Tipos */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Tipos Cadastrados no Sistema ({clientTypes.length})
          </h2>
          <span className="text-xs text-slate-400">
            Disponíveis para seleção no formulário de atendimento
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {clientTypes.map((type) => {
            const usageCount = complaints.filter((c) => c.clientTypeId === type.id).length;
            const isEditing = editingId === type.id;

            return (
              <div
                key={type.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-teal-50/20 transition-colors"
              >
                {isEditing ? (
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 pr-4">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500"
                    />
                    <input
                      type="text"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Descrição opcional"
                      className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500"
                    />
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-900">
                        {type.name}
                      </span>
                      {type.isDefault && (
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-teal-50 text-teal-800 border border-teal-200 rounded">
                          Padrão do Sistema
                        </span>
                      )}
                      <span className="text-xs text-slate-400">
                        ({usageCount} {usageCount === 1 ? 'ocorrência vinculada' : 'ocorrências vinculadas'})
                      </span>
                    </div>
                    {type.description && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        {type.description}
                      </p>
                    )}
                  </div>
                )}

                {canManage && (
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(type.id)}
                          className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                          title="Salvar alterações"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Cancelar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(type)}
                          className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(type)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir tipo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
