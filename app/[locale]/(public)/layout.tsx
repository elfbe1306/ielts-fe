import PublicHeader from "@/components/PublicHeader";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<PublicHeader />
			<main className="flex-1 flex flex-col">
				{children}
			</main>
		</>
	);
}