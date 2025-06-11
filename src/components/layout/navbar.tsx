import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { Menu } from "lucide-react";

import Navigation from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import {
    NavbarCenter,
    Navbar as NavbarComponent,
    NavbarLeft,
    NavbarRight,
} from "@/components/ui/navbar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import LaunchUI from "@/components/logos/launch-ui";
import { ModeToggle } from "@/components/ui/button-toggle";
import Link from "next/link";

interface NavbarLink {
    text: string;
    href: string;
}

interface NavbarActionProps {
    text: string;
    href: string;
    variant?: ButtonProps["variant"];
    icon?: ReactNode;
    iconRight?: ReactNode;
    isButton?: boolean;
}

interface NavbarProps {
    logo?: ReactNode;
    name?: string;
    homeUrl?: string;
    mobileLinks?: NavbarLink[];
    actions?: NavbarActionProps[];
    showNavigation?: boolean;
    customNavigation?: ReactNode;
    className?: string;
}

type ButtonProps = React.ComponentProps<typeof Button>;

export default function Navbar({
    logo = <LaunchUI />,
    name = "Launch UI",
    homeUrl = siteConfig.url,
    mobileLinks = [
        { text: "Getting Started", href: siteConfig.url },
        { text: "Components", href: siteConfig.url },
        { text: "Documentation", href: siteConfig.url },
    ],
    actions = [
        { text: "Sign in", href: siteConfig.url, isButton: false },
        {
            text: "Get Started",
            href: siteConfig.url,
            isButton: true,
            variant: "default",
        },
    ],
    showNavigation = true,
    customNavigation,
    className,
}: NavbarProps) {
    return (
        <header className={cn("sticky top-0 z-50 -mb-4 px-4 pb-4", className)}>
            <div className="fade-bottom bg-background/15 absolute left-0 h-24 w-full"></div>
            <div className="max-w-container relative mx-auto">
                <NavbarComponent>
                    <NavbarLeft>
                        <Link
                            href={homeUrl}
                            className="flex items-center gap-2 text-xl font-bold"
                        >
                            {logo}
                            {name}
                        </Link>
                    </NavbarLeft>
                    <NavbarCenter>
                        {showNavigation && (customNavigation || <Navigation />)}
                    </NavbarCenter>
                    <NavbarRight>
                        {actions.map((action, index) =>
                            action.isButton ? (
                                <Button
                                    key={index}
                                    variant={action.variant || "default"}
                                    asChild
                                >
                                    <Link href={action.href}>
                                        {action.icon}
                                        {action.text}
                                        {action.iconRight}
                                    </Link>
                                </Button>
                            ) : (
                                <Link
                                    key={index}
                                    href={action.href}
                                    className="hidden text-sm md:block"
                                >
                                    {action.text}
                                </Link>
                            ),
                        )}
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="shrink-0 md:hidden"
                                >
                                    <Menu className="size-5" />
                                    <span className="sr-only">Toggle navigation menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right">
                                <nav className="grid gap-6 text-lg font-medium">
                                    <Link
                                        href={homeUrl}
                                        className="flex items-center gap-2 text-xl font-bold"
                                    >
                                        <span>{name}</span>
                                    </Link>
                                    {mobileLinks.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.href}
                                            className="text-muted-foreground hover:text-foreground"
                                        >
                                            {link.text}
                                        </Link>
                                    ))}
                                </nav>
                            </SheetContent>
                            <ModeToggle/>
                        </Sheet>
                    </NavbarRight>
                </NavbarComponent>
            </div>
        </header>
    );
}
