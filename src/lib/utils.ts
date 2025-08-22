import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Metadata } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function fetchUrlMetadata(url: string): Promise<Metadata> {
    try {
        new URL(url);

        const response = await fetch('/api/links/metadata', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch metadata');
        }

        return await response.json();
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error fetching metadata:', error.message);
            if (error.message.includes('Invalid URL')) {
                throw new Error('Invalid URL format');
            }
        }
        return {};
    }
}
