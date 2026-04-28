import { useState, useEffect } from 'react';
import { toast } from '../utils/toast.js';
import Icon from './Icon.jsx';

const STYLES = {
    success: { bg: 'bg-emerald-600', icon: 'CheckCircle'  },
    error:   { bg: 'bg-red-600',     icon: 'XCircle'      },
    info:    { bg: 'bg-slate-700',   icon: 'Info'         },
};

const DURATION = 3500;

export default function ToastContainer() {
    const [items, setItems] = useState([]);

    useEffect(() => {
        return toast._subscribe(t => {
            setItems(prev => [...prev, t]);
            setTimeout(() => setItems(prev => prev.filter(x => x.id !== t.id)), DURATION);
        });
    }, []);

    const dismiss = (id) => setItems(prev => prev.filter(x => x.id !== id));

    if (items.length === 0) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 pointer-events-none">
            {items.map(t => {
                const { bg, icon } = STYLES[t.type] ?? STYLES.info;
                return (
                    <div
                        key={t.id}
                        className={`${bg} text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 min-w-72 max-w-sm pointer-events-auto`}
                        style={{ animation: 'toastIn 0.22s ease-out' }}
                    >
                        <Icon name={icon} size={18} className="shrink-0" />
                        <p className="text-sm font-medium flex-1 leading-snug">{t.message}</p>
                        <button
                            onClick={() => dismiss(t.id)}
                            className="opacity-60 hover:opacity-100 transition-opacity shrink-0 ml-1"
                        >
                            <Icon name="X" size={14} />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
