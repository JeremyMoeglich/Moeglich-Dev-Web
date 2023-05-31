import React, {
    useContext,
    type ReactNode,
    createContext,
    useEffect,
    useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

type CrossTextProps = {
    token_wrap?: (token: string) => ReactNode;
    tokens: string[];
    animateId: string;
};

const existentTokens = createContext<Set<string>>(new Set());

const Token: React.FC<{
    token: string;
    token_wrap: (token: string) => ReactNode;
    layoutId: string;
}> = ({ token, token_wrap, layoutId }) => {
    const existent = useContext(existentTokens);
    const cleanup_ref = useRef<string | undefined>(undefined);
    const duration = 0.5;
    const tokenExists = existent.has(layoutId);
    useEffect(() => {
        const timeout = setTimeout(() => {
            existent.add(layoutId);
            cleanup_ref.current = undefined;
        }, duration * 1000);

        return () => {
            clearTimeout(timeout);
            if (cleanup_ref.current !== undefined) {
                existent.delete(cleanup_ref.current);
            }
        };
    });

    return (
        <motion.div
            layoutId={layoutId}
            className="relative z-50 inline-block"
            initial={tokenExists ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration }}
        >
            {token_wrap(token === " " ? "\u00A0" : token)}
        </motion.div>
    );
};
export const CrossText: React.FC<CrossTextProps> = ({
    token_wrap = (token) => token,
    tokens,
    animateId,
}) => {
    return (
        <AnimatePresence>
            {tokens.map((token, index) => (
                <Token
                    key={`${animateId}-${index}`}
                    layoutId={`${animateId}-${token}`}
                    token={token}
                    token_wrap={token_wrap}
                />
            ))}
        </AnimatePresence>
    );
};

export const CrossTextProvider: React.FC<{
    children: ReactNode;
}> = ({ children }) => {
    return (
        <existentTokens.Provider value={new Set()}>
            {children}
        </existentTokens.Provider>
    );
};
