"use client";

import { createContext, useContext } from "react";
import { message } from "antd";
import type { MessageInstance } from "antd/es/message/interface";

const MessageContext = createContext<MessageInstance | null>(null);

export function MessageProvider({ children }: { children: React.ReactNode }) {
    const [messageApi, contextHolder] = message.useMessage();

    return (
        <MessageContext.Provider value={messageApi}>
            {contextHolder}
            {children}
        </MessageContext.Provider>
    );
}

export function useAppMessage(): MessageInstance {
    const ctx = useContext(MessageContext);

    if (!ctx) {
        throw new Error("useAppMessage must be used within MessageProvider");
    }

    return ctx;
}