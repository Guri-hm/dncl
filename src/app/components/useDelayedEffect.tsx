import { useEffect, useRef, useState } from "react";

export const useDelayedEffect = (
    effect: React.EffectCallback,
    deps?: React.DependencyList,
    delaytime: number = 1000,
) => {
    const [waiting, setWaiting] = useState(false);
    const timer = useRef<number>(0);

    useEffect(() => {
        window.clearTimeout(timer.current);

        setWaiting(true);

        timer.current = window.setTimeout(() => {
            setWaiting(false);
        }, delaytime);
    }, deps);

    useEffect(() => {
        if (!waiting) {
            effect();
        }
    }, [waiting]);
};

