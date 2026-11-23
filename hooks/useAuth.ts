import { authQueries } from "@/lib/queries/authQueries";
import { useQuery } from "@tanstack/react-query";

export function useAuth() {
    const { data, isLoading } = useQuery(authQueries.me());

    return { user: data ?? null, isLoading };
}