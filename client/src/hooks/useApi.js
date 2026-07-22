import { useState, useCallback } from 'react';
export function useApi() {
    const [state, setState] = useState({ data: null, loading: false, error: null });
    const execute = useCallback(async (fn) => {
        setState({ data: null, loading: true, error: null });
        try {
            const result = await fn();
            setState({ data: result.data, loading: false, error: null });
            return result.data;
        }
        catch (err) {
            setState({ data: null, loading: false, error: err.message });
            throw err;
        }
    }, []);
    return { ...state, execute };
}
