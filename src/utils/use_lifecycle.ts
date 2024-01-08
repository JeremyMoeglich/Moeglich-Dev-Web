import { useEffect, useRef } from "react";

interface Destructor {
    destroy: () => void;
    update: () => void;
}

interface Actions {
    create: () => Destructor | undefined;
    update: () => Destructor | undefined;
    destroy: () => void;
}

export function useLifecycle(
    actions: Actions,
    deps: React.DependencyList | undefined,
) {
    const componentStillMounted = useRef(true);

    // Use effect for creation and update actions
    useEffect(() => {
        let destructor: Destructor | undefined;

        if (componentStillMounted.current) {
            destructor = actions.update ? actions.update() : undefined;
        } else {
            destructor = actions.create ? actions.create() : undefined;
            componentStillMounted.current = true;
        }

        return () => {
            if (componentStillMounted.current) {
                // Clean-up function for dependency changes
                destructor?.update && destructor.update();
                actions.update && actions.update();
            } else {
                // Clean-up function for component unmounting
                destructor?.destroy && destructor.destroy();
                actions.destroy && actions.destroy();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    // Use effect for tracking the mounted status
    useEffect(() => {
        return () => {
            componentStillMounted.current = false;
        };
    }, []);
}
