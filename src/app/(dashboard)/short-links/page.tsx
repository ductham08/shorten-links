'use client';

import { usePageTitle } from '@/components/contexts/page-title-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import React, { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

interface FormData {
    url: string;
    suffix: string;
    thumbnail: File | null;
    title: string;
    description: string;
}

interface Errors {
    url?: string;
    suffix?: string;
    thumbnail?: string;
    title?: string;
    description?: string;
    api?: string; // Thêm để lưu lỗi từ API
}

export default function AdminPage() {
    const { setTitle } = usePageTitle();
    const [customSuffix, setCustomSuffix] = useState<boolean>(false);
    const [autoGetMetadata, setAutoGetMetadata] = useState<boolean>(true);
    const [formData, setFormData] = useState<FormData>({
        url: '',
        suffix: '',
        thumbnail: null,
        title: '',
        description: '',
    });
    const [errors, setErrors] = useState<Errors>({});
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    useEffect(() => {
        setTitle('Short links');
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

        // Only validate manual inputs when auto metadata is disabled
        if (!autoGetMetadata) {
            if (!formData.thumbnail) {
                newErrors.thumbnail = 'Image is required when auto metadata is disabled';
            }
            if (!formData.title) {
                newErrors.title = 'Website Title is required when auto metadata is disabled';
            }
            if (!formData.description) {
                newErrors.description = 'Description is required when auto metadata is disabled';
            }
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
        submitData.append('autoGetMetadata', autoGetMetadata.toString());
        
        if (customSuffix && formData.suffix) {
            submitData.append('suffix', formData.suffix);
        }
        
        if (!autoGetMetadata) {
            // Only send manual inputs when auto metadata is disabled
            if (formData.thumbnail) {
                submitData.append('thumbnail', formData.thumbnail);
            }
            submitData.append('title', formData.title);
            submitData.append('description', formData.description);
        }

        try {
            const response = await fetch('/api/links/short', {
                method: 'POST',
                body: submitData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'API request failed');
            }

            // Reset form after success
            setFormData({
                url: '',
                suffix: '',
                thumbnail: null,
                title: '',
                description: '',
            });
            setCustomSuffix(false);
            setErrors({});
        } catch (err) {
            setErrors((prev) => ({ ...prev, api: (err as Error).message }));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value, files } = e.target as HTMLInputElement;
        setFormData((prev) => ({
            ...prev,
            [id]: files ? files[0] : value,
        }));
        // Clear error for the field, including API error
        setErrors((prev) => ({ ...prev, [id]: undefined, api: undefined }));
    };

    return (
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Shorten link</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="w-md">
                        <form onSubmit={handleSubmit}>
                            <div className="flex flex-col gap-6">
                                <div className="w-md flex flex-col gap-3">
                                    <Label htmlFor="url">
                                        <i className="text-red-500 text-[12px]">*</i>
                                        URL
                                    </Label>
                                    <Input
                                        id="url"
                                        type="text"
                                        placeholder="http://example.com/suffix"
                                        value={formData.url}
                                        onChange={handleInputChange}
                                    />
                                    {errors.url && <p className="text-red-500 text-sm">{errors.url}</p>}
                                </div>
                                <div className='flex gap-4 flex-start'>
                                    <div className="flex flex-col gap-3">
                                        <Label htmlFor="custom-suffix">Custom Suffix</Label>
                                        <Switch
                                            className="cursor-pointer"
                                            id="custom-suffix"
                                            checked={customSuffix}
                                            onClick={() => setCustomSuffix(!customSuffix)}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <Label htmlFor="auto-metadata">Auto Get Metadata</Label>
                                        <Switch
                                            className="cursor-pointer"
                                            id="auto-metadata"
                                            checked={autoGetMetadata}
                                            onClick={() => setAutoGetMetadata(!autoGetMetadata)}
                                        />
                                    </div>
                                </div>

                                {customSuffix && (
                                    <div className="w-md flex flex-col gap-3">
                                        <Label htmlFor="suffix">
                                            <i className="text-red-500 text-[12px]">*</i>
                                            Custom Suffix
                                        </Label>
                                        <Input
                                            id="suffix"
                                            type="text"
                                            placeholder="fanpage-ticket"
                                            value={formData.suffix}
                                            onChange={handleInputChange}
                                        />
                                        {errors.suffix && <p className="text-red-500 text-sm">{errors.suffix}</p>}
                                    </div>
                                )}

                                {!autoGetMetadata && (
                                    <>
                                        <div className="w-md flex flex-col gap-3">
                                            <Label htmlFor="thumbnail">
                                                <i className="text-red-500 text-[12px]">*</i>
                                                Image
                                            </Label>
                                            <Input
                                                id="thumbnail"
                                                type="file"
                                                onChange={handleInputChange}
                                            />
                                            {errors.thumbnail && <p className="text-red-500 text-sm">{errors.thumbnail}</p>}
                                        </div>
                                        <div className="w-md flex flex-col gap-3">
                                            <Label htmlFor="title">
                                                <i className="text-red-500 text-[12px]">*</i>
                                                Website Title
                                            </Label>
                                            <Input
                                                id="title"
                                                type="text"
                                                value={formData.title}
                                                onChange={handleInputChange}
                                            />
                                            {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
                                        </div>
                                        <div className="w-md flex flex-col gap-3">
                                            <Label htmlFor="description">
                                                <i className="text-red-500 text-[12px]">*</i>
                                                Description
                                            </Label>
                                            <Textarea
                                                id="description"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                            />
                                            {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                                        </div>
                                    </>
                                )}


                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Saving...' : 'Save'}
                                </Button>
                                {errors.api && <p className="text-red-500 text-sm mt-2">{errors.api}</p>}
                            </div>
                        </form>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}