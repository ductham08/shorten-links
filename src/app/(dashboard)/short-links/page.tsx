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
}

export default function AdminPage() {
    const { setTitle } = usePageTitle();
    const [customSuffix, setCustomSuffix] = useState<boolean>(false);
    const [formData, setFormData] = useState<FormData>({
        url: '',
        suffix: '',
        thumbnail: null,
        title: '',
        description: '',
    });
    const [errors, setErrors] = useState<Errors>({});

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

        // Validate Image
        if (!formData.thumbnail) {
            newErrors.thumbnail = 'Image is required';
        }

        // Validate Title
        if (!formData.title) {
            newErrors.title = 'Website Title is required';
        }

        // Validate Description
        if (!formData.description) {
            newErrors.description = 'Description is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (validateForm()) {
            // If validation passes, proceed with form submission (e.g., API call)
            console.log('Form data:', formData);
            // Example: Send data to an API
            /*
            const formDataToSend = new FormData();
            formDataToSend.append('url', formData.url);
            if (customSuffix) formDataToSend.append('suffix', formData.suffix);
            formDataToSend.append('thumbnail', formData.thumbnail);
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
      
            fetch('/api/shorten', {
              method: 'POST',
              body: formDataToSend,
            })
              .then((res) => res.json())
              .then((data) => console.log('Success:', data))
              .catch((err) => console.error('Error:', err));
            */
            alert('Form submitted successfully!');
        } else {
            console.log('Validation errors:', errors);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value, files } = e.target as HTMLInputElement;
        setFormData((prev) => ({
            ...prev,
            [id]: files ? files[0] : value,
        }));
        setErrors((prev) => ({ ...prev, [id]: '' }));
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
                                <div className="w-md flex flex-col gap-3">
                                    <Label htmlFor="custom-suffix">Custom Suffix</Label>
                                    <Switch
                                        className="cursor-pointer"
                                        id="custom-suffix"
                                        checked={customSuffix}
                                        onClick={() => setCustomSuffix(!customSuffix)}
                                    />
                                </div>
                                {customSuffix && (
                                    <div className="w-md flex flex-col gap-3">
                                        <Label htmlFor="suffix">Custom Suffix</Label>
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
                                <Button type="submit">Save</Button>
                            </div>
                        </form>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}