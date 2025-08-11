'use client';

import { usePageTitle } from '@/components/contexts/page-title-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import React, { useEffect } from 'react';
import { Label } from "@/components/ui/label"
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

export default function AdminPage() {

    const { setTitle } = usePageTitle()
    const [customSuffix, setCustomSuffix] = React.useState(false)

    console.log(customSuffix);
    

    useEffect(() => {
        setTitle("Short links")
    }, [setTitle])

    return (
        <div>
            <Card >
                <CardHeader>
                    <CardTitle>Shorten link</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='w-md'>
                        <form className=''>
                            <div className='flex flex-col gap-6'>
                                <div className="w-md flex flex-col gap-3">
                                    <Label htmlFor="email">
                                        <i className='text-red-500 text-[12px]'>*</i>
                                        Url
                                    </Label>
                                    <Input
                                        id="url"
                                        type="text"
                                        placeholder="http://example.com/suffix"
                                        required
                                    />
                                </div>
                                <div className="w-md flex flex-col gap-3">
                                    <Label htmlFor="custom-suffix">Custom Suffix</Label>
                                    <Switch className='cursor-pointer' id='custom-suffix' checked={customSuffix} onClick={() => setCustomSuffix(!customSuffix)}/>
                                </div>
                                {
                                    customSuffix ? (
                                        <div className="w-md flex flex-col gap-3">
                                            <Label htmlFor="suffix">
                                                Custom Suffix
                                            </Label>
                                            <Input
                                                id="suffix"
                                                type="text"
                                                placeholder='fanpage-ticket'
                                            />
                                        </div>
                                    ) : null
                                }
                                <div className="w-md flex flex-col gap-3">
                                    <Label htmlFor="thumbnail">
                                        <i className='text-red-500 text-[12px]'>*</i>
                                        Ảnh Thumbnail
                                    </Label>
                                    <Input
                                        id="thumbnail"
                                        type="file"
                                        required
                                    />
                                </div>
                                <div className="w-md flex flex-col gap-3">
                                    <Label htmlFor="title">
                                        <i className='text-red-500 text-[12px]'>*</i>
                                        Tiêu Đề
                                    </Label>
                                    <Input
                                        id="title"
                                        type="text"
                                        required
                                    />
                                </div>
                                <div className="w-md flex flex-col gap-3">
                                    <Label htmlFor="description">
                                        <i className='text-red-500 text-[12px]'>*</i>
                                        Mô Tả
                                    </Label>
                                    <Textarea
                                        id="description"
                                        required
                                    />
                                </div>
                                <Button type="submit" >
                                    Lưu
                                </Button>
                            </div>
                        </form>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}