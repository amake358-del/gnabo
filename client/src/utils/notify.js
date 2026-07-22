import { useToastStore } from '../stores/toastStore';
export function toast(message, type = 'info') {
    useToastStore.getState().addToast(message, type);
}
