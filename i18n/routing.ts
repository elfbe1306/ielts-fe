import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
	locales: ["en", "vi"],
	defaultLocale: "vi",
	localeDetection: false
});

declare module "next-intl" {
	interface AppConfig {
		Locale: (typeof routing.locales)[number];
	}
}