import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingDown, TrendingUp, DollarSign, Store, AlertCircle, CheckCircle } from 'lucide-react';
import { getUserByEmail, updateUser } from '@/api/users';
import { createOrUpdateProfile } from '@/api/userProfiles';
import { useToast } from '@/hooks/use-toast';

// Mock price tracking data
const priceData = [
  {
    item_name: "Quinoa",
    current_price: 5.99,
    price_history: [
      { store: "Whole Foods", price: 6.99, date: "2025-01-15" },
      { store: "Trader Joe's", price: 4.49, date: "2025-01-15" },
      { store: "Walmart", price: 5.99, date: "2025-01-15" },
      { store: "Whole Foods", price: 7.25, date: "2025-01-01" },
      { store: "Trader Joe's", price: 4.49, date: "2025-01-01" }
    ],
    trend: "down",
    savings_opportunity: 2.50,
    recommended_substitute: "Brown rice (30% cheaper, similar nutrition)"
  },
  {
    item_name: "Avocados",
    current_price: 1.99,
    price_history: [
      { store: "Whole Foods", price: 2.50, date: "2025-01-15" },
      { store: "Trader Joe's", price: 1.99, date: "2025-01-15" },
      { store: "Walmart", price: 1.89, date: "2025-01-15" },
      { store: "Whole Foods", price: 2.25, date: "2025-01-01" },
      { store: "Trader Joe's", price: 1.89, date: "2025-01-01" }
    ],
    trend: "stable",
    savings_opportunity: 0.61,
    recommended_substitute: "Olive oil (lower cost per serving for healthy fats)"
  },
  {
    item_name: "Sweet Potatoes",
    current_price: 1.49,
    price_history: [
      { store: "Whole Foods", price: 1.99, date: "2025-01-15" },
      { store: "Trader Joe's", price: 1.49, date: "2025-01-15" },
      { store: "Walmart", price: 1.29, date: "2025-01-15" },
      { store: "Whole Foods", price: 1.75, date: "2025-01-01" },
      { store: "Trader Joe's", price: 1.39, date: "2025-01-01" }
    ],
    trend: "up",
    savings_opportunity: 0.70,
    recommended_substitute: "Regular potatoes (50% cheaper, similar carbs)"
  }
];

const chartData = [
  { month: 'Dec', quinoa: 6.99, avocados: 2.25, sweetPotatoes: 1.75 },
  { month: 'Jan', quinoa: 6.50, avocados: 2.10, sweetPotatoes: 1.60 },
  { month: 'Now', quinoa: 5.99, avocados: 1.99, sweetPotatoes: 1.49 }
];

const PriceTracker = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedItem, setSelectedItem] = useState(priceData[0]);
  const { toast } = useToast();

  useEffect(() => {
    const demoUser = getUserByEmail('demo@user.com');
    if (demoUser) {
      setCurrentUser(demoUser);
    }
  }, []);

  const handleProfileUpdate = (profileData: any) => {
    if (currentUser) {
      updateUser(currentUser.id, { isFirstTime: false });
      createOrUpdateProfile(currentUser.id, profileData);
      setCurrentUser(prev => prev ? { ...prev, isFirstTime: false } : null);
      toast({
        title: "Profile Updated! 🎉",
        description: "Your nutrition and budget preferences have been saved.",
      });
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-green-500" />;
      default: return <DollarSign className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-red-500';
      case 'down': return 'text-green-500';
      default: return 'text-yellow-500';
    }
  };

  if (!currentUser) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header currentUser={currentUser} onProfileUpdate={handleProfileUpdate} />
      
      <div className="container mx-auto p-6 space-y-6">
        {/* Page Header */}
        <div className="gradient-subtle p-6 rounded-lg">
          <h1 className="text-3xl font-bold mb-2">Price Tracker 💰</h1>
          <p className="text-muted-foreground">Monitor food prices and find the best deals</p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="nutrition-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Savings</p>
                  <p className="text-2xl font-bold text-green-600">$24.50</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="nutrition-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Best Store</p>
                  <p className="text-2xl font-bold">Trader Joe's</p>
                </div>
                <Store className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="nutrition-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Price Alerts</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <AlertCircle className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Price Overview</TabsTrigger>
            <TabsTrigger value="trends">Price Trends</TabsTrigger>
            <TabsTrigger value="substitutes">Smart Substitutes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Item List */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="nutrition-card">
                <CardHeader>
                  <CardTitle>Tracked Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {priceData.map((item) => (
                      <div 
                        key={item.item_name}
                        className={`p-3 border border-border rounded-lg cursor-pointer transition-smooth hover:bg-accent/20 ${
                          selectedItem.item_name === item.item_name ? 'bg-accent/30 border-primary' : ''
                        }`}
                        onClick={() => setSelectedItem(item)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{item.item_name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Best: ${Math.min(...item.price_history.map(p => p.price)).toFixed(2)}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center">
                              {getTrendIcon(item.trend)}
                              <span className={`ml-1 text-lg font-bold ${getTrendColor(item.trend)}`}>
                                ${item.current_price}
                              </span>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              Save ${item.savings_opportunity}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Selected Item Details */}
              <Card className="nutrition-card">
                <CardHeader>
                  <CardTitle>{selectedItem.item_name} Price Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedItem.price_history
                      .filter(entry => entry.date === "2025-01-15")
                      .sort((a, b) => a.price - b.price)
                      .map((entry, index) => (
                      <div key={entry.store} className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div className="flex items-center space-x-3">
                          {index === 0 && <Badge variant="default" className="text-xs">Best Deal</Badge>}
                          <span className="font-medium">{entry.store}</span>
                        </div>
                        <span className="text-lg font-bold">${entry.price}</span>
                      </div>
                    ))}
                    
                    <div className="pt-4 border-t border-border">
                      <h4 className="font-medium mb-2">💡 Money Saving Tip</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedItem.recommended_substitute}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card className="nutrition-card">
              <CardHeader>
                <CardTitle>Price Trends Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, '']} />
                      <Line type="monotone" dataKey="quinoa" stroke="#4CAF50" strokeWidth={2} name="Quinoa" />
                      <Line type="monotone" dataKey="avocados" stroke="#FF9800" strokeWidth={2} name="Avocados" />
                      <Line type="monotone" dataKey="sweetPotatoes" stroke="#9C27B0" strokeWidth={2} name="Sweet Potatoes" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="nutrition-card">
              <CardHeader>
                <CardTitle>Store Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { store: 'Walmart', average: 3.06 },
                      { store: "Trader Joe's", average: 2.66 },
                      { store: 'Whole Foods', average: 3.83 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="store" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, 'Average Price']} />
                      <Bar dataKey="average" fill="#4CAF50" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="substitutes" className="space-y-6">
            <div className="grid gap-6">
              {priceData.map((item) => (
                <Card key={item.item_name} className="nutrition-card">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{item.item_name}</span>
                      <Badge variant="outline">Save ${item.savings_opportunity}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Current Choice</h4>
                        <div className="p-3 border border-border rounded-lg">
                          <div className="flex justify-between">
                            <span>{item.item_name}</span>
                            <span className="font-bold">${item.current_price}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Recommended Alternative</h4>
                        <div className="p-3 border border-primary/30 bg-primary/5 rounded-lg">
                          <p className="text-sm">{item.recommended_substitute}</p>
                          <Button variant="cta" size="sm" className="mt-2 w-full">
                            Try This Alternative
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PriceTracker;