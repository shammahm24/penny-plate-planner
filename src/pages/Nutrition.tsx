import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Award, Target, Utensils, Leaf, Zap } from 'lucide-react';
import { getUserByEmail, updateUser } from '@/api/users';
import { createOrUpdateProfile, getProfileByUserId } from '@/api/userProfiles';
import { getNutritionProfileByUserId, getTopFoodsByUserId } from '@/api/nutritionProfiles';
import { useToast } from '@/hooks/use-toast';

const Nutrition = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [nutritionData, setNutritionData] = useState([]);
  const [profile, setProfile] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const demoUser = getUserByEmail('demo@user.com');
    if (demoUser) {
      setCurrentUser(demoUser);
      const userProfile = getProfileByUserId(demoUser.id);
      const nutrition = getNutritionProfileByUserId(demoUser.id);
      setProfile(userProfile);
      setNutritionData(nutrition);
    }
  }, []);

  const handleProfileUpdate = (profileData: any) => {
    if (currentUser) {
      updateUser(currentUser.id, { isFirstTime: false });
      createOrUpdateProfile(currentUser.id, profileData);
      setCurrentUser(prev => prev ? { ...prev, isFirstTime: false } : null);
      setProfile(createOrUpdateProfile(currentUser.id, profileData));
      toast({
        title: "Profile Updated! 🎉",
        description: "Your nutrition and budget preferences have been saved.",
      });
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
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

  const categoryData = nutritionData.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
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
      <Header currentUser={currentUser} onProfileUpdate={handleProfileUpdate} />
      
      <div className="container mx-auto p-6 space-y-6">
        {/* Page Header */}
        <div className="gradient-subtle p-6 rounded-lg">
          <h1 className="text-3xl font-bold mb-2">Nutrition Profile 📊</h1>
          <p className="text-muted-foreground">Track your food choices and nutrition scores</p>
        </div>

        {/* Overall Score */}
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
                <div className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
                  {overallScore}
                </div>
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
            {/* Top Foods */}
            <Card className="nutrition-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                  Your Top Food Choices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {nutritionData.slice(0, 8).map((food, index) => (
                    <div key={food.food_name} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium">{food.food_name}</h4>
                          <p className="text-sm text-muted-foreground">{food.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getScoreColor(food.nutrition_score)}`}>
                          {food.nutrition_score}/100
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ${food.monthly_spend}/month
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {Object.entries(categoryData).map(([category, foods]) => (
                <Card key={category} className="nutrition-card">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      {getCategoryIcon(category)}
                      <span className="ml-2">{category}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(foods as any[]).map((food) => (
                        <div key={food.food_name} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{food.food_name}</span>
                          <Badge variant={food.nutrition_score >= 85 ? "default" : "secondary"}>
                            {food.nutrition_score}/100
                          </Badge>
                        </div>
                      ))}
                      <div className="pt-2 border-t border-border">
                        <div className="flex justify-between text-sm">
                          <span>Category Average:</span>
                          <span className="font-medium">
                            {Math.round((foods as any[]).reduce((sum, f) => sum + f.nutrition_score, 0) / (foods as any[]).length)}/100
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <Card className="nutrition-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2 text-primary" />
                  Nutrition Goals Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Daily Vegetable Servings</span>
                      <span className="text-sm">3/5</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Protein Intake</span>
                      <span className="text-sm">85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Whole Grains</span>
                      <span className="text-sm">Good</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Healthy Fats</span>
                      <span className="text-sm">Excellent</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                </div>
                
                {profile && (
                  <div className="mt-6 p-4 bg-accent/20 rounded-lg">
                    <h4 className="font-medium mb-2">Your Goal: {profile.nutrition_goals?.replace('_', ' ')}</h4>
                    <p className="text-sm text-muted-foreground">
                      Based on your {profile.nutrition_goals} goal, focus on increasing your vegetable intake and maintaining your excellent protein levels.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Nutrition;