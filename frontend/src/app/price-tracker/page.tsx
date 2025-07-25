"use client";
import { useState, useEffect } from 'react';
import { Header } from '../../components/Header';
import { Card, CardContent } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { TrendingDown, TrendingUp, DollarSign, Store, AlertCircle, CheckCircle } from 'lucide-react';

const DEMO_EMAIL = "demo@user.com";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function PriceTrackerPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [priceData, setPriceData] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    async function fetchUserAndPrices() {
      const usersRes = await fetch(`${API_URL}/users`);
      const users = await usersRes.json();
      const demoUser = users.find((u: any) => u.email === DEMO_EMAIL);
      setCurrentUser(demoUser);
      if (demoUser) {
        const pricesRes = await fetch(`${API_URL}/price-tracking`);
        const prices = await pricesRes.json();
        setPriceData(prices);
        setSelectedItem(prices[0]);
      }
    }
    fetchUserAndPrices();
  }, []);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-green-500" />;
      default: return <DollarSign className="w-4 h-4 text-yellow-500" />;
    }
  };

  if (!currentUser) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header currentUser={currentUser} onProfileUpdate={() => {}} />
      <div className="container mx-auto p-6 space-y-6">
        <div className="gradient-subtle p-6 rounded-lg">
          <h1 className="text-3xl font-bold mb-2">Price Tracker 💰</h1>
          <p className="text-muted-foreground">Monitor food prices and find the best deals</p>
        </div>
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
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="nutrition-card">
                <CardContent>
                  <div className="space-y-3">
                    {priceData.map((item: any) => (
                      <div
                        key={item.item_name}
                        className={`p-3 border border-border rounded-lg cursor-pointer transition-smooth hover:bg-accent/20 ${selectedItem?.item_name === item.item_name ? 'bg-accent/30 border-primary' : ''}`}
                        onClick={() => setSelectedItem(item)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{item.item_name}</span>
                          {getTrendIcon(item.trend)}
                        </div>
                        <div className="text-sm text-muted-foreground">Current: ${item.current_price}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              {selectedItem && (
                <Card className="nutrition-card">
                  <CardContent>
                    <div className="font-bold text-lg mb-2">{selectedItem.item_name}</div>
                    <div className="text-sm mb-2">Current Price: <span className="font-semibold">${selectedItem.current_price}</span></div>
                    <div className="text-sm mb-2">Trend: {getTrendIcon(selectedItem.trend)}</div>
                    <div className="text-sm mb-2">Recommended Substitute: {selectedItem.recommended_substitute}</div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          <TabsContent value="trends" className="space-y-6">
            <Card className="nutrition-card">
              <CardContent>
                <div className="text-muted-foreground">(Price trends chart coming soon!)</div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="substitutes" className="space-y-6">
            <Card className="nutrition-card">
              <CardContent>
                <div className="text-muted-foreground">(Smart substitutes and savings tips coming soon!)</div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 