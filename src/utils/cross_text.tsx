import React, {
    useEffect,
    useState,
    useContext,
    createContext,
    type ReactNode,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { split_include } from "./split_include";

type CrossTextProps = {
    style: React.CSSProperties;
    text: string;
    animateId: string;
    tokenize?: (text: string) => string[];
};

type CrossTextContextType = {
    [key: string]: string;
};

const CrossTextContext = createContext<CrossTextContextType>({});

const CrossText: React.FC<CrossTextProps> = ({
    style,
    text,
    animateId,
    tokenize = (text) => split_include(text, " "),
}) => {
    const animateTexts = useContext(CrossTextContext);

    const [isMounted, setIsMounted] = useState(true);

    const tokens = tokenize(text);

    useEffect(() => {
        animateTexts[animateId] = text;
        setIsMounted(true);

        return () => {
            delete animateTexts[animateId];
            setIsMounted(false);
        };
    }, [animateId, text, animateTexts]);

    if (!isMounted) return null;

    return (
        <AnimatePresence>
            {tokens.map((token, index) => (
                <motion.div
                    key={`${animateId}-${index}`}
                    layoutId={`${animateId}-${index}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={style}
                    className="relative inline-block z-10"
                >
                    {token === " " ? "\u00A0" : token}
                </motion.div>
            ))}
        </AnimatePresence>
    );
};

type CrossTextProviderProps = {
    children: ReactNode;
};

const CrossTextProvider: React.FC<CrossTextProviderProps> = ({ children }) => {
    const [animateTexts, setAnimateTexts] = useState<CrossTextContextType>({});

    useEffect(() => {
        setAnimateTexts(animateTexts);
    }, [animateTexts]);

    return (
        <CrossTextContext.Provider value={animateTexts}>
            {children}
        </CrossTextContext.Provider>
    );
};

export { CrossText, CrossTextProvider };
