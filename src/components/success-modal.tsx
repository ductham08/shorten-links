'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, Copy, ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface SuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
    url?: string;
    showUrl?: boolean;
    showCopyButton?: boolean;
    showOpenButton?: boolean;
}

export default function SuccessModal({
    isOpen,
    onClose,
    title = "Operation Completed Successfully!",
    message,
    url,
    showUrl = false,
    showCopyButton = true,
    showOpenButton = true
}: SuccessModalProps) {
    const [copySuccess, setCopySuccess] = useState<boolean>(false);

    const handleCopyUrl = async () => {
        if (!url) return;
        
        try {
            await navigator.clipboard.writeText(url);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }
    };

    const handleOpenUrl = () => {
        if (!url) return;
        window.open(url, '_blank');
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-[16px]">
                        {title}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                    {message && (
                        <p className="text-gray-600">{message}</p>
                    )}
                    
                    {showUrl && url && (
                        <div className="p-3 rounded-lg border">
                            <p className="font-mono text-sm break-all">{url}</p>
                        </div>
                    )}
                    
                    <div className="flex gap-2">
                        {showCopyButton && url && (
                            <Button 
                                onClick={handleCopyUrl} 
                                className="flex-1 flex items-center gap-2"
                                variant={copySuccess ? "default" : "outline"}
                            >
                                {copySuccess ? (
                                    <>
                                        <CheckCircle className="h-4 w-4" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-4 w-4" />
                                        Copy URL
                                    </>
                                )}
                            </Button>
                        )}
                        
                        {showOpenButton && url && (
                            <Button 
                                onClick={handleOpenUrl} 
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <ExternalLink className="h-4 w-4" />
                                Open
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
