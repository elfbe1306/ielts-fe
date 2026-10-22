export default function StudentLayout({ children } : { children: React.ReactNode }) {
    return (
        <div className="grow bg-surface px-4 pb-10 pt-6 lg:px-10 lg:pb-16 lg:pt-10">
            <div className="max-w-screen-2xl mx-auto">
                {children}
            </div>
        </div>
    )
}