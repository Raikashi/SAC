import React, { useState } from 'react';
import {
  FileText,
  PlusCircle,
  BarChart3,
  Building2,
  Package,
  Users,
  ChevronDown,
  RotateCcw,
  Check,
} from 'lucide-react';
import { User, ROLE_LABELS } from '../types';

export type NavTab =
  | 'list'
  | 'new'
  | 'reports'
  | 'client_types'
  | 'products'
  | 'users';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  currentUser: User;
  users: User[];
  onSwitchUser: (user: User) => void;
  onResetData: () => void;
  canViewReports: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  users,
  onSwitchUser,
  onResetData,
  canViewReports,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-2xs">
      {/* Decorative top accent line combining blue and fresh mint */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-700 via-blue-500 to-teal-400" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-8 h-16">
        {/* Zone 1: Brand Wordmark (Single text element with blue + mint identity) */}
        <button
          type="button"
          onClick={() => onSelectTab('list')}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 flex items-center gap-2.5 hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-700 to-teal-500 text-white flex items-center justify-center font-black text-sm shadow-xs">
            SG
          </div>
          <span className="flex items-center gap-1.5">
            <span className="text-blue-900 font-extrabold">SAC</span>
            <span className="text-teal-600 font-semibold">Gestor</span>
          </span>
        </button>

        {/* Zone 2: Single-line navigation tabs */}
        <nav className="hidden lg:flex items-center gap-1.5 shrink-0 text-xs font-semibold">
          <button
            type="button"
            onClick={() => onSelectTab('list')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              currentTab === 'list'
                ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs'
                : 'text-slate-600 hover:text-blue-800 hover:bg-slate-50'
            }`}
          >
            <FileText className={`w-3.5 h-3.5 ${currentTab === 'list' ? 'text-blue-600' : 'text-slate-400'}`} />
            <span>Ocorrências</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('new')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              currentTab === 'new'
                ? 'bg-teal-50 text-teal-800 border border-teal-200/80 shadow-2xs'
                : 'text-slate-600 hover:text-teal-700 hover:bg-slate-50'
            }`}
          >
            <PlusCircle className={`w-3.5 h-3.5 ${currentTab === 'new' ? 'text-teal-600' : 'text-slate-400'}`} />
            <span>Nova Reclamação</span>
          </button>

          {canViewReports && (
            <button
              type="button"
              onClick={() => onSelectTab('reports')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                currentTab === 'reports'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs'
                  : 'text-slate-600 hover:text-blue-800 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className={`w-3.5 h-3.5 ${currentTab === 'reports' ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>Relatórios</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onSelectTab('client_types')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              currentTab === 'client_types'
                ? 'bg-teal-50 text-teal-800 border border-teal-200/80 shadow-2xs'
                : 'text-slate-600 hover:text-teal-700 hover:bg-slate-50'
            }`}
          >
            <Building2 className={`w-3.5 h-3.5 ${currentTab === 'client_types' ? 'text-teal-600' : 'text-slate-400'}`} />
            <span>Tipos de Clientes</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('products')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              currentTab === 'products'
                ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs'
                : 'text-slate-600 hover:text-blue-800 hover:bg-slate-50'
            }`}
          >
            <Package className={`w-3.5 h-3.5 ${currentTab === 'products' ? 'text-blue-600' : 'text-slate-400'}`} />
            <span>Cadastro de Produtos</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('users')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              currentTab === 'users'
                ? 'bg-teal-50 text-teal-800 border border-teal-200/80 shadow-2xs'
                : 'text-slate-600 hover:text-teal-700 hover:bg-slate-50'
            }`}
          >
            <Users className={`w-3.5 h-3.5 ${currentTab === 'users' ? 'text-teal-600' : 'text-slate-400'}`} />
            <span>Usuários & Acesso</span>
          </button>
        </nav>

        {/* Zone 3: Active User Profile & Quick Role Switcher */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-teal-300 bg-slate-50 hover:bg-teal-50/40 transition-colors text-left"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-700 to-teal-500 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
              {currentUser.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <span className="text-xs font-semibold text-slate-800 block leading-tight">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-teal-700 font-medium">
                {ROLE_LABELS[currentUser.role]?.label || currentUser.role}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Switch User Dropdown */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/50">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Simulador de Controle de Acesso
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Alterne entre usuários para testar permissões e restrições:
                </p>
              </div>

              <div className="py-1 max-h-60 overflow-y-auto divide-y divide-slate-50">
                {users.map((u) => {
                  const isCurrent = u.id === currentUser.id;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        onSwitchUser(u);
                        setIsUserMenuOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-xs flex items-center justify-between transition-colors ${
                        isCurrent
                          ? 'bg-teal-50/80 text-teal-900 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="font-medium text-slate-900">{u.name}</div>
                        <div className="text-[11px] text-teal-700">
                          {ROLE_LABELS[u.role]?.label}
                        </div>
                      </div>
                      {isCurrent && <Check className="w-4 h-4 text-teal-600" />}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 px-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onResetData();
                  }}
                  className="w-full px-2 py-1.5 text-[11px] text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 justify-center"
                >
                  <RotateCcw className="w-3 h-3 text-teal-600" />
                  <span>Restaurar Registros de Exemplo</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile navigation bar */}
      <div className="lg:hidden px-4 py-2 bg-slate-50 border-t border-slate-200 overflow-x-auto flex items-center gap-2 text-xs">
        <button
          type="button"
          onClick={() => onSelectTab('list')}
          className={`px-2.5 py-1 rounded-md shrink-0 transition-colors ${
            currentTab === 'list'
              ? 'bg-blue-600 text-white font-medium'
              : 'text-slate-700 bg-white border border-slate-200'
          }`}
        >
          Ocorrências
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('new')}
          className={`px-2.5 py-1 rounded-md shrink-0 transition-colors ${
            currentTab === 'new'
              ? 'bg-teal-600 text-white font-medium'
              : 'text-slate-700 bg-white border border-slate-200'
          }`}
        >
          Nova Reclamação
        </button>
        {canViewReports && (
          <button
            type="button"
            onClick={() => onSelectTab('reports')}
            className={`px-2.5 py-1 rounded-md shrink-0 transition-colors ${
              currentTab === 'reports'
                ? 'bg-blue-600 text-white font-medium'
                : 'text-slate-700 bg-white border border-slate-200'
            }`}
          >
            Relatórios
          </button>
        )}
        <button
          type="button"
          onClick={() => onSelectTab('client_types')}
          className={`px-2.5 py-1 rounded-md shrink-0 transition-colors ${
            currentTab === 'client_types'
              ? 'bg-teal-600 text-white font-medium'
              : 'text-slate-700 bg-white border border-slate-200'
          }`}
        >
          Tipos de Clientes
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('products')}
          className={`px-2.5 py-1 rounded-md shrink-0 transition-colors ${
            currentTab === 'products'
              ? 'bg-blue-600 text-white font-medium'
              : 'text-slate-700 bg-white border border-slate-200'
          }`}
        >
          Cadastro de Produtos
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('users')}
          className={`px-2.5 py-1 rounded-md shrink-0 transition-colors ${
            currentTab === 'users'
              ? 'bg-teal-600 text-white font-medium'
              : 'text-slate-700 bg-white border border-slate-200'
          }`}
        >
          Usuários
        </button>
      </div>
    </header>
  );
};
