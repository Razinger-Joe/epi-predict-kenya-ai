import { useLocation, Link } from "react-router-dom";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";

export function DashboardBreadcrumbs() {
    const location = useLocation();
    const pathnames = location.pathname.split("/").filter((x) => x);

    return (
        <Breadcrumb className="mb-6">
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link to="/" className="flex items-center gap-1">
                            <Home className="h-3.5 w-3.5" />
                            <span className="sr-only">Home</span>
                        </Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                {pathnames.length > 0 && <BreadcrumbSeparator />}

                {pathnames.map((value, index) => {
                    const last = index === pathnames.length - 1;
                    const to = `/${pathnames.slice(0, index + 1).join("/")}`;
                    const label = value.charAt(0).toUpperCase() + value.slice(1);

                    return (
                        <div key={to} className="flex items-center gap-1.5">
                            <BreadcrumbItem>
                                {last ? (
                                    <BreadcrumbPage>{label}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink asChild>
                                        <Link to={to}>{label}</Link>
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                            {!last && <BreadcrumbSeparator />}
                        </div>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
