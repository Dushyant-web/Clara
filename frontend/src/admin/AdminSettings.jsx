import React, { useState } from 'react';
import {
    Settings,
    Shield,
    Globe,
    Bell,
    Database,
    Lock,
    Eye,
    Save,
    Loader2
} from 'lucide-react';

const AdminSettings = () => {
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            alert('SYSTEM CONFIGURATION SYNCHRONIZED.');
        }, 1000);
    };

    const sections = [
        {
            title: 'Storefront Identity',
            icon: Globe,
            fields: [
                { label: 'Store Name', value: 'NAME LUXURY' },
                { label: 'Support Email', value: 'ARCHIVE@NAME.CO' },
                { label: 'Currency', value: 'INR (₹)' }
            ]
        },
        {
            title: 'Security & Access',
            icon: Shield,
            fields: [
                { label: 'Session Timeout', value: '24 HOURS' },
                { label: 'Two-Factor Archival', value: 'ACTIVE' },
                { label: 'Encryption Protocol', value: 'AES-256-GCM' }
            ]
        }
    ];

    return (
        <div className="space-y-12 max-w-4xl">
            <header className="flex justify-between items-end mb-12">
                <div>
                    <h1 className="text-4xl font-bold tracking-tighter uppercase mb-2">System Control</h1>
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Configure core architectural and security parameters</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-8 py-4 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/90 transition-all flex items-center gap-3 disabled:opacity-50"
                >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Parameters
                </button>
            </header>

            <div className="space-y-8">
                {sections.map((section, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/5 p-12">
                        <div className="flex items-center gap-4 mb-12">
                            <div className="p-3 bg-white text-black"><section.icon size={20} /></div>
                            <h2 className="text-xs uppercase tracking-[0.4em] font-black">{section.title}</h2>
                        </div>

                        <div className="space-y-8">
                            {section.fields.map((field, fIdx) => (
                                <div key={fIdx} className="grid grid-cols-3 gap-8 items-center border-b border-white/5 pb-8 last:border-0 last:pb-0">
                                    <label className="text-[9px] uppercase tracking-widest font-black text-gray-500">{field.label}</label>
                                    <input
                                        type="text"
                                        defaultValue={field.value}
                                        className="col-span-2 bg-transparent border-none text-[10px] uppercase tracking-widest font-black text-white focus:outline-none"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white/2 border border-dashed border-white/5 p-12 flex flex-col items-center justify-center text-center opacity-30">
                <Database size={32} className="mb-4" />
                <h3 className="text-[10px] uppercase tracking-widest font-black mb-2 text-gray-400">Archival Logs</h3>
                <p className="text-[8px] uppercase tracking-widest max-w-xs leading-loose">Automated system health checks and database optimization protocols are running in high-frequency background clusters.</p>
            </div>
        </div>
    );
};

export default AdminSettings;
