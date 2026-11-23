import RequireRole from "@/components/RequireRole";

export default function CoursesLayout({ children } : { children : React.ReactNode }) {
    return <RequireRole area="courses">{children}</RequireRole>;
}