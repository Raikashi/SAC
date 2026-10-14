import React, { useState } from 'react';
import {
  Users,
  Shield,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  AlertCircle,
  LogIn,
  KeyRound,
  ShieldCheck,
  UserCheck,
  CheckSquare,
  Square,
  UserCog,
  AlertTriangle,
} from 'lucide-react';
import {
  User,
  UserRole,
  ROLE_LABELS,
  ROLE_DEFAULT_PERMISSIONS,
} from '../types';
import { storageService } from '../services/storage';

interface UsersAndAccessManagerProps {
  users: User[];
  currentUser: User;
  onRefresh: () => void;
  onSwitchUser: (user: User) => void;
}

export const UsersAndAccessManager: React.FC<UsersAndAccessManagerProps> = ({
  users,
  currentUser,
  onRefresh,
  onSwitchUser,
}) => {
  // New user form states
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState<UserRole>('atendente');
  const [status, setStatus] = useState<'ativo' | 'inativo'>('ativo');
  const [errorMsg, setErrorMsg] = useState('');

  // Editing user name state (only for admin)
  const [editingNameUserId, setEditingNameUserId] = useState<string | null>(null);
  const [editingNameValue, setEditingNameValue] = useState<string>('');

  // Selected checkboxes for users
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [batchRoleValue, setBatchRoleValue] = useState<UserRole | ''>('');

  // In-app deletion modal state (replaces window.confirm to avoid iframe blocking)
  const [deleteModalUser, setDeleteModalUser] = useState<User | null>(null);
  const [isDeletingSelfError, setIsDeletingSelfError] = useState(false);
  const [isConfirmingBatchDelete, setIsConfirmingBatchDelete] = useState(false);

  // Success / info feedback banner
  const [feedbackMsg, setFeedbackMsg] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const isAdmin = currentUser.role === 'admin';
  const canManageUsers = storageService.hasPermission(currentUser, 'canManageUsers') || isAdmin;

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 4500);
  };

  // Checkbox toggle
  const toggleSelectUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUserIds.length === users.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(users.map((u) => u.id));
    }
  };

  // Edit user name (Admin only)
  const handleStartEditName = (u: User) => {
    if (!isAdmin) {
      showFeedback('error', 'Apenas o Administrador pode alterar a descrição do nome do usuário.');
      return;
    }
    setEditingNameUserId(u.id);
    setEditingNameValue(u.name);
  };

  const handleSaveName = (userId: string) => {
    if (!isAdmin) return;
    if (!editingNameValue.trim()) {
      showFeedback('error', 'O nome do usuário não pode ficar em branco.');
      return;
    }

    const updated = storageService.updateUserName(userId, editingNameValue.trim());
    if (updated) {
      showFeedback('success', `Nome alterado com sucesso para "${updated.name}".`);
      setEditingNameUserId(null);
      setEditingNameValue('');
      onRefresh();
    }
  };

  const handleCancelEditName = () => {
    setEditingNameUserId(null);
    setEditingNameValue('');
  };

  // Change single user role (when checkbox is checked & is admin)
  const handleChangeRole = (userId: string, newRole: UserRole) => {
    if (!isAdmin) {
      showFeedback('error', 'Apenas o Administrador possui permissão para alterar a função do usuário.');
      return;
    }

    const updated = storageService.updateUserRole(userId, newRole);
    if (updated) {
      const roleLabel = ROLE_LABELS[newRole]?.label || newRole;
      showFeedback('success', `Função de "${updated.name}" alterada para "${roleLabel}".`);
      onRefresh();
    }
  };

  // Batch role change for selected checkboxes
  const handleApplyBatchRole = () => {
    if (!isAdmin) {
      showFeedback('error', 'Apenas o Administrador pode alterar funções de usuários.');
      return;
    }
    if (!batchRoleValue || selectedUserIds.length === 0) return;

    selectedUserIds.forEach((id) => {
      storageService.updateUserRole(id, batchRoleValue as UserRole);
    });

    const roleLabel = ROLE_LABELS[batchRoleValue as UserRole]?.label;
    showFeedback('success', `Função alterada para "${roleLabel}" em ${selectedUserIds.length} usuário(s).`);
    setSelectedUserIds([]);
    setBatchRoleValue('');
    onRefresh();
  };

  // Add new user
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Nome é obrigatório.');
      return;
    }
    if (!email.trim()) {
      setErrorMsg('E-mail é obrigatório.');
      return;
    }

    const emailExists = users.some(
      (u) => u.email.trim().toLowerCase() === email.trim().toLowerCase()
    );
    if (emailExists) {
      setErrorMsg('Já existe um usuário cadastrado com este e-mail.');
      return;
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      department: department.trim() || 'Atendimento',
      role,
      status,
      createdAt: new Date().toISOString(),
    };

    const updated = [...users, newUser];
    storageService.saveUsers(updated);
    setIsAdding(false);
    setName('');
    setEmail('');
    setDepartment('');
    setErrorMsg('');
    showFeedback('success', `Usuário "${newUser.name}" cadastrado com sucesso.`);
    onRefresh();
  };

  // Open delete modal
  const handleRequestDelete = (u: User) => {
    if (u.id === currentUser.id) {
      setIsDeletingSelfError(true);
      return;
    }
    setDeleteModalUser(u);
  };

  // Confirm delete (Executed via React modal - safe against iframe window.confirm blocks)
  const handleConfirmDelete = () => {
    if (!deleteModalUser) return;

    const targetUser = deleteModalUser;
    const success = storageService.deleteUser(targetUser.id);
    if (success) {
      // Also uncheck if selected
      setSelectedUserIds((prev) => prev.filter((id) => id !== targetUser.id));
      setDeleteModalUser(null);
      showFeedback('success', `Usuário "${targetUser.name}" excluído com sucesso.`);
      onRefresh();
    } else {
      showFeedback('error', 'Não foi possível excluir o usuário.');
      setDeleteModalUser(null);
    }
  };

  // Batch delete selected users
  const handleBatchDelete = () => {
    if (selectedUserIds.length === 0) return;

    // Filter out current active session user
    const idsToDelete = selectedUserIds.filter((id) => id !== currentUser.id);
    const selfIncluded = selectedUserIds.includes(currentUser.id);

    if (idsToDelete.length === 0 && selfIncluded) {
      setIsConfirmingBatchDelete(false);
      setIsDeletingSelfError(true);
      return;
    }

    let deletedCount = 0;
    idsToDelete.forEach((id) => {
      const ok = storageService.deleteUser(id);
      if (ok) deletedCount++;
    });

    setSelectedUserIds([]);
    setIsConfirmingBatchDelete(false);
    showFeedback(
      'success',
      `${deletedCount} usuário(s) excluído(s) com sucesso.${
        selfIncluded ? ' (O usuário da sessão ativa foi mantido).' : ''
      }`
    );
    onRefresh();
  };

  const permissionsList = [
    { key: 'canRegisterComplaints', label: 'Registrar Novas Reclamações' },
    { key: 'canChangeStatus', label: 'Alterar Status & Emitir Laudos' },
    { key: 'canViewReports', label: 'Visualizar Relatórios Gerenciais' },
    { key: 'canManageProducts', label: 'Gerenciar Cadastro de Produtos' },
    { key: 'canManageClientTypes', label: 'Gerenciar Tipos de Clientes' },
    { key: 'canManageUsers', label: 'Administrar Usuários & Permissões' },
    { key: 'canDeleteRecords', label: 'Exclusão de Registros Críticos' },
  ];

  const rolesArray: UserRole[] = ['admin', 'gestor', 'qualidade', 'atendente'];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Toast Feedback */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between shadow-sm animate-fade-in ${
            feedbackMsg.type === 'success'
              ? 'bg-teal-50 border-teal-300 text-teal-900'
              : 'bg-red-50 border-red-300 text-red-900'
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-semibold">
            {feedbackMsg.type === 'success' ? (
              <Check className="w-4 h-4 text-teal-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-700">
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            <Users className="w-4 h-4 text-blue-600" />
            <span className="text-blue-950 font-bold">Segurança & Governança</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Cadastro de Usuários & Controle de Acesso (RBAC)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isAdmin ? (
              <span className="text-teal-700 font-semibold">
                Modo Administrador Ativo: Você pode alterar a descrição do nome, marcar a caixa de seleção para alterar a função e excluir usuários.
              </span>
            ) : (
              'Controle granular de acessos por perfil funcional. Alteração de nomes e funções é restrita ao Administrador.'
            )}
          </p>
        </div>

        {canManageUsers ? (
          <button
            type="button"
            onClick={() => {
              setIsAdding(true);
              setErrorMsg('');
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-700 to-teal-600 hover:from-blue-800 hover:to-teal-700 rounded-lg transition-all flex items-center gap-1.5 shrink-0 shadow-xs"
          >
            <Plus className="w-4 h-4 text-teal-200" />
            <span>Cadastrar Usuário</span>
          </button>
        ) : (
          <div className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
            Apenas Administradores podem adicionar ou alterar usuários.
          </div>
        )}
      </div>

      {/* Add User Form */}
      {isAdding && canManageUsers && (
        <form
          onSubmit={handleCreateUser}
          className="bg-white rounded-xl border border-teal-200 p-6 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-teal-600" />
              <span>Novo Cadastro de Colaborador</span>
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
                Nome Completo *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: João Ferreira da Silva"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                E-mail Corporativo *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="joao.silva@empresa.com.br"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cargo / Setor
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Ex: Central SAC - Turno Tarde"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Perfil de Acesso (Nível de Permissão) *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                <option value="admin">Administrador (Acesso Irrestrito)</option>
                <option value="gestor">Gestor SAC (Supervisão & Relatórios)</option>
                <option value="qualidade">Analista de Qualidade (Tratativas Técnicas)</option>
                <option value="atendente">Atendente SAC (Registro de Ocorrências)</option>
              </select>
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errorMsg}</span>
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
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
              <span>Salvar Usuário</span>
            </button>
          </div>
        </form>
      )}

      {/* Batch Actions Bar (when checkboxes are selected and current user is admin) */}
      {selectedUserIds.length > 0 && isAdmin && (
        <div className="p-3 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl border border-teal-300 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-semibold text-slate-800">
              <strong className="text-teal-800 font-bold">{selectedUserIds.length}</strong> usuário(s) selecionado(s) com a checkbox:
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-600">Alterar função em lote:</span>
            <select
              value={batchRoleValue}
              onChange={(e) => setBatchRoleValue(e.target.value as UserRole)}
              className="px-2.5 py-1 text-xs bg-white border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 font-medium text-slate-800"
            >
              <option value="">Selecione a nova função...</option>
              <option value="admin">Administrador</option>
              <option value="gestor">Gestor SAC</option>
              <option value="qualidade">Analista de Qualidade</option>
              <option value="atendente">Atendente SAC</option>
            </select>
            <button
              type="button"
              onClick={handleApplyBatchRole}
              disabled={!batchRoleValue}
              className="px-3 py-1 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Aplicar Função</span>
            </button>

            {/* BOTÃO PARA EXCLUIR USUÁRIOS SELECIONADOS */}
            <button
              type="button"
              onClick={() => setIsConfirmingBatchDelete(true)}
              className="px-3 py-1 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-1 shadow-2xs ml-1"
              title="Excluir colaboradores selecionados pela checkbox"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Excluir Selecionado(s)</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedUserIds([])}
              className="px-2 py-1 text-xs text-slate-500 hover:text-slate-700 rounded"
            >
              Desmarcar
            </button>
          </div>
        </div>
      )}

      {/* Users List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="flex items-center gap-1 text-xs text-slate-600 hover:text-teal-700"
              title="Selecionar / desmarcar todos"
            >
              {selectedUserIds.length === users.length ? (
                <CheckSquare className="w-4 h-4 text-teal-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span className="font-semibold text-slate-700 text-xs">
                Usuários Cadastrados ({users.length})
              </span>
            </button>
          </div>
          <span className="text-xs text-slate-400">
            {isAdmin
              ? 'Selecione a checkbox para alterar a função ou clique no lápis para alterar o nome'
              : 'Você pode alternar de sessão para testar permissões'}
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {users.map((u) => {
            const isCurrent = u.id === currentUser.id;
            const roleInfo = ROLE_LABELS[u.role];
            const isSelected = selectedUserIds.includes(u.id);
            const isEditingName = editingNameUserId === u.id;

            return (
              <div
                key={u.id}
                className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors ${
                  isSelected
                    ? 'bg-teal-50/40 border-l-4 border-l-teal-500'
                    : isCurrent
                    ? 'bg-gradient-to-r from-blue-50/30 to-teal-50/30'
                    : 'hover:bg-slate-50/60'
                }`}
              >
                {/* Checkbox na frente de cada usuário + Avatar + Dados do Usuário */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Checkbox na frente do usuário */}
                  <div className="flex items-center pr-1">
                    <input
                      type="checkbox"
                      id={`chk-user-${u.id}`}
                      checked={isSelected}
                      onChange={() => toggleSelectUser(u.id)}
                      className="w-4 h-4 rounded text-teal-600 border-slate-300 focus:ring-teal-500 cursor-pointer"
                      title={
                        isAdmin
                          ? 'Selecione para habilitar alteração da função deste usuário'
                          : 'Seleção de usuário'
                      }
                    />
                  </div>

                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs ${
                      isCurrent
                        ? 'bg-gradient-to-tr from-blue-700 to-teal-500 text-white'
                        : 'bg-blue-100 text-blue-900'
                    }`}
                  >
                    {u.name.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    {/* Linha do Nome do Usuário (Alterável SOMENTE por administrador) */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {isEditingName ? (
                        <div className="flex items-center gap-1.5 py-0.5">
                          <input
                            type="text"
                            value={editingNameValue}
                            onChange={(e) => setEditingNameValue(e.target.value)}
                            className="px-2.5 py-1 text-xs font-semibold bg-white border border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-900"
                            autoFocus
                            placeholder="Digite o novo nome do usuário..."
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveName(u.id)}
                            className="p-1 text-teal-700 hover:bg-teal-100 rounded-md transition-colors"
                            title="Salvar alteração do nome"
                          >
                            <Check className="w-4 h-4 text-teal-700" />
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEditName}
                            className="p-1 text-slate-400 hover:bg-slate-200 rounded-md transition-colors"
                            title="Cancelar edição do nome"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="font-semibold text-sm text-slate-900 truncate">
                            {u.name}
                          </span>

                          {/* Botão de alterar descrição do nome (SOMENTE PARA ADMINISTRADOR) */}
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => handleStartEditName(u)}
                              className="p-1 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded transition-colors"
                              title="Alterar descrição do nome do usuário (Acesso de Administrador)"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {isCurrent && (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-teal-600 text-white rounded-full">
                              Sessão Ativa
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>{u.email}</span>
                      <span>·</span>
                      <span>{u.department}</span>
                    </div>
                  </div>
                </div>

                {/* Coluna da Função / Perfil de Acesso & Ações */}
                <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                  <div className="text-right">
                    {/* QUANDO A CHECKBOX ESTIVER SELECIONADA E FOR ADMINISTRADOR: PERMITE ALTERAR A FUNÇÃO */}
                    {isSelected && isAdmin ? (
                      <div className="flex items-center gap-1.5 bg-teal-50 p-1 rounded-lg border border-teal-300">
                        <UserCog className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                        <select
                          value={u.role}
                          onChange={(e) => handleChangeRole(u.id, e.target.value as UserRole)}
                          className="text-xs font-semibold bg-white border border-teal-300 rounded px-2 py-1 text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer shadow-2xs"
                          title="Alterar função deste usuário selecionado"
                        >
                          <option value="admin">Administrador</option>
                          <option value="gestor">Gestor SAC</option>
                          <option value="qualidade">Analista de Qualidade</option>
                          <option value="atendente">Atendente SAC</option>
                        </select>
                      </div>
                    ) : (
                      <div>
                        <span className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-md bg-teal-50 text-teal-800 border border-teal-200">
                          {roleInfo.label}
                        </span>
                        {isSelected && !isAdmin && (
                          <span className="text-[10px] text-amber-600 block mt-0.5 font-medium">
                            Apenas Administrador altera função
                          </span>
                        )}
                        {!isSelected && isAdmin && (
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Marque a checkbox para mudar função
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                    {/* Botão de Alternar Sessão (login simulator) */}
                    {!isCurrent && (
                      <button
                        type="button"
                        onClick={() => onSwitchUser(u)}
                        className="px-2.5 py-1.5 text-xs font-medium text-teal-800 bg-white hover:bg-teal-50 border border-teal-200 rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                        title="Simular login com esta conta para testar permissões"
                      >
                        <LogIn className="w-3.5 h-3.5 text-teal-600" />
                        <span>Alternar Sessão</span>
                      </button>
                    )}

                    {/* BOTÃO DE EXCLUIR USUÁRIO (Ativo e funcional com confirmação in-app) */}
                    {canManageUsers && (
                      !isCurrent ? (
                        <button
                          type="button"
                          onClick={() => handleRequestDelete(u)}
                          className="px-2.5 py-1 text-xs font-semibold text-red-700 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                          title={`Excluir usuário "${u.name}" do sistema`}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-600 shrink-0" />
                          <span>Excluir</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsDeletingSelfError(true)}
                          className="px-2 py-1 text-xs font-medium text-slate-400 bg-slate-100 border border-slate-200 rounded-lg flex items-center gap-1 cursor-not-allowed opacity-60"
                          title="Não é possível excluir o próprio usuário em sessão ativa"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Excluir</span>
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO DE USUÁRIO */}
      {deleteModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 text-red-600">
                <div className="p-2.5 rounded-full bg-red-100 text-red-600">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Confirmar Exclusão de Usuário
                  </h3>
                  <p className="text-xs text-slate-500">
                    Esta ação removerá o colaborador do sistema
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1">
                <div>
                  <strong>Nome:</strong> {deleteModalUser.name}
                </div>
                <div>
                  <strong>E-mail:</strong> {deleteModalUser.email}
                </div>
                <div>
                  <strong>Função:</strong> {ROLE_LABELS[deleteModalUser.role]?.label}
                </div>
                <div>
                  <strong>Setor:</strong> {deleteModalUser.department}
                </div>
              </div>

              <p className="text-xs text-slate-600">
                Tem certeza de que deseja excluir permanentemente o cadastro de{' '}
                <strong className="text-slate-900">{deleteModalUser.name}</strong>?
              </p>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteModalUser(null)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sim, Excluir Usuário</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ERRO CASO TENTE EXCLUIR O PRÓPRIO USUÁRIO LOGADO */}
      {isDeletingSelfError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertCircle className="w-6 h-6" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Operação Não Permitida
                </h3>
                <p className="text-xs text-slate-500">
                  Você não pode excluir o usuário que está atualmente em sessão ativa.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Para excluir este usuário ({currentUser.name}), primeiro use o botão "Alternar Sessão" para entrar como outro usuário administrador.
            </p>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsDeletingSelfError(false)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO EM LOTE (CHECKBOXES) */}
      {isConfirmingBatchDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 text-red-600">
                <div className="p-2.5 rounded-full bg-red-100 text-red-600">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Confirmar Exclusão de {selectedUserIds.length} Usuário(s)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Exclusão dos colaboradores selecionados pela checkbox
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 max-h-40 overflow-y-auto space-y-1">
                {users
                  .filter((u) => selectedUserIds.includes(u.id))
                  .map((u) => (
                    <div key={u.id} className="flex items-center justify-between py-0.5">
                      <span className="font-medium text-slate-800">{u.name}</span>
                      <span className="text-slate-400 font-mono text-[11px]">{u.email}</span>
                    </div>
                  ))}
              </div>

              <p className="text-xs text-slate-600">
                Tem certeza de que deseja excluir permanentemente os {selectedUserIds.length} colaboradores selecionados?
                {selectedUserIds.includes(currentUser.id) && (
                  <span className="block mt-1 text-amber-600 font-medium">
                    Nota: O usuário atualmente logado ({currentUser.name}) não será excluído por segurança.
                  </span>
                )}
              </p>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsConfirmingBatchDelete(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleBatchDelete}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sim, Excluir Selecionados</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visual Role Permission Matrix (Matriz de Controle de Acesso) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Matriz de Controle de Acesso por Perfil (RBAC)
            </h3>
            <p className="text-xs text-slate-500">
              Regras do sistema que regulam o que cada usuário tem permissão para visualizar e executar
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-semibold">
              <tr>
                <th className="py-2.5 px-4">Permissão / Funcionalidade</th>
                {rolesArray.map((r) => (
                  <th key={r} className="py-2.5 px-4 text-center">
                    {ROLE_LABELS[r].label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {permissionsList.map((perm) => (
                <tr key={perm.key} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-4 font-medium text-slate-800">
                    {perm.label}
                  </td>
                  {rolesArray.map((r) => {
                    const hasPerm = (ROLE_DEFAULT_PERMISSIONS[r] as any)[perm.key];
                    return (
                      <td key={r} className="py-2.5 px-4 text-center">
                        {hasPerm ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-teal-50 text-teal-700 font-bold">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-300">
                            <X className="w-3 h-3" />
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
