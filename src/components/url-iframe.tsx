'use client';

interface UrlIframeProps {
    url: string;
}

export default function UrlIframe({ url }: UrlIframeProps) {
    return (
        <iframe 
            src={url}
            className="w-full h-screen border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
        />
    );
}
