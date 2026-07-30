import React from 'react';
import { useUIStore } from '../store/useUIStore';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export default function Toast() {
    const { toastMessage, toastType, hideToast } = useUIStore();
    if (!toastMessage) return null;

    const icons = {
        success: <CheckCircle size={18} color="var(--green)" />,
        error: <AlertCircle size={18} color="var(--rose)" />,
        info: <Info size={18} color="var(--accent)" />,
    };

    return (
        <div className="toast" onClick={hideToast}>
            {icons[toastType] || icons.info}
            <span>{toastMessage}</span>
        </div>
    );
}
