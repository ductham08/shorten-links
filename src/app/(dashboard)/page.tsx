import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader>
                    <CardTitle>Users</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Manage all users</p>
                </CardContent>
            </Card>
            {/* Add more cards as per shadcn/ui dashboard template */}
        </div>
    );
}