'use client';

interface SlugLayoutProps {
    children: React.ReactNode;
}

export default function SlugLayout({ children }: SlugLayoutProps) {
    return (
        <div className="min-h-screen w-full">
            {children}
        </div>
    );
}
