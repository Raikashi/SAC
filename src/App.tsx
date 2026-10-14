import React, { useState, useEffect, useCallback } from 'react';
import {
  Navbar,
  NavTab,
} from './components/Navbar';
import { ComplaintsList } from './components/ComplaintsList';
import { ComplaintForm } from './components/ComplaintForm';
import { ComplaintDetailModal } from './components/ComplaintDetailModal';
import { ReportsView } from './components/ReportsView';
import { ClientTypesManager } from './components/ClientTypesManager';
import { ProductsCatalogManager } from './components/ProductsCatalogManager';
import { UsersAndAccessManager } from './components/UsersAndAccessManager';
import {
  Complaint,
  ClientType,
  Product,
  User,
} from './types';
import { storageService } from './services/storage';
import { CheckCircle2, ShieldAlert, Sparkles, AlertTriangle, RotateCcw } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('list');
  const [currentUser, setCurrentUser] = useState<User>(() => storageService.getCurrentUser());
  const [users, setUsers] = useState<User[]>(() => storageService.getUsers());
  const [clientTypes, setClientTypes] = useState<ClientType[]>(() => storageService.getClientTypes());
  const [products, setProducts] = useState<Product[]>(() => storageService.getProducts());
  const [complaints, setComplaints] = useState<Complaint[]>(() => storageService.getComplaints());

  // Modal
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  // Success toast
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // In-app Reset Modal state
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const refreshData = useCallback(() => {
    setUsers(storageService.getUsers());
    setClientTypes(storageService.getClientTypes());
    setProducts(storageService.getProducts());
    setComplaints(storageService.getComplaints());
    setCurrentUser(storageService.getCurrentUser());
  }, []);

  const handleSwitchUser = (user: User) => {
    const updated = storageService.setCurrentUser(user.id);
    setCurrentUser(updated);
  };

  const handleResetData = () => {
    setIsResetModalOpen(true);
  };

  const handleConfirmReset = () => {
    storageService.resetToDefaults();
    refreshData();
    setIsResetModalOpen(false);
    setSuccessToast('Dados de exemplo restaurados com sucesso!');
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleComplaintRegistered = (code: string) => {
    refreshData();
    setCurrentTab('list');
    setSuccessToast(`Ocorrência ${code} registrada e sequenciada com sucesso!`);
    setTimeout(() => setSuccessToast(null), 5000);
  };

  const handleStatusUpdated = (updated: Complaint) => {
    refreshData();
    setSelectedComplaint(updated);
  };

  // Check current user permissions
  const canViewReports = storageService.hasPermission(currentUser, 'canViewReports');
  const canRegister = storageService.hasPermission(currentUser, 'canRegisterComplaints');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        currentUser={currentUser}
        users={users}
        onSwitchUser={handleSwitchUser}
        onResetData={handleResetData}
        canViewReports={canViewReports}
      />

      {/* Success Feedback Notification (Azul e Menta) */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce duration-300">
          <div className="bg-slate-950 text-white px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-3 border border-teal-500/50">
            <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
            <span className="text-xs font-semibold">{successToast}</span>
          </div>
        </div>
      )}

      {/* Main Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TAB 1: LISTA DE OCORRÊNCIAS */}
        {currentTab === 'list' && (
          <ComplaintsList
            complaints={complaints}
            clientTypes={clientTypes}
            currentUser={currentUser}
            onSelectComplaint={(c) => setSelectedComplaint(c)}
            onNavigateToNew={() => setCurrentTab('new')}
          />
        )}

        {/* TAB 2: NOVA RECLAMAÇÃO */}
        {currentTab === 'new' && (
          canRegister ? (
            <ComplaintForm
              onSuccess={handleComplaintRegistered}
              clientTypes={clientTypes}
              products={products}
              onOpenClientTypesManager={() => setCurrentTab('client_types')}
            />
          ) : (
            <div className="max-w-md mx-auto text-center py-16 bg-white rounded-xl border border-slate-200 p-8 shadow-xs">
              <ShieldAlert className="w-12 h-12 mx-auto text-amber-500 mb-3" />
              <h2 className="text-base font-bold text-slate-900">
                Acesso Restrito
              </h2>
              <p className="text-xs text-slate-500 mt-2">
                O perfil do usuário atual ({currentUser.name} - {currentUser.role}) não possui permissão para registrar novas reclamações.
              </p>
              <button
                type="button"
                onClick={() => handleSwitchUser(users[0])}
                className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-700 to-teal-600 rounded-lg hover:from-blue-800 hover:to-teal-700 transition-colors"
              >
                Alternar para Silvio Silva (Admin)
              </button>
            </div>
          )
        )}

        {/* TAB 3: RELATÓRIOS GERENCIAIS */}
        {currentTab === 'reports' && (
          canViewReports ? (
            <ReportsView
              complaints={complaints}
              clientTypes={clientTypes}
              onSelectComplaint={(c) => setSelectedComplaint(c)}
            />
          ) : (
            <div className="max-w-md mx-auto text-center py-16 bg-white rounded-xl border border-slate-200 p-8 shadow-xs">
              <ShieldAlert className="w-12 h-12 mx-auto text-amber-500 mb-3" />
              <h2 className="text-base font-bold text-slate-900">
                Módulo de Relatórios Restrito
              </h2>
              <p className="text-xs text-slate-500 mt-2">
                O acesso aos relatórios é exclusivo para Administradores, Gestores e Analistas de Qualidade.
              </p>
              <button
                type="button"
                onClick={() => handleSwitchUser(users[1])}
                className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-700 to-teal-600 rounded-lg hover:from-blue-800 hover:to-teal-700 transition-colors"
              >
                Alternar para Mariana Costa (Gestor)
              </button>
            </div>
          )
        )}

        {/* TAB 4: TIPOS DE CLIENTES */}
        {currentTab === 'client_types' && (
          <ClientTypesManager
            clientTypes={clientTypes}
            currentUser={currentUser}
            onRefresh={refreshData}
          />
        )}

        {/* TAB 5: CADASTRO DE PRODUTOS */}
        {currentTab === 'products' && (
          <ProductsCatalogManager
            products={products}
            currentUser={currentUser}
            onRefresh={refreshData}
          />
        )}

        {/* TAB 6: USUÁRIOS E CONTROLE DE ACESSO */}
        {currentTab === 'users' && (
          <UsersAndAccessManager
            users={users}
            currentUser={currentUser}
            onRefresh={refreshData}
            onSwitchUser={handleSwitchUser}
          />
        )}
      </main>

      {/* Modal de Detalhes da Ocorrência */}
      {selectedComplaint && (
        <ComplaintDetailModal
          complaint={selectedComplaint}
          currentUser={currentUser}
          products={products}
          isOpen={true}
          onClose={() => setSelectedComplaint(null)}
          onStatusUpdated={handleStatusUpdated}
        />
      )}

      {/* Footer minimalista institucional */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            SAC Gestor · Sistema Integrado de Gestão de Reclamações & Qualidade
          </span>
          <span className="font-mono text-[11px] tabular-nums">
            Sessão Ativa: {currentUser.name} ({currentUser.email})
          </span>
        </div>
      </footer>
      {/* Modal de Confirmação de Restauração de Dados */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 animate-fade-in">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 text-amber-600">
                <div className="p-2.5 rounded-full bg-amber-100 text-amber-600">
                  <RotateCcw className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Restaurar Dados de Exemplo
                  </h3>
                  <p className="text-xs text-slate-500">
                    Reiniciar catálogo, usuários e ocorrências de teste
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Tem certeza que deseja restaurar todos os dados iniciais do sistema? Esta ação irá reinicializar os registros para o padrão de demonstração.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReset}
                  className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-700 to-teal-600 hover:from-blue-800 hover:to-teal-700 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restaurar Dados</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
