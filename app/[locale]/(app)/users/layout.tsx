import RequireRole from "@/components/RequireRole";

export default function UsersLayout({ children } : { children : React.ReactNode }) {
    return <RequireRole area="users">{children}</RequireRole>;
}