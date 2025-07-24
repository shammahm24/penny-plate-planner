import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Target, ShoppingCart, ChefHat, Zap } from 'lucide-react';
import { getProfileByUserId } from '@/api/userProfiles';
import { getRecommendedRecipes } from '@/api/recipes';
import { getTopFoodsByUserId } from '@/api/nutritionProfiles';

interface DashboardProps {
  currentUser: any;
  onOpenProfile: () => void;
}

export function Dashboard({ currentUser, onOpenProfile }: DashboardProps) {
  const profile = getProfileByUserId(currentUser?.id);
  const recommendedRecipes = getRecommendedRecipes(currentUser?.id).slice(0, 3);
  const topFoods = getTopFoodsByUserId(currentUser?.id, 4);

  // Mock budget calculation
  const spentThisMonth = topFoods.reduce((sum, food) => sum + (food.monthly_spend || 0), 0);
  const budgetProgress = profile ? (spentThisMonth / profile.food_budget) * 100 : 0;

  if (!profile) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center space-y-6">
          <div className="nutrition-card max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">Welcome to Bread & Butter! 🍞</h2>
            <p className="text-muted-foreground mb-6">
              Let's set up your profile to get personalized nutrition and budget recommendations.
            </p>
            <Button variant="cta" onClick={onOpenProfile} className="w-full">
              Complete Your Profile
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Welcome Section */}
      <div className="gradient-subtle p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {currentUser?.username}! 👋</h1>
        <p className="text-muted-foreground">Here's your nutrition and budget overview</p>
      </div>

      {/* Budget Overview */}
      <Card className="nutrition-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-primary" />
            Budget Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                ${spentThisMonth.toFixed(2)} of ${profile.food_budget} spent this month
              </span>
              <Badge variant={budgetProgress > 80 ? "destructive" : "secondary"}>
                {budgetProgress.toFixed(0)}%
              </Badge>
            </div>
            <Progress value={budgetProgress} className="h-2" />
            <div className="budget-overview p-3">
              <p className="text-sm text-accent-foreground">
                💡 You're {budgetProgress > 50 ? 'on track' : 'doing great'} with your {profile.budget_frequency} budget!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Nutrition Highlights */}
        <Card className="nutrition-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2 text-primary" />
              Top Nutrition Choices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topFoods.map((food, index) => (
                <div key={food.food_name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{food.food_name}</p>
                      <p className="text-xs text-muted-foreground">{food.category}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {food.nutrition_score}/100
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommended Recipes */}
        <Card className="nutrition-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ChefHat className="w-5 h-5 mr-2 text-primary" />
              Recipes for You
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendedRecipes.map((recipe) => (
                <div key={recipe.id} className="border border-border rounded-lg p-3 hover:bg-accent/20 transition-smooth">
                  <h4 className="font-medium text-sm mb-1">{recipe.name}</h4>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Est. ${recipe.estimated_cost}</span>
                    <span className="flex items-center">
                      <Zap className="w-3 h-3 mr-1" />
                      {recipe.nutrition_score}/100
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="nutrition-card">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-16 flex-col">
              <ShoppingCart className="w-5 h-5 mb-2" />
              Add Receipt
            </Button>
            <Button variant="outline" className="h-16 flex-col">
              <ChefHat className="w-5 h-5 mb-2" />
              Find Recipe
            </Button>
            <Button variant="outline" className="h-16 flex-col">
              <TrendingUp className="w-5 h-5 mb-2" />
              Price Trends
            </Button>
            <Button variant="outline" className="h-16 flex-col" onClick={onOpenProfile}>
              <Target className="w-5 h-5 mb-2" />
              Edit Goals
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Personalized Tips */}
      <Card className="nutrition-card">
        <CardHeader>
          <CardTitle>💡 Personalized Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="bg-accent/20 p-3 rounded-lg">
              <p className="text-sm">
                <strong>Budget Tip:</strong> Switch from Whole Foods quinoa to Trader Joe's to save $2.50 per purchase
              </p>
            </div>
            <div className="bg-accent/20 p-3 rounded-lg">
              <p className="text-sm">
                <strong>Nutrition Tip:</strong> Add more leafy greens to boost your iron intake for your {profile.nutrition_goals.replace('_', ' ')} goal
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}