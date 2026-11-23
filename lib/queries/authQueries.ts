import { queryOptions } from "@tanstack/react-query";
import { authApi } from "../api/authApi";

export const authKeys = {
    me: () => ["auth", "me"] as const,
};

export const authQueries = {
    me: () =>
        queryOptions({
            queryKey: authKeys.me(),
            queryFn: authApi.me,
            staleTime: 5 * 60 * 1000,
            refetchOnWindowFocus: true,
            retry: false,
        }),
};