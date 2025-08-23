'use client';

import { usePageTitle } from '@/components/contexts/page-title-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import React, { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import SuccessModal from '@/components/success-modal';
import { LinksTable } from '@/components/links-table';
import { Metadata } from '@/types';
import { fetchUrlMetadata } from '@/lib/utils';
import { LinkPreview } from '@/components/ui/link-preview';

interface FormData {
    url: string;
    suffix: string;
    icon: string;
    siteName: string;
    title: string;
    description: string;
    image: string;
    isIframe: boolean;
}

interface Errors {
    url?: string;
    suffix?: string;
    api?: string;
}

export default function AdminPage() {
    const { setTitle } = usePageTitle();
    const [customSuffix, setCustomSuffix] = useState<boolean>(false);
    const [useIframe, setUseIframe] = useState<boolean>(false);
    const [formData, setFormData] = useState<FormData>({
        url: '',
        suffix: '',
        icon: '',
        siteName: '',
        title: '',
        description: '',
        image: '',
        isIframe: false
    });
    const [errors, setErrors] = useState<Errors>({});
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
    const [generatedShortUrl, setGeneratedShortUrl] = useState<string>('');
    const [metadata, setMetadata] = useState<Metadata>({});
    const [isLoadingMetadata, setIsLoadingMetadata] = useState<boolean>(false);

    useEffect(() => {
        setTitle('Shorten Urls');
    }, [setTitle]);

    const validateForm = (): boolean => {
        const newErrors: Errors = {};

        // Validate URL
        if (!formData.url) {
            newErrors.url = 'URL is required';
        } else if (!/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(formData.url)) {
            newErrors.url = 'Invalid URL format';
        }

        // Validate Custom Suffix if enabled
        if (customSuffix && !formData.suffix) {
            newErrors.suffix = 'Custom Suffix is required when enabled';
        } else if (customSuffix && !/^[a-zA-Z0-9_-]+$/.test(formData.suffix)) {
            newErrors.suffix = 'Custom Suffix can only contain letters, numbers, hyphens, or underscores';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setErrors((prev) => ({ ...prev, api: undefined })); // Clear API error before submit

        const submitData = new FormData();
        submitData.append('url', formData.url);
        if (customSuffix && formData.suffix) {
            submitData.append('suffix', formData.suffix);
        }
        // Add metadata to form data
        submitData.append('title', formData.title);
        submitData.append('description', formData.description);
        submitData.append('image', formData.image);
        submitData.append('icon', formData.icon);
        submitData.append('siteName', formData.siteName);
        submitData.append('isIframe', String(useIframe));

        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
            const response = await fetch('/api/links/short', {
                method: 'POST',
                body: submitData,
                headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'API request failed');
            }

            // Set the generated short URL and show success modal
            const shortUrl = `${window.location.origin}/${data.slug || data.suffix}`;

            setGeneratedShortUrl(shortUrl);
            setShowSuccessModal(true);

            // Reset form and metadata after success
            setFormData({
                url: '',
                suffix: '',
                icon: '',
                siteName: '',
                title: '',
                description: '',
                image: '',
                isIframe: false
            });
            setMetadata({});
            setCustomSuffix(false);
            setUseIframe(false);
            setErrors({});
        } catch (err) {
            setErrors((prev) => ({ ...prev, api: (err as Error).message }));
        } finally {
            setIsSubmitting(false);
        }
    };

    const isValidUrl = (url: string): boolean => {
        try {
            const urlObj = new URL(url);
            return ['http:', 'https:'].includes(urlObj.protocol);
        } catch {
            return false;
        }
    };

    const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value, files } = e.target as HTMLInputElement;
        setFormData((prev) => ({
            ...prev,
            [id]: files ? files[0] : value,
        }));
        setErrors((prev) => ({ ...prev, [id]: undefined, api: undefined }));

        if (id === 'url') {
            if (value && isValidUrl(value)) {
                setIsLoadingMetadata(true);
                try {
                    const urlMetadata = await fetchUrlMetadata(value);
                    setMetadata(urlMetadata);
                    // Update formData with metadata
                    setFormData(prev => ({
                        ...prev,
                        title: urlMetadata.title || 'No title',
                        description: urlMetadata.description || 'No description',
                        image: urlMetadata.image || '/file.svg',
                        icon: urlMetadata.icon || '',
                        siteName: urlMetadata.siteName || ''
                    }));
                } catch (error) {
                    console.error('Error fetching metadata:', error);
                    setMetadata({});
                    // Reset metadata in formData
                    setFormData(prev => ({
                        ...prev,
                        title: '',
                        description: '',
                        image: '',
                        icon: '',
                        siteName: ''
                    }));
                } finally {
                    setIsLoadingMetadata(false);
                }
            } else {
                setMetadata({});
                setFormData(prev => ({
                    ...prev,
                    title: '',
                    description: '',
                    image: '',
                    icon: '',
                    siteName: ''
                }));
            }
        }
    };

    return (
        <>
            <div className='flex gap-6 flex-col'>
                <div className='flex gap-6'>
                    <Card>
                        <CardHeader>
                            <CardTitle>Shorten Url</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="w-md">
                                <form onSubmit={handleSubmit}>
                                    <div className="flex flex-col gap-6">
                                        <div className="w-md flex flex-col gap-3">
                                            <Label htmlFor="url">
                                                <i className="text-red-500 text-[12px]">*</i>
                                                Long URL
                                            </Label>
                                            <Input
                                                id="url"
                                                type="text"
                                                placeholder="https://example.com/suffix"
                                                value={formData.url}
                                                onChange={handleInputChange}
                                            />
                                            {errors.url && <p className="text-red-500 text-sm">{errors.url}</p>}
                                        </div>
                                        <div className="w-full flex flex-col gap-3">
                                            <div className='flex gap-8 items-center justify-start'>
                                                <div className='flex gap-2 flex-col'>
                                                    <Label htmlFor="custom-suffix">
                                                        Custom Suffix
                                                    </Label>
                                                    <Switch
                                                        className="cursor-pointer"
                                                        id="custom-suffix"
                                                        checked={customSuffix}
                                                        onClick={() => setCustomSuffix(!customSuffix)}
                                                    />
                                                </div>
                                                <div className='flex gap-2 flex-col'>
                                                    <Label htmlFor="use-iframe">
                                                        Use Iframe
                                                    </Label>
                                                    <Switch
                                                        // disabled={true}
                                                        className="cursor-pointer"
                                                        id="use-iframe"
                                                        checked={useIframe}
                                                        onClick={() => setUseIframe(!useIframe)}
                                                    />
                                                </div>
                                            </div>

                                            {customSuffix && (
                                                <>
                                                    <Input
                                                        id="suffix"
                                                        type="text"
                                                        placeholder="fanpage-ticket"
                                                        value={formData.suffix}
                                                        onChange={handleInputChange}
                                                    />
                                                    {errors.suffix && <p className="text-red-500 text-sm">{errors.suffix}</p>}
                                                </>
                                            )}
                                        </div>

                                        <Button type="submit" disabled={isSubmitting}>
                                            {isSubmitting ? 'Saving...' : 'Save'}
                                        </Button>
                                        {errors.api && <p className="text-red-500 text-sm mt-2">{errors.api}</p>}
                                    </div>
                                </form>
                            </div>
                        </CardContent>
                    </Card>

                    <LinkPreview
                        title={metadata.title}
                        description={metadata.description}
                        image={metadata.image}
                        isLoading={isLoadingMetadata}
                    />

                    {/* Success Modal */}
                    <SuccessModal
                        isOpen={showSuccessModal}
                        onClose={() => setShowSuccessModal(false)}
                        title="Short URL Created Successfully!"
                        url={generatedShortUrl}
                        showUrl={true}
                        showCopyButton={true}
                        showOpenButton={true}
                    />
                </div>

                <div className='w-full'>
                    <Card className='w-full'>
                        <CardHeader>
                            <CardTitle>Urls</CardTitle>
                            <CardDescription>
                                Manage and monitor your shortened URLs
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <LinksTable />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}