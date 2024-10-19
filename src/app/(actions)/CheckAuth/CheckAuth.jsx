"use client";

import { auth } from "@/app/(component)/Firebase/firebase";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";

export default function CheckAuth({ children }) {
    const [user] = useAuthState(auth);
    const router = useRouter();
    const pathname = usePathname();
    const PUBLIC_PATHS = ["/", "/signup", "/resetpass"];

    useEffect(() => {
        // console.log(`Loading: ${loading}, User: ${user}`);
        if (!user && !PUBLIC_PATHS.includes(pathname)) {
            router.replace("/");
        }
    }, [user, router, pathname]);

    if (user || PUBLIC_PATHS.includes(pathname)) {
        return <>{children}</>;
    }

    return null;
}
