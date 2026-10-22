"use client";

import { useState } from "react";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider } from "antd";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

type ProviderProps = {
    children: React.ReactNode;
};

export default function Providers({ children }: ProviderProps) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000,
                        refetchOnWindowFocus: false,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            <AntdRegistry>
                <ConfigProvider
                    theme={{
                        token: {
                            fontFamily: "var(--font-be-vietnam-pro)",
                        },
                        components: {
                            Menu: {
                                // thanh ngang: chữ + gạch chân của mục đang chọn
                                horizontalItemSelectedColor: "var(--color-highlight)",
                                horizontalItemHoverColor: "var(--color-highlight)",
                                subMenuItemSelectedColor: "var(--color-highlight)",
        
                                // mục con trong dropdown "Kho đề"
                                itemSelectedColor: "var(--color-accent)",
                                itemSelectedBg: "var(--color-accent-bg)",
        
                                // chữ của các mục bình thường
                                itemColor: "var(--color-fg)",
                                itemHoverColor: "var(--color-accent)",
                            },
                            Spin: {
                                colorPrimary: "var(--color-muted)",
                            },
                            Breadcrumb: {
                                colorBgTextHover: "inherit",
                                linkHoverColor: "var(--color-accent)"
                            },
                            Table: {
                                borderColor: "var(--color-border)",
                                rowSelectedBg: "var(--color-accent-bg)",
                                rowSelectedHoverBg: "var(--color-accent-bg)"
                            },
                            Select: {
                                colorPrimary: "var(--color-accent)"
                            },
                            Tooltip: {
                                colorBgSpotlight: "var(--color-accent-bg)",
                                colorTextLightSolid: "var(--color-fg)"
                            },
                            Progress: {
                                defaultColor: "var(--color-accent)",
                                colorSuccess: "var(--color-highlight)"
                            },
                            Radio: {
                                colorPrimary: "var(--color-accent)",
                                colorPrimaryHover: "var(--color-accent)",
                            },
                            Pagination: {
                                colorPrimary: "var(--color-accent)",
                                colorPrimaryHover: "var(--color-accent)",
                                itemActiveBg: "transparent",
                            },
                            DatePicker: {
                                colorPrimary: "var(--color-accent)", 
                                hoverBorderColor: "var(--color-accent)",
                                activeBorderColor: "var(--color-accent)",
                                activeShadow: "0 0 0 2px var(--color-accent-bg)",
                                controlItemBgActive: "var(--color-accent-bg)",
                                cellActiveWithRangeBg: "var(--color-accent-bg)",
                                cellHoverWithRangeBg: "var(--color-accent-bg)",
                                cellRangeBorderColor: "var(--color-accent)",
                                colorLink: "var(--color-accent)",
                                colorLinkHover: "var(--color-accent)",
                                colorLinkActive: "var(--color-accent)",
                            },
                            Button: {
                                colorPrimary: "var(--color-accent)",
                                colorPrimaryHover: "var(--color-accent)",
                                colorPrimaryActive: "var(--color-accent)",
                                primaryShadow: "none",
                                defaultHoverColor: "var(--color-accent)",
                                defaultHoverBorderColor: "var(--color-accent)",
                                defaultActiveColor: "var(--color-accent)",
                                defaultActiveBorderColor: "var(--color-accent)",
                            },
                            Upload: {
                                colorPrimary: "var(--color-accent)",
                                colorPrimaryHover: "var(--color-accent)",
                                colorPrimaryActive: "var(--color-accent)",
                                colorLink: "var(--color-accent)",
                                colorLinkHover: "var(--color-accent)",
                                colorLinkActive: "var(--color-accent)",
                            },
                            Checkbox: {
                                colorPrimary: "var(--color-accent)",
                                colorPrimaryHover: "var(--color-accent)",
                                colorPrimaryBorder: "var(--color-accent)",
                            },
                            Dropdown: {
                                colorText: "var(--color-fg)",
                                controlItemBgHover: "var(--color-accent-bg)",
                                colorPrimary: "var(--color-accent)",
                                controlItemBgActive: "var(--color-accent-bg)",
                                controlItemBgActiveHover: "var(--color-accent-bg)"                    
                            },
                            Typography: {
                                colorLink: "var(--color-accent)",
                                colorLinkActive: "var(--color-accent)",
                                colorLinkHover: "var(--color-accent)",
                                colorText: "var(--color-muted)"
                            },
                            Statistic: {
                                contentFontSize: 14
                            },
                            Splitter: {
                                controlItemBgHover: "var(--color-border)",
                                colorFill: "var(--color-muted)",
                                controlItemBgActive: "var(--color-accent)",
                                controlItemBgActiveHover: "var(--color-accent)",
                            },
                            Switch: {
                                colorPrimary: "var(--color-accent)",
                                colorPrimaryHover: "var(--color-accent)"
                            }
                        }
                    }}
                >
                    {children}
                </ConfigProvider>
            </AntdRegistry>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}