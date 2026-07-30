import { create } from 'zustand';

export const useUIStore = create((set) => ({
    activeTab: 'dashboard', // 'dashboard' | 'contacts' | 'todos' | 'key-points' | 'meeting-preview'
    activeContactIdFilter: null,

    // Modals
    isQuickActionSheetOpen: false,
    isContactModalOpen: false,
    contactToEdit: null,

    isKeyPointModalOpen: false,
    keyPointToEdit: null,
    keyPointDefaultContactId: null,

    isTodoModalOpen: false,
    todoToEdit: null,
    todoDefaultContactId: null,

    // Toast
    toastMessage: null,
    toastType: 'info', // 'success' | 'error' | 'info'

    setActiveTab: (tab, contactIdFilter = null) => set({ activeTab: tab, activeContactIdFilter: contactIdFilter }),

    openQuickActionSheet: () => set({ isQuickActionSheetOpen: true }),
    closeQuickActionSheet: () => set({ isQuickActionSheetOpen: false }),

    openContactModal: (contact = null) => set({ isContactModalOpen: true, contactToEdit: contact }),
    closeContactModal: () => set({ isContactModalOpen: false, contactToEdit: null }),

    openKeyPointModal: (keyPoint = null, defaultContactId = null) => set({
        isKeyPointModalOpen: true,
        keyPointToEdit: keyPoint,
        keyPointDefaultContactId: defaultContactId
    }),
    closeKeyPointModal: () => set({ isKeyPointModalOpen: false, keyPointToEdit: null, keyPointDefaultContactId: null }),

    openTodoModal: (todo = null, defaultContactId = null) => set({
        isTodoModalOpen: true,
        todoToEdit: todo,
        todoDefaultContactId: defaultContactId
    }),
    closeTodoModal: () => set({ isTodoModalOpen: false, todoToEdit: null, todoDefaultContactId: null }),

    showToast: (message, type = 'success') => {
        set({ toastMessage: message, toastType: type });
        setTimeout(() => {
            set({ toastMessage: null });
        }, 3500);
    }
}));
