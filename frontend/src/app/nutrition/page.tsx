"use client";
import { useState, useEffect } from 'react';
import { Header } from '../../components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { TrendingUp, Award, Target, Utensils, Leaf, Zap } from 'lucide-react';

const DEMO_EMAIL = "demo@user.com";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function NutritionPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [nutritionData, setNutritionData] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      const usersRes = await fetch(`${API_URL}/users`);
      const users = await usersRes.json();
      const demoUser = users.find((u: any) => u.email === DEMO_EMAIL);
      setCurrentUser(demoUser);
      if (demoUser) {
        const profileRes = await fetch(`${API_URL}/user-profiles/${demoUser.id}`);
        setProfile(profileRes.ok ? await profileRes.json() : null);
        const nutritionRes = await fetch(`${API_URL}/nutrition-profiles/${demoUser.id}`);
        setNutritionData(nutritionRes.ok ? await nutritionRes.json() : []);
      }
    }
    fetchData();
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'grains': return <Utensils className="w-4 h-4" />;
      case 'vegetables': return <Leaf className="w-4 h-4" />;
      case 'proteins': return <Zap className="w-4 h-4" />;
      case 'healthy fats': return <Award className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const categoryData = nutritionData.reduce((acc: any, item: any) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const overallScore = nutritionData.length > 0 
    ? Math.round(nutritionData.reduce((sum, item) => sum + item.nutrition_score, 0) / nutritionData.length)
    : 0;

  if (!currentUser) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header currentUser={currentUser} onProfileUpdate={() => {}} />
      <div className="container mx-auto p-6 space-y-6">
        <div className="gradient-subtle p-6 rounded-lg">
          <h1 className="text-3xl font-bold mb-2">Nutrition Profile 📊</h1>
          <p className="text-muted-foreground">Track your food choices and nutrition scores</p>
        </div>
        <Card className="nutrition-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="w-5 h-5 mr-2 text-primary" />
              Your Nutrition Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>{overallScore}</div>
                <div className="text-sm text-muted-foreground">Overall Score</div>
              </div>
              <div className="flex-1">
                <Progress value={overallScore} className="h-3 mb-2" />
                <p className="text-sm text-muted-foreground">
                  {overallScore >= 85 ? 'Excellent nutrition choices!' : 
                   overallScore >= 70 ? 'Good progress, keep it up!' : 
                   'Room for improvement - try adding more whole foods'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="categories">By Category</TabsTrigger>
            <TabsTrigger value="goals">Goals & Progress</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-6">
            <Card className="nutrition-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                  Your Top Food Choices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {nutritionData.slice(0, 8).map((food: any, index: number) => (
                    <div key={food.food_name} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">{index + 1}</div>
                        <div>
                          <h4 className="font-medium">{food.food_name}</h4>
                          <p className="text-sm text-muted-foreground">{food.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getScoreColor(food.nutrition_score)}`}>{food.nutrition_score}/100</div>
                        <div className="text-sm text-muted-foreground">${food.monthly_spend}/month</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="categories" className="space-y-6">
            {Object.keys(categoryData).map((cat) => (
              <Card key={cat} className="nutrition-card">
                <CardHeader>
                  <CardTitle className="flex items-center">{getCategoryIcon(cat)}{cat}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {categoryData[cat].map((food: any, idx: number) => (
                      <div key={food.food_name} className="flex items-center justify-between p-2 border border-border rounded-lg">
                        <span>{food.food_name}</span>
                        <span className={`font-bold ${getScoreColor(food.nutrition_score)}`}>{food.nutrition_score}/100</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          <TabsContent value="goals" className="space-y-6">
            <Card className="nutrition-card">
              <CardHeader>
                <CardTitle>Nutrition Goals & Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-muted-foreground">(Goals and progress tracking coming soon!)</div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 