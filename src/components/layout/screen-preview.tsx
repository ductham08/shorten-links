import { Card, CardContent } from "@/components/ui/card";

interface IphonePreviewProps {
    children: React.ReactNode;
}

export default function IphonePreview({ children }: IphonePreviewProps) {
    return (
        <Card className="w-sm border-1 shadow-2xs p-4 rounded-2xl mt-4" >
            <CardContent className="p-0 h-full overflow-auto relative z-0">
                {children}
            </CardContent>
        </Card>
    );
}
