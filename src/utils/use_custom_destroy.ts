import { useEffect, useRef } from "react";

interface Destructor {
    destroy: () => void;
    update: () => void;
}

export function useCustomEffect(
    callback: () => Destructor,
    deps: React.DependencyList
) {
    const componentStillMounted = useRef(true);
    const destructor = callback();

    useEffect(() => {
        return () => {
            if (componentStillMounted.current) {
                // Clean-up function for dependency changes
                destructor.update();
            } else {
                // Clean-up function for component unmounting
                destructor.destroy();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    useEffect(() => {
        // This effect runs only once when the component mounts
        // And sets componentStillMounted to false when the component unmounts
        return () => {
            componentStillMounted.current = false;
        };
    }, []);
}
