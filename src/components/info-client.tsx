import { useAuth } from '@/hooks/useAuth';
import React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { IconEdit, IconLogout } from '@tabler/icons-react';

const InfoClient = () => {

    const { user, loading } = useAuth();
    const { logout } = useAuth()

    return (
        <Card className='w-md flex flex-col justify-between'> 
            <div className='flex flex-col gap-6'>
                <CardHeader>
                    <CardTitle>Info Client</CardTitle>
                    <CardDescription>User information</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className='flex flex-col gap-2'>
                        <div>
                            <div className="text-sm">Full Name:</div>
                            <div className="text-sm text-muted-foreground">
                                - {user?.name || 'Untitled'}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm">Email:</div>
                            <div className="text-sm text-muted-foreground">
                                - {user?.email || 'Untitled'}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm">Role:</div>
                            <div className="text-sm text-muted-foreground">
                                - {user?.role || 'Untitled'}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </div>
            <CardFooter className='flex gap-2 items-center justify-between'>
                <Button
                    variant="outline"
                    size="sm"
                >
                    <IconEdit/> Edit
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={logout}
                >
                    <IconLogout/> Log out
                </Button>
            </CardFooter>
        </Card>
    )
}

export default InfoClient