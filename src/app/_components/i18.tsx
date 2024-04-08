import { Cookies, useCookies } from "next-client-cookies";
import { ReactNode } from "react";
import { z } from "zod";
import { create } from "zustand";
import { maybe_window } from "~/utils/maybe_window";

const LanguageSchema = z.enum(["en", "de"]);
export type Language = z.infer<typeof LanguageSchema>;

export const useLanguage = create<{
    language: Language | undefined;
    setLanguage: (language: Language, cookies: Cookies) => void;
    getLanguage: (cookies: Cookies) => Language;
}>((set, get) => ({
    language: "en",
    setLanguage: (language: Language, cookies: Cookies) => {
        set({ language });
        if (!maybe_window()) return;
        cookies.set("lang", language);
    },
    getLanguage: (cookies) => {
        const current = get().language;
        if (current) {
            return current;
        }
        const lang = LanguageSchema.safeParse(cookies.get("lang"));
        if (lang.success) {
            return lang.data;
        }
        return "en";
    },
}));

export type I18T =
    | Readonly<{
          de?: string | (() => ReactNode);
          en?: string | (() => ReactNode);
      }>
    | string
    | (() => ReactNode);

export function I18({ content }: { content: I18T }) {
    const cookies = useCookies();
    const language_state = useLanguage();
    const language = language_state.getLanguage(cookies);
    if (typeof content === "string") {
        return <>{content}</>;
    }
    if (typeof content === "function") {
        return <>{content()}</>;
    }
    const text = content[language] ?? content.en ?? content.de;
    if (typeof text === "string") {
        return <>{text}</>;
    }
    if (typeof text === "function") {
        return <>{text()}</>;
    }
    return <>EMPTY</>;
}
