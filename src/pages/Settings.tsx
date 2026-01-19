import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

const Settings = () => {
    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full bg-background">
                <DashboardSidebar />

                <div className="flex-1 flex flex-col">
                    <DashboardHeader />

                    <main className="flex-1 p-6">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
                            <p className="text-muted-foreground mt-1">
                                Manage your account and preferences
                            </p>
                        </div>

                        <div className="max-w-2xl space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Organization Profile</CardTitle>
                                    <CardDescription>Update your organization details</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="org-name">Organization Name</Label>
                                        <Input id="org-name" defaultValue="Kenyatta National Hospital" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Contact Email</Label>
                                        <Input id="email" type="email" defaultValue="admin@knh.or.ke" />
                                    </div>
                                    <Button>Save Changes</Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Notifications</CardTitle>
                                    <CardDescription>Configure alert preferences</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Email Alerts</p>
                                            <p className="text-sm text-muted-foreground">Receive outbreak alerts via email</p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">SMS Alerts</p>
                                            <p className="text-sm text-muted-foreground">Critical alerts sent via SMS</p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Weekly Digest</p>
                                            <p className="text-sm text-muted-foreground">Weekly summary of predictions</p>
                                        </div>
                                        <Switch />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>API Access</CardTitle>
                                    <CardDescription>Manage API keys for integrations</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="p-4 bg-muted rounded-lg">
                                        <p className="text-sm text-muted-foreground">
                                            API access is available on Enterprise plans. Contact support for more information.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
};

export default Settings;
