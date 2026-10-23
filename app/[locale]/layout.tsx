import type { Metadata } from "next";
import { Be_Vietnam_Pro, Roboto } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import "../globals.css";
import Providers from "@/components/Providers";
import { routing } from "@/i18n/routing";
import { getCurrentUser } from "@/lib/get-current-user";
import { AuthProvider } from "@/contexts/auth-context";

const beVietnamPro = Be_Vietnam_Pro({
	subsets: ["latin", "vietnamese"],
	weight: ["400", "600", "700"],
	variable: "--font-be-vietnam-pro",
});

const roboto = Roboto({
	subsets: ["latin", "vietnamese"],
	weight: ["400", "500", "700"],
	variable: "--font-roboto",
});

export const metadata: Metadata = {
	title: "IELTS WIT",
	description: "",
};

export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children }: LayoutProps<"/[locale]">) {
	const locale = await getLocale();
	const user = await getCurrentUser();

	return (
		<html lang={locale} className={`${beVietnamPro.variable} ${roboto.variable} h-full antialiased`}>
			<body className="min-h-screen flex flex-col">
				<NextIntlClientProvider>
					<Providers>
						<AuthProvider initialUser={user}>{children}</AuthProvider>
					</Providers>
				</NextIntlClientProvider>
			</body>
		</html>
	);
}