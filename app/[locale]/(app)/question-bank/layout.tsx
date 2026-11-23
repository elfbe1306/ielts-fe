import RequireRole from "@/components/RequireRole";

export default function QuestionBankLayout({ children } : { children : React.ReactNode }) {
    return <RequireRole area="questionBank">{children}</RequireRole>;
}