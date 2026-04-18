import React, { useState, useEffect } from 'react';
import { ApiClient } from 'adminjs';
import { Box, H2, Text, Table, TableRow, TableCell, TableHead, TableBody, Badge, Button } from '@adminjs/design-system';

// We dynamically require Recharts so it doesn't break AdminJS SSR lifecycle during static export logic.
const api = new ApiClient();

const GridContainer = ({ children, columns = 1 }) => (
  <Box style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, minmax(200px, 1fr))`, gap: '1.5rem', marginBottom: '1.5rem' }}>
    {children}
  </Box>
);

const MetricCard = ({ title, value, color }) => (
  <Box 
    variant="white" 
    boxShadow="card" 
    p="lg" 
    style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      borderTop: `4px solid ${color}`, 
      borderRadius: '8px' 
    }}
  >
    <Text variant="sm" color="grey60">{title}</Text>
    <H2 mt="default" mb="default" style={{ color }}>{value}</H2>
  </Box>
);

const getStatusColor = (status) => {
  if (status === 'completed') return 'success';
  if (status === 'pending') return 'warning';
  if (status === 'cancelled') return 'danger';
  return 'primary';
};

const Dashboard = () => {
  const [data, setData] = useState({
    usersCount: 0,
    ordersCount: 0,
    productsCount: 0,
    revenue: 0.00,
    recentOrders: [],
    orderStats: [],
    currentUser: null,
    isUser: false,
    isAdmin: false
  });
  
  const [Recharts, setRecharts] = useState(null);

  useEffect(() => {
    // Dynamic import to avoid SSR errors in AdminJS with 'redux' injection
    import('recharts').then(mod => {
      setRecharts(mod);
    }).catch(err => console.error("Could not load Recharts", err));

    api.getDashboard().then((response) => {
      setData(response.data || {});
    }).catch(err => {
      console.error('Failed to load dashboard stats', err);
    });
  }, []);

  const { recentOrders, usersCount, revenue, ordersCount, currentUser, isUser, isAdmin, orderStats = [] } = data;
  const PIE_COLORS = ['#ff9800', '#4caf50', '#f44336']; // Pending, Completed, Cancelled

  if (isUser) {
    return (
      <Box variant="grey" p="xl" style={{ minHeight: '100vh' }}>
        <Box mb="xl">
          <H2>Welcome back, {currentUser?.email}</H2>
          <Text color="grey60">Here is your personal dashboard.</Text>
        </Box>

        <GridContainer columns={2}>
          {/* User Info Column */}
          <Box variant="white" boxShadow="card" p="lg" borderRadius="8px">
            <H2 mb="lg">Personal Information</H2>
            <Box mb="default"><Text color="grey60">Account ID:</Text><Text style={{fontFamily: 'monospace'}}>{currentUser?.id}</Text></Box>
            <Box mb="default"><Text color="grey60">Email Address:</Text><Text>{currentUser?.email}</Text></Box>
            <Box mb="default"><Text color="grey60">Account Role:</Text><Badge variant="primary">{currentUser?.role}</Badge></Box>
          </Box>

          {/* Recent Orders Column */}
          <Box variant="white" boxShadow="card" p="lg" borderRadius="8px">
            <Box flex flexDirection="row" justifyContent="space-between" mb="lg">
              <H2>Your Recent Orders</H2>
            </Box>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentOrders && recentOrders.length > 0 ? (
                  recentOrders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell>#{order.id.slice(0, 8)}</TableCell>
                      <TableCell>${order.total}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(order.status)}>{order.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} style={{ textAlign: 'center' }}>No recent orders found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        </GridContainer>
      </Box>
    );
  }

  return (
    <Box variant="grey" p="xl" style={{ minHeight: '100vh' }}>
      <Box mb="xl">
        <H2>Dashboard Overview</H2>
        <Text color="grey60">Welcome back to the eCommerce Admin Panel.</Text>
      </Box>

      {/* Metrics Row */}
      <GridContainer columns={3}>
        <MetricCard title="Total Revenue" value={`$${Number(revenue).toFixed(2)}`} color="#4caf50" />
        <MetricCard title="Active Users" value={usersCount?.toString() || "0"} color="#2196f3" />
        <MetricCard title="Total Orders" value={ordersCount?.toString() || "0"} color="#ff9800" />
      </GridContainer>

      {/* Second Row Component */}
      <GridContainer columns={2}>
        {/* Pie Chart */}
        <Box variant="white" boxShadow="card" p="lg" borderRadius="8px" style={{ display: 'flex', flexDirection: 'column' }}>
          <H2 mb="lg">Orders by Status</H2>
          <Box flex flexDirection="column" alignItems="center" justifyContent="center" flexGrow={1} style={{ minHeight: '300px' }}>
            {orderStats.reduce((a, b) => a + b.value, 0) > 0 && Recharts ? (
              <Recharts.ResponsiveContainer width="100%" height="100%">
                <Recharts.PieChart>
                  <Recharts.Pie
                    data={orderStats}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {orderStats.map((entry, index) => (
                      <Recharts.Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Recharts.Pie>
                  <Recharts.Tooltip />
                  <Recharts.Legend />
                </Recharts.PieChart>
              </Recharts.ResponsiveContainer>
            ) : (
               <Text color="grey40">No orders to display, or loading chart...</Text>
            )}
          </Box>
        </Box>

        {/* Quick Links */}
        <Box variant="white" boxShadow="card" p="lg" borderRadius="8px">
          <H2 mb="lg">Quick Links</H2>
          <Box flex flexDirection="column" gap="1rem">
            <Button as="a" href="/admin/resources/Products" variant="primary" style={{ width: '100%', marginBottom: '10px' }}>
              Manage Products
            </Button>
            <Button as="a" href="/admin/resources/Categories" variant="secondary" style={{ width: '100%', marginBottom: '10px' }}>
              Manage Categories
            </Button>
            <Button as="a" href="/admin/resources/Users" variant="text" style={{ width: '100%' }}>
              Manage Users
            </Button>
          </Box>
        </Box>
      </GridContainer>

      {/* Bottom Block Component */}
      <GridContainer columns={1}>
        <Box variant="white" boxShadow="card" p="lg" borderRadius="8px">
          <Box flex flexDirection="row" justifyContent="space-between" mb="lg">
            <H2>Recent Orders</H2>
            <Button as="a" href="/admin/resources/Orders">View All</Button>
          </Box>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentOrders && recentOrders.length > 0 ? (
                recentOrders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell>#{order.id.slice(0, 8)}</TableCell>
                    <TableCell>{order.userEmail}</TableCell>
                    <TableCell>${order.total}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(order.status)}>{order.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} style={{ textAlign: 'center' }}>No recent orders found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      </GridContainer>

    </Box>
  );
};

export default Dashboard;
