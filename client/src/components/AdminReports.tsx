import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Property } from "@/pages/AdminDashboard";

interface AdminReportsProps {
  properties: Property[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function AdminReports({ properties }: AdminReportsProps) {
  const stats = useMemo(() => {
    const totalProperties = properties.length;
    const soldProperties = properties.filter(p => p.status === 'sold').length;
    const inProgressProperties = properties.filter(p => p.status === 'in_progress').length;
    const pendingProperties = properties.filter(p => p.status === 'pending').length;
    const featuredProperties = properties.filter(p => p.featured).length;
    
    const totalInvestmentValue = properties.reduce((acc, p) => acc + (p.targetEquity || 0), 0);
    const averageInvestment = totalInvestmentValue / totalProperties || 0;
    
    const propertiesByType = properties.reduce((acc, p) => {
      acc[p.type] = (acc[p.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const propertiesByStatus = [
      { name: 'Sold', value: soldProperties },
      { name: 'In Progress', value: inProgressProperties },
      { name: 'Pending', value: pendingProperties },
    ];

    const typeData = Object.entries(propertiesByType).map(([name, value]) => ({
      name,
      value,
    }));

    return {
      totalProperties,
      soldProperties,
      inProgressProperties,
      pendingProperties,
      featuredProperties,
      totalInvestmentValue,
      averageInvestment,
      propertiesByStatus,
      typeData,
    };
  }, [properties]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProperties}</div>
            <p className="text-xs text-muted-foreground">
              {stats.featuredProperties} featured
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sold Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.soldProperties}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.soldProperties / stats.totalProperties) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgressProperties}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.inProgressProperties / stats.totalProperties) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investment Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalInvestmentValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              ${stats.averageInvestment.toLocaleString()} avg. per property
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Properties by Status</CardTitle>
            <CardDescription>
              Distribution of properties across different statuses
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.propertiesByStatus}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {stats.propertiesByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Properties by Type</CardTitle>
            <CardDescription>
              Number of properties in each category
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.typeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
