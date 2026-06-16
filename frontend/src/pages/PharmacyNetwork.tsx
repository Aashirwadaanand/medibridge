import React, { useState, useEffect } from 'react';
import { Pill, Search, Plus, ShoppingCart, Sparkles, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import medicineService from '../services/medicineService';
import aiService from '../services/aiService';
import { Medicine } from '../types';
import { useApp } from '../context/AppContext';
import { CardSkeleton, SuccessState } from '../components/common/Loader';

export const PharmacyNetwork: React.FC = () => {
  const { role, addNotification } = useApp();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeView, setActiveView] = useState<'catalog' | 'interaction-checker'>('catalog');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Interaction Checker State
  const [med1, setMed1] = useState('');
  const [med2, setMed2] = useState('');
  const [checking, setChecking] = useState(false);
  const [checkingStep, setCheckingStep] = useState('');
  const [interactionResult, setInteractionResult] = useState<{
    severity: 'Low' | 'Moderate' | 'High';
    description: string;
    precautions: string[];
  } | null>(null);

  // Form states for restocking
  const [name, setName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const category = 'Cardiovascular';
  const [requiresPrescription, setRequiresPrescription] = useState(false);

  const fetchMedicines = async () => {
    try {
      const data = await medicineService.getMedicines();
      setMedicines(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleOrder = async (med: Medicine) => {
    if (med.stock <= 0) return;
    try {
      const updated = await medicineService.updateMedicineStock(med.id, med.stock - 1);
      setMedicines(prev => prev.map(m => m.id === med.id ? updated : m));
      setSuccessMsg(`Successfully ordered 1 unit of ${med.name}!`);
      addNotification(
        'Order Placed',
        `Pharmacy order for 1x ${med.name} (₹${med.price.toFixed(2)}) has been dispatched.`,
        'medicine'
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newMed = await medicineService.addMedicine({
        name,
        genericName,
        manufacturer: 'Generic Pharma India',
        price: parseFloat(price) || 10.0,
        stock: parseInt(stock) || 50,
        expiryDate: '2028-12-31',
        pharmacyId: 'pharma_01',
        category,
        requiresPrescription
      });
      setMedicines(prev => [...prev, newMed]);
      setSuccessMsg(`Inventory item ${name} added successfully.`);
      setName('');
      setGenericName('');
      setPrice('');
      setStock('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckInteractions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!med1.trim() || !med2.trim()) return;

    setChecking(true);
    setInteractionResult(null);
    setCheckingStep('Searching pharmaceutical database indices...');

    const steps = [
      'Checking contraindications and active substance components...',
      'Evaluating toxicity risks and metabolic interference pathways...'
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        setCheckingStep(steps[stepIndex]);
        stepIndex++;
      }
    }, 900);

    try {
      const res = await aiService.checkInteractions(med1, med2);
      clearInterval(interval);
      setInteractionResult(res);
    } catch (err) {
      console.error(err);
      clearInterval(interval);
      addNotification(
        'Interaction Check Error',
        'Failed to query pharmaceutical interaction API.',
        'general'
      );
    } finally {
      setChecking(false);
      setCheckingStep('');
    }
  };

  const categories = ['All', 'Cardiovascular', 'Hypertension', 'Antidiabetic', 'Analgesics'];

  const filteredMeds = medicines.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.genericName.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || m.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {successMsg && (
        <SuccessState message={successMsg} onClose={() => setSuccessMsg(null)} />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-sans">Pharmacy & Medicine Network</h2>
          <p className="text-xs text-slate-400 mt-1">Search, order, or verify drug-to-drug interactions using our clinical scanner.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left column (Categories and tools) */}
        <div className="lg:col-span-1 space-y-6">
          {/* Categories Card */}
          <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">Categories</h3>
            <div className="flex flex-col gap-1.5">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    setActiveView('catalog');
                  }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-xl transition-all ${
                    activeView === 'catalog' && activeCategory === cat
                      ? 'bg-white/5 text-cyan-400 font-semibold border-l-2 border-cyan-400'
                      : 'text-slate-400 hover:bg-white/[0.01] hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* AI Safety Analyser Toggle */}
          <div className="glass-card p-6 rounded-2xl border border-[#a855f7]/20 bg-[#a855f7]/[0.01] space-y-4">
            <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider font-sans flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" /> Safety Analytics
            </h3>
            <button
              onClick={() => {
                setActiveView('interaction-checker');
                setActiveCategory('');
              }}
              className={`w-full text-left px-3 py-2.5 text-xs rounded-xl transition-all font-semibold flex items-center gap-2 ${
                activeView === 'interaction-checker'
                  ? 'bg-purple-500 text-white shadow-glow-purple'
                  : 'text-slate-300 hover:bg-white/[0.01]'
              }`}
            >
              <Pill className="w-4 h-4" /> Drug Interaction Checker
            </button>
          </div>

          {/* Add Restock Forms */}
          {(role === 'hospital' || role === 'admin') && (
            <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">Restock Inventory</h3>
              <form onSubmit={handleAddMedicine} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Medicine Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Albuterol"
                    className="w-full glass-input py-2 text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Generic Name</label>
                  <input
                    type="text"
                    value={genericName}
                    onChange={(e) => setGenericName(e.target.value)}
                    placeholder="e.g. ProAir"
                    className="w-full glass-input py-2 text-xs"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Price (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="120"
                      className="w-full glass-input py-2 text-xs"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Stock</label>
                    <input
                      type="number"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      placeholder="50"
                      className="w-full glass-input py-2 text-xs"
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1.5">
                  <input
                    type="checkbox"
                    id="requiresPresc"
                    checked={requiresPrescription}
                    onChange={(e) => setRequiresPrescription(e.target.checked)}
                    className="rounded border-white/10 bg-slate-800 text-cyan-500 focus:ring-0 focus:ring-offset-0"
                  />
                  <label htmlFor="requiresPresc" className="text-[10px] text-slate-400 font-bold uppercase select-none">
                    Requires prescription
                  </label>
                </div>
                <button type="submit" className="glass-btn-primary w-full py-2 text-xs mt-2">
                  <Plus className="w-4 h-4 text-black" /> Add to Catalog
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right column (Workspace) */}
        <div className="lg:col-span-3 space-y-6">
          {activeView === 'interaction-checker' ? (
            <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-6 animate-fadeIn">
              <div className="border-b border-white/5 pb-3">
                <h3 className="text-xs font-bold text-slate-350 uppercase tracking-wider font-sans flex items-center gap-2">
                  <Sparkles className="w-4.5 h-4.5 text-purple-400 animate-pulse" /> AI Drug Interaction Checker
                </h3>
                <p className="text-[10px] text-slate-500 mt-1">Select or type two medications to check for drug-to-drug safety contraindications.</p>
              </div>

              <form onSubmit={handleCheckInteractions} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">First Medication</label>
                  <input
                    type="text"
                    value={med1}
                    onChange={(e) => setMed1(e.target.value)}
                    placeholder="e.g. Aspirin (or Lisinopril)"
                    className="w-full glass-input text-xs"
                    required
                    disabled={checking}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Second Medication</label>
                  <input
                    type="text"
                    value={med2}
                    onChange={(e) => setMed2(e.target.value)}
                    placeholder="e.g. Ibuprofen (or Spironolactone)"
                    className="w-full glass-input text-xs"
                    required
                    disabled={checking}
                  />
                </div>
                <div className="sm:col-span-2 pt-2">
                  <button
                    type="submit"
                    disabled={checking || !med1.trim() || !med2.trim()}
                    className="glass-btn-primary py-2 px-6 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4 text-black" /> {checking ? 'Evaluating...' : 'Analyze Safety Profile'}
                  </button>
                </div>
              </form>

              {checking && (
                <div className="p-5 rounded-xl border border-purple-500/10 bg-purple-500/[0.01] flex items-center gap-3">
                  <RefreshCw className="w-5 h-5 text-purple-400 animate-spin flex-shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider">Clinical Pharmacology Scan</h4>
                    <p className="text-[10px] text-slate-500 animate-pulse leading-relaxed mt-0.5">{checkingStep}</p>
                  </div>
                </div>
              )}

              {interactionResult && (
                <div className="space-y-6 pt-2 border-t border-white/5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Severity Card */}
                    <div className="md:col-span-1 p-5 rounded-xl border flex flex-col justify-center text-center space-y-1 bg-white/[0.01] border-white/5">
                      <span className="text-[9px] font-bold uppercase tracking-wider block text-slate-500">Interaction Severity</span>
                      <span className={`text-base font-extrabold tracking-wider uppercase mt-1 ${
                        interactionResult.severity === 'High' 
                          ? 'text-rose-400' 
                          : interactionResult.severity === 'Moderate'
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}>
                        {interactionResult.severity}
                      </span>
                    </div>

                    {/* Mechanism Description */}
                    <div className="md:col-span-2 p-5 rounded-xl border border-white/5 bg-white/[0.01] space-y-1.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider block text-slate-500">Clinical Mechanism</span>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">{interactionResult.description}</p>
                    </div>
                  </div>

                  {/* Precautions */}
                  <div className="p-6 rounded-2xl border border-white/5 space-y-3 bg-white/[0.01]">
                    <h4 className="text-xs font-bold text-slate-350 uppercase tracking-wider font-sans border-b border-white/5 pb-2">Precautions & Guidelines</h4>
                    <ul className="space-y-2 text-xs">
                      {interactionResult.precautions.map((p, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-400">
                          <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Disclaimer */}
                  <div className="p-4 bg-slate-900/40 rounded-xl border border-white/5 flex items-start gap-2 text-[10px] text-slate-500 font-mono">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>This information is educational and not a substitute for professional medical advice.</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by chemical compound or brand name..."
                  className="w-full bg-white/5 border border-white/5 text-slate-200 text-xs rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/10 placeholder:text-slate-500 transition-all"
                />
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <CardSkeleton />
                  <CardSkeleton />
                  <CardSkeleton />
                </div>
              ) : filteredMeds.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {filteredMeds.map((med) => {
                    const outOfStock = med.stock <= 0;
                    return (
                      <div key={med.id} className="glass-card p-5 rounded-2xl border border-white/5 hover:border-cyan-500/20 hover:shadow-glow-cyan transition-all flex flex-col justify-between">
                        <div className="space-y-4">
                          <div className="flex justify-between items-start gap-2">
                            <div className="p-2.5 bg-white/5 rounded-xl text-cyan-400">
                              <Pill className="w-4.5 h-4.5" />
                            </div>
                            {med.requiresPrescription && (
                              <span className="text-[9px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider font-sans">Rx Required</span>
                            )}
                          </div>

                          <div className="space-y-1">
                            <h4 className="text-sm font-bold text-slate-100">{med.name}</h4>
                            <p className="text-[10px] text-slate-500 font-sans italic">{med.genericName}</p>
                          </div>

                          <div className="flex justify-between items-baseline pt-2 border-t border-white/5">
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-sans">Category</span>
                            <span className="text-xs font-semibold text-slate-300">{med.category}</span>
                          </div>

                          <div className="flex justify-between items-baseline">
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-sans">Available Stock</span>
                            <span className={`text-xs font-semibold ${outOfStock ? 'text-rose-400' : 'text-slate-300'}`}>
                              {outOfStock ? 'Out of stock' : `${med.stock} units`}
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center border-t border-white/5 pt-4 mt-4">
                          <span className="text-base font-extrabold text-white">₹{med.price.toFixed(2)}</span>
                          <button
                            onClick={() => handleOrder(med)}
                            disabled={outOfStock || (med.requiresPrescription && role !== 'hospital' && role !== 'admin')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                              outOfStock
                                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                : med.requiresPrescription && role !== 'hospital' && role !== 'admin'
                                ? 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
                                : 'bg-cyan-400 hover:bg-cyan-300 text-black shadow-glow-cyan active:scale-95'
                            }`}
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            {med.requiresPrescription && role !== 'hospital' && role !== 'admin' ? 'Rx Approved Only' : 'Order Now'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="glass-card p-12 text-center text-slate-500 rounded-2xl border border-white/5">
                  <Pill className="w-8 h-8 mx-auto mb-2 stroke-[1.5]" />
                  <p className="text-xs font-medium">No medicines match filters.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PharmacyNetwork;
