import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  Trash2,
  Edit2,
  Check,
  X,
  AlertCircle,
  Tag,
  ShieldAlert,
  Clock,
  History,
} from 'lucide-react';
import { Product, User } from '../types';
import { storageService } from '../services/storage';

interface ProductsCatalogManagerProps {
  products: Product[];
  currentUser: User;
  onRefresh: () => void;
}

export const ProductsCatalogManager: React.FC<ProductsCatalogManagerProps> = ({
  products,
  currentUser,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [reference, setReference] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'ativo' | 'inativo'>('ativo');
  const [changeNote, setChangeNote] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Product History Modal state
  const [viewHistoryProduct, setViewHistoryProduct] = useState<Product | null>(null);

  // In-app product deletion modal
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const canManage = storageService.hasPermission(currentUser, 'canManageProducts');

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory =
        selectedCategory === 'all' || p.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const handleStartAdd = () => {
    setReference('');
    setName('');
    setCategory('Geral');
    setDescription('');
    setStatus('ativo');
    setChangeNote('');
    setErrorMsg('');
    setEditingProduct(null);
    setIsAdding(true);
  };

  const handleStartEdit = (prod: Product) => {
    setReference(prod.reference);
    setName(prod.name);
    setCategory(prod.category);
    setDescription(prod.description || '');
    setStatus(prod.status);
    setChangeNote('');
    setErrorMsg('');
    setEditingProduct(prod);
    setIsAdding(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanRef = reference.trim().toUpperCase();
    const cleanName = name.trim();

    if (!cleanRef) {
      setErrorMsg('Referência é obrigatória.');
      return;
    }
    if (!cleanName) {
      setErrorMsg('Nome do produto é obrigatório.');
      return;
    }

    // Check if reference is taken by another product
    const duplicate = products.find(
      (p) =>
        p.reference.toUpperCase() === cleanRef &&
        (!editingProduct || p.id !== editingProduct.id)
    );
    if (duplicate) {
      setErrorMsg(`A referência "${cleanRef}" já está cadastrada para o produto "${duplicate.name}".`);
      return;
    }

    if (editingProduct) {
      storageService.updateProduct(
        editingProduct.id,
        {
          reference: cleanRef,
          name: cleanName,
          category: category.trim() || 'Geral',
          description: description.trim(),
          status,
        },
        changeNote.trim() || undefined
      );
    } else {
      storageService.addProduct({
        reference: cleanRef,
        name: cleanName,
        category: category.trim() || 'Geral',
        description: description.trim(),
        status,
      });
    }

    setIsAdding(false);
    setEditingProduct(null);
    onRefresh();
  };

  const handleDelete = (prod: Product) => {
    setProductToDelete(prod);
  };

  const handleConfirmDelete = () => {
    if (!productToDelete) return;
    storageService.deleteProduct(productToDelete.id);
    setProductToDelete(null);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-700">
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            <Package className="w-4 h-4 text-blue-600" />
            <span className="text-blue-950 font-bold">Catálogo de Referências</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            CADASTRO DE PRODUTOS
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Catálogo oficial de produtos com histórico de inclusões e alterações auditadas.
          </p>
        </div>

        {canManage ? (
          <button
            type="button"
            onClick={handleStartAdd}
            className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-700 to-teal-600 hover:from-blue-800 hover:to-teal-700 rounded-lg transition-all flex items-center gap-1.5 shrink-0 shadow-xs"
          >
            <Plus className="w-4 h-4 text-teal-200" />
            <span>Novo Produto</span>
          </button>
        ) : (
          <div className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Modo somente leitura. Gestão restrita a Administradores e Gestores.</span>
          </div>
        )}
      </div>

      {/* Add / Edit Form Modal or Panel */}
      {isAdding && canManage && (
        <form
          onSubmit={handleSaveProduct}
          className="bg-white rounded-xl border border-teal-200 p-6 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
              <Package className="w-4 h-4 text-teal-600" />
              <span>
                {editingProduct ? 'Editar Produto do Catálogo' : 'Cadastrar Novo Produto'}
              </span>
            </h3>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Referência (Código Único) *
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Ex: REF-101"
                className="w-full px-3 py-2 text-xs font-mono uppercase bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                autoFocus
              />
              <span className="text-[11px] text-teal-700 mt-1 block font-medium">
                Usada para auto-preenchimento
              </span>
            </div>

            <div className="md:col-span-6">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome do Produto *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Monitor UltraWide 29 LED Full HD"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Categoria / Linha
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ex: Periféricos, Mobiliário..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <div className="md:col-span-9">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Descrição Técnica / Especificação
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalhes adicionais, voltagem, dimensões ou especificações..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status no Catálogo
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'ativo' | 'inativo')}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                <option value="ativo">Ativo (Permite busca)</option>
                <option value="inativo">Inativo (Descontinuado)</option>
              </select>
            </div>

            {editingProduct && (
              <div className="md:col-span-12">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Justificativa da Alteração (gravada no histórico):
                </label>
                <input
                  type="text"
                  value={changeNote}
                  onChange={(e) => setChangeNote(e.target.value)}
                  placeholder="Ex: Atualização do nome comercial e especificação técnica..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
            )}
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
              <span>
                {editingProduct ? 'Salvar Alteração no Histórico' : 'Cadastrar Produto'}
              </span>
            </button>
          </div>
        </form>
      )}

      {/* Products Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Filter Header */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-2 max-w-lg">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar por referência (ex: REF-101), nome ou categoria..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-700"
            >
              <option value="all">Todas as Categorias</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-slate-500">
            Total:{' '}
            <strong className="text-blue-950 font-mono tabular-nums">
              {filteredProducts.length}
            </strong>{' '}
            de {products.length} produtos
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 w-32">Referência</th>
                <th className="py-3 px-4">Nome do Produto</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4">Descrição</th>
                <th className="py-3 px-4 w-24 text-center">Status</th>
                <th className="py-3 px-4 text-right w-36">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-10 text-center text-slate-400"
                  >
                    Nenhum produto cadastrado com os critérios especificados.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const historyCount = p.history ? p.history.length : 1;

                  return (
                    <tr key={p.id} className="hover:bg-teal-50/20 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-blue-950">
                        <span className="bg-blue-50 text-blue-900 px-2 py-0.5 rounded border border-blue-200/80">
                          {p.reference}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {p.name}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <span className="inline-flex items-center gap-1 text-[11px] bg-teal-50 text-teal-800 px-2 py-0.5 rounded border border-teal-100">
                          <Tag className="w-3 h-3 text-teal-600" />
                          {p.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 max-w-sm truncate">
                        {p.description || '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
                            p.status === 'ativo'
                              ? 'bg-teal-50 text-teal-800 border-teal-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {p.status === 'ativo' ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Botão Ver Histórico do Produto */}
                          <button
                            type="button"
                            onClick={() => setViewHistoryProduct(p)}
                            className="px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded border border-slate-200 hover:border-teal-200 transition-colors inline-flex items-center gap-1"
                            title="Visualizar histórico de alterações do produto"
                          >
                            <History className="w-3 h-3 text-teal-600" />
                            <span>Histórico ({historyCount})</span>
                          </button>

                          {canManage && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleStartEdit(p)}
                                className="p-1 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded transition-colors"
                                title="Editar produto"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(p)}
                                className="p-1 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Excluir produto"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Histórico de Alterações do Produto */}
      {viewHistoryProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl overflow-hidden flex flex-col max-h-[80vh] border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-teal-50">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-teal-600" />
                <div>
                  <h3 className="text-sm font-bold text-blue-950">
                    Histórico do Produto: {viewHistoryProduct.reference}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {viewHistoryProduct.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewHistoryProduct(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {(!viewHistoryProduct.history || viewHistoryProduct.history.length === 0) ? (
                <div className="text-xs text-slate-500 py-6 text-center">
                  <p className="font-medium text-slate-700">
                    Produto cadastrado inicialmente em {new Date(viewHistoryProduct.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                  <p className="text-slate-400 mt-1">
                    Nenhuma alteração subsequente registrada.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 border-l-2 border-teal-200 ml-2 pl-4 py-1">
                  {viewHistoryProduct.history.map((h, i) => (
                    <div key={h.id || i} className="relative text-xs">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-teal-600 border-2 border-white shadow-2xs" />
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">{h.userName}</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-500 font-mono tabular-nums">
                          {new Date(h.date).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-slate-800 font-medium mt-0.5">{h.action}</p>
                      {h.details && (
                        <p className="text-slate-600 text-[11px] mt-0.5 bg-slate-50 p-2 rounded border border-slate-200/80">
                          {h.details}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setViewHistoryProduct(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão de Produto */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 animate-fade-in">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 text-red-600">
                <div className="p-2.5 rounded-full bg-red-100 text-red-600">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Confirmar Exclusão do Produto
                  </h3>
                  <p className="text-xs text-slate-500">
                    Remover permanentemente o item do catálogo
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1">
                <div>
                  <strong>Referência:</strong> {productToDelete.reference}
                </div>
                <div>
                  <strong>Nome:</strong> {productToDelete.name}
                </div>
                <div>
                  <strong>Categoria:</strong> {productToDelete.category}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setProductToDelete(null)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Confirmar Exclusão</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
