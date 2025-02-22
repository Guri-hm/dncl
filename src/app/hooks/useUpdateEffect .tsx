import { useEffect, useRef, DependencyList, useCallback } from 'react';

export const useUpdateEffect = (callback: () => void, dependencies: DependencyList) => {
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        callback();

    }, [callback, ...dependencies]);
};