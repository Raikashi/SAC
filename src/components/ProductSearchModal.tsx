import React, { useState, useMemo } from 'react';
import { Search, X, Package, Check } from 'lucide-react';
import { Product } from '../types';

interface ProductSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const ProductSearchModal: React.FC<ProductSearchModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === 'all' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] border border-slate-200">
        {/* Header (Azul + Menta) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50/70 to-teal-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-100 text-teal-700 rounded-lg">
              <Package className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-blue-950">
                Pesquisa no Cadastro de Produtos
              </h2>
              <p className="text-xs text-slate-500">
                Selecione um produto para preenchimento automático da referência e nome
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search controls */}
        <div className="p-4 border-b border-slate-200 space-y-3 bg-white">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Digite a referência (ex: REF-101) ou o nome do produto..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              autoFocus
            />
          </div>

          {categories.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-400 shrink-0">Categoria:</span>
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-2.5 py-1 rounded-md shrink-0 transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-teal-50 text-teal-800 font-semibold border border-teal-200'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Todas ({products.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-md shrink-0 transition-colors ${
                    selectedCategory === cat
                      ? 'bg-teal-50 text-teal-800 font-semibold border border-teal-200'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product list */}
        <div className="overflow-y-auto p-4 flex-1 divide-y divide-slate-100">
          {filteredProducts.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Package className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-medium">Nenhum produto localizado</p>
              <p className="text-xs text-slate-400 mt-1">
                Tente buscar por outro termo ou cadastre no menu "Cadastro de Produtos"
              </p>
            </div>
          ) : (
            filteredProducts.map((prod) => (
              <div
                key={prod.id}
                onClick={() => {
                  onSelectProduct(prod);
                  onClose();
                }}
                className="py-3 px-3 rounded-lg hover:bg-teal-50/50 cursor-pointer flex items-center justify-between group transition-colors"
              >
                <div className="min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-800 rounded border border-blue-200/80">
                      {prod.reference}
                    </span>
                    <span className="text-xs text-slate-500">
                      {prod.category}
                    </span>
                  </div>
                  <h4 className="text-sm font-medium text-slate-900 group-hover:text-blue-900">
                    {prod.name}
                  </h4>
                  {prod.description && (
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {prod.description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  className="shrink-0 px-3 py-1.5 text-xs font-medium bg-white text-teal-700 border border-teal-200 rounded-lg group-hover:bg-teal-600 group-hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Selecionar</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>{filteredProducts.length} itens encontrados</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
