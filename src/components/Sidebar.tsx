import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function Sidebar() {
    return (
        <div className="w-64 bg-gray-100 h-screen p-4">
            <nav>
                <ul>
                    <li>
                        <Link href="/dashboard">
                            <Button variant="ghost">Dashboard</Button>
                        </Link>
                    </li>
                    <li>
                        <Link href="/dashboard/admin">
                            <Button variant="ghost">Admin Panel</Button>
                        </Link>
                    </li>
                    <li>
                        <Link href="/dashboard/users">
                            <Button variant="ghost">Users</Button>
                        </Link>
                    </li>
                </ul>
            </nav>
        </div>
    );
}