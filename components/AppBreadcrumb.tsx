"use client";

import ArrowLeftIcon from "@/components/icons/ArrowLeftIcon";
import { Link } from "@/i18n/navigation";
import { Breadcrumb } from "antd";

export type BreadcrumbItem = {
    title: string;
    path: string;
};

type AppBreadcrumbProps = {
    items: BreadcrumbItem[];
};

export default function AppBreadcrumb({ items } : AppBreadcrumbProps) {
    return (
        <Breadcrumb
            items={items}
            itemRender={(currentRoute) => {
                const isFirst = currentRoute.path === items[0].path;
                const isLast = currentRoute.path === items[items.length - 1].path;

                const content = (
                    <span className="group inline-flex items-center gap-1.5">
                        {isFirst && (
                            <ArrowLeftIcon width={16} height={16} className="text-muted transition-colors group-hover:text-accent" />
                        )}
                        <span>{currentRoute.title}</span>
                    </span>
                );

                return isLast ? (
                    <>{content}</>
                ) : (
                    <Link href={currentRoute.path as string}>{content}</Link>
                );
            }}
        />
    );
}