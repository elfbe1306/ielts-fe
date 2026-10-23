"use client";

import Button from "@/components/Button";
import GoogleIcon from "@/components/Icons/GoogleIcon";
import { useAuth } from "@/contexts/auth-context";
import { useAppMessage } from "@/contexts/message-context";
import { Link, useRouter } from "@/i18n/navigation";
import { AuthApi } from "@/lib/api/authApi";
import { ROLE_HOME, ROUTES } from "@/lib/route";
import { useGoogleLogin } from "@react-oauth/google";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl"

export default function SignInPage() {
    const t = useTranslations("auth.signIn");
    const message = useAppMessage();
    const router = useRouter();
    const { setUser } = useAuth();

    const { mutate, isPending } = useMutation({
        mutationFn: AuthApi.signIn,
        onSuccess: (user) => {
            setUser(user);
            router.replace(ROLE_HOME[user.role]);
        },
        onError: (error) => {
            message.error(error.message);
        } 
    });

    const handleGoogleSignIn = useGoogleLogin({
        flow: "auth-code",
        onSuccess: ({ code }) => mutate(code)
    });

    return (
        <>
            <p className="text-center font-serif text-2xl font-bold text-fg mb-1.5">
                {t("title")}
            </p>

            <p className="text-center text-sm text-muted mb-7">
                {t("subtitle")}
            </p>

            <Button
                variant="tertiary"
                label={isPending ? t("googleConnecting") : "Google"}
                icon={<GoogleIcon width={18} height={18} />}
                onClick={handleGoogleSignIn}
                disabled={isPending}
                fullWidth={true}
            />

            <p className="mt-5.5 text-center text-sm text-muted">
                {t("noAccount")}{" "}
                <Link
                    href={`${ROUTES.landing}#register`}
                    className="font-medium text-accent hover:underline"
                >
                    {t("contactUs")}
                </Link>
            </p>
        </>
    )
}