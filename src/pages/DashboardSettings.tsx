import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DashboardBreadcrumbs } from "@/components/dashboard/DashboardBreadcrumbs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  UserCheck,
  UserX,
  Clock,
  CheckCircle2,
  Mail,
  Building,
  MapPin,
  Shield,
  Users
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock pending operators data
const mockPendingOperators = [
  {
    id: "op-002",
    full_name: "Nurse Grace Otieno",
    email: "nurse.otieno@gmail.com",
    phone: "+254723456789",
    organization: "Moi Teaching and Referral Hospital",
    license_number: "NCK-67890",
    county: "Nakuru",
    role: "nurse",
    created_at: "2026-01-20T14:15:00Z"
  },
  {
    id: "op-003",
    full_name: "Dr. Faith Wanjiku",
    email: "faith.wanjiku@gmail.com",
    phone: "+254734567890",
    organization: "Coast General Hospital",
    license_number: "PPB-54321",
    county: "Mombasa",
    role: "pharmacist",
    created_at: "2026-02-01T09:45:00Z"
  },
  {
    id: "op-004",
    full_name: "Dr. Peter Ochieng",
    email: "peter.ochieng@gmail.com",
    phone: "+254745678901",
    organization: "Kisii Teaching Hospital",
    license_number: "KMB-98765",
    county: "Kisii",
    role: "doctor",
    created_at: "2026-02-03T11:30:00Z"
  }
];

const mockVerifiedOperators = [
  {
    id: "op-001",
    full_name: "Dr. James Mwangi",
    email: "dr.mwangi@gmail.com",
    organization: "Kenyatta National Hospital",
    county: "Nairobi",
    role: "doctor",
    verified_at: "2025-12-01T10:00:00Z"
  }
];

const DashboardSettings = () => {
  const [pendingOperators, setPendingOperators] = useState(mockPendingOperators);
  const [verifiedOperators, setVerifiedOperators] = useState(mockVerifiedOperators);
  const { toast } = useToast();

  const handleApprove = (operatorId: string) => {
    const operator = pendingOperators.find(op => op.id === operatorId);
    if (operator) {
      // Move to verified
      setVerifiedOperators(prev => [...prev, {
        ...operator,
        verified_at: new Date().toISOString()
      }]);
      setPendingOperators(prev => prev.filter(op => op.id !== operatorId));

      toast({
        title: "Operator Approved ✓",
        description: `${operator.full_name} has been verified and notified via email.`,
      });
    }
  };

  const handleReject = (operatorId: string) => {
    const operator = pendingOperators.find(op => op.id === operatorId);
    setPendingOperators(prev => prev.filter(op => op.id !== operatorId));

    toast({
      title: "Application Rejected",
      description: `${operator?.full_name}'s application has been rejected.`,
      variant: "destructive"
    });
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      doctor: "bg-blue-500",
      nurse: "bg-green-500",
      pharmacist: "bg-purple-500",
      lab_technician: "bg-orange-500",
      health_officer: "bg-cyan-500"
    };
    return (
      <Badge className={`${colors[role] || 'bg-gray-500'} capitalize`}>
        {role.replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />

        <div className="flex-1 flex flex-col">
          <DashboardHeader />

          <main className="flex-1 p-6 overflow-auto">
            <DashboardBreadcrumbs />
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Settings</h1>
              <p className="text-muted-foreground mt-1">
                Manage your account, preferences, and health operator approvals
              </p>
            </div>

            <Tabs defaultValue="operators" className="space-y-6">
              <TabsList className="grid grid-cols-5 w-full max-w-2xl">
                <TabsTrigger value="operators" className="gap-2">
                  <Users className="h-4 w-4" />
                  Operators
                </TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="organization">Organization</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="alerts">Alerts</TabsTrigger>
              </TabsList>

              {/* Health Operators Tab */}
              <TabsContent value="operators" className="space-y-6">
                {/* Admin Notice */}
                <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
                  <CardContent className="flex items-center gap-4 py-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Admin Access</p>
                      <p className="text-sm text-muted-foreground">
                        You can approve or reject health operator applications. Approved operators can upload verified reports.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Pending Approvals */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-orange-500" />
                      Pending Approvals
                      {pendingOperators.length > 0 && (
                        <Badge variant="destructive" className="ml-2">{pendingOperators.length}</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      Health operators awaiting verification. Review their credentials before approving.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {pendingOperators.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
                        <p>No pending applications</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Operator</TableHead>
                            <TableHead>Organization</TableHead>
                            <TableHead>County</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>License</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pendingOperators.map((operator) => (
                            <TableRow key={operator.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-primary/10 text-primary">
                                      {operator.full_name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">{operator.full_name}</p>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                      <Mail className="h-3 w-3" />
                                      {operator.email}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Building className="h-4 w-4 text-muted-foreground" />
                                  {operator.organization}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  {operator.county}
                                </div>
                              </TableCell>
                              <TableCell>{getRoleBadge(operator.role)}</TableCell>
                              <TableCell className="font-mono text-sm">{operator.license_number}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleApprove(operator.id)}
                                    className="bg-green-500 hover:bg-green-600"
                                  >
                                    <UserCheck className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleReject(operator.id)}
                                  >
                                    <UserX className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>

                {/* Verified Operators */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      Verified Health Operators
                    </CardTitle>
                    <CardDescription>
                      These operators can upload verified health reports to the system.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Operator</TableHead>
                          <TableHead>Organization</TableHead>
                          <TableHead>County</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Verified</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {verifiedOperators.map((operator) => (
                          <TableRow key={operator.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback className="bg-green-500/10 text-green-500">
                                    {operator.full_name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{operator.full_name}</p>
                                  <p className="text-sm text-muted-foreground">{operator.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{operator.organization}</TableCell>
                            <TableCell>{operator.county}</TableCell>
                            <TableCell>{getRoleBadge(operator.role)}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(operator.verified_at).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-20 h-20">
                        <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                          RJ
                        </AvatarFallback>
                      </Avatar>
                      <Button variant="outline">Change Avatar</Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" defaultValue="Razinger Josef" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" defaultValue="razingerjosef@gmail.com" disabled />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" defaultValue="+254700000000" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="title">Job Title</Label>
                        <Input id="title" defaultValue="System Administrator" />
                      </div>
                    </div>

                    <Button>Save Changes</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Password & Security</CardTitle>
                    <CardDescription>Update your password and security settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current">Current Password</Label>
                      <Input id="current" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new">New Password</Label>
                      <Input id="new" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm">Confirm New Password</Label>
                      <Input id="confirm" type="password" />
                    </div>
                    <Button>Update Password</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="organization" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Organization Details</CardTitle>
                    <CardDescription>Manage your organization information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="org-name">Organization Name</Label>
                      <Input id="org-name" defaultValue="EpiPredict Kenya" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="org-type">Type</Label>
                        <Input id="org-type" defaultValue="Health Tech Platform" disabled />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="county">County</Label>
                        <Input id="county" defaultValue="Nairobi" />
                      </div>
                    </div>
                    <Button>Save Changes</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Channels</CardTitle>
                    <CardDescription>Choose how you want to receive notifications</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-notif">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive updates via email</p>
                      </div>
                      <Switch id="email-notif" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="sms-notif">SMS Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive critical alerts via SMS</p>
                      </div>
                      <Switch id="sms-notif" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="operator-notif">New Operator Applications</Label>
                        <p className="text-sm text-muted-foreground">Get notified when new operators apply</p>
                      </div>
                      <Switch id="operator-notif" defaultChecked />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="alerts" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Alert Preferences</CardTitle>
                    <CardDescription>Configure your disease monitoring preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="monitor-all">Monitor All Counties</Label>
                        <p className="text-sm text-muted-foreground">Receive alerts from all 47 counties</p>
                      </div>
                      <Switch id="monitor-all" defaultChecked />
                    </div>

                    <div className="space-y-2">
                      <Label>Disease Monitoring</Label>
                      <div className="space-y-3">
                        {["Malaria", "Flu/Influenza", "Cholera", "Typhoid", "Dengue Fever", "Rift Valley Fever"].map((disease) => (
                          <div key={disease} className="flex items-center space-x-2">
                            <Switch id={disease.toLowerCase()} defaultChecked />
                            <Label htmlFor={disease.toLowerCase()} className="font-normal">{disease}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardSettings;

