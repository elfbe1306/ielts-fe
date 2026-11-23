"use client";

import { useAuth } from "@/hooks/useAuth";
import { ACCESS, canAccess } from "@/lib/permission"
import { notFound } from "next/navigation";

type RequireRoleProps = {
    area: keyof typeof ACCESS;
    children: React.ReactNode;
}

export default function RequireRole({ area, children } : RequireRoleProps) {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <div className="h-32 animate-pulse rounded-2xl border border-border bg-surface" />;
    }

    if (!user || !canAccess(user.role, area)) {
        notFound();
    }

    return <>{children}</>;
}