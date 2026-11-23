import RequireRole from "@/components/RequireRole";

export default function StudentsLayout({ children } : { children : React.ReactNode }) {
    return <RequireRole area="students">{children}</RequireRole>;
}