"use client";

import { useState } from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

interface Props {
    children: React.ReactNode;
}

export default function QueryProvider({ children }: Props) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000,
                        retry: 1,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {process.env.NEXT_PUBLIC_NODE_ENV!.toLowerCase() ===
                "development" && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
    );
}
