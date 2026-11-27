import RequireRole from "@/components/RequireRole";

export default function PracticesLayout({ children } : { children : React.ReactNode }) {
    return <RequireRole area="practices">{children}</RequireRole>;
}