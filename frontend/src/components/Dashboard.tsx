import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { DollarSign, TrendingUp, Target, ShoppingCart, ChefHat, Zap, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "./ui/carousel";

interface DashboardProps {
  currentUser: any;
  onOpenProfile: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export function Dashboard({ currentUser, onOpenProfile }: DashboardProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [recommendedRecipes, setRecommendedRecipes] = useState<any[]>([]);
  const [topFoods, setTopFoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch user profile
        const profileRes = await fetch(`${API_URL}/user-profiles/${currentUser.id}`);
        setProfile(profileRes.ok ? await profileRes.json() : null);
        // Fetch recommended recipes
        const recipesRes = await fetch(`${API_URL}/recipes`);
        const allRecipes = recipesRes.ok ? await recipesRes.json() : [];
        setRecommendedRecipes(allRecipes.filter((r: any) => r.user_id === currentUser.id).slice(0, 3));
        // Fetch top foods (nutrition profile)
        const foodsRes = await fetch(`${API_URL}/nutrition-profiles/${currentUser.id}`);
        setTopFoods(foodsRes.ok ? await foodsRes.json() : []);
      } catch (err) {
        setProfile(null);
        setRecommendedRecipes([]);
        setTopFoods([]);
      } finally {
        setLoading(false);
      }
    }
    if (currentUser?.id) fetchData();
  }, [currentUser]);

  // Mock budget calculation
  const spentThisMonth = topFoods.reduce((sum, food) => sum + (food.monthly_spend || 0), 0);
  const budgetProgress = profile ? (spentThisMonth / profile.food_budget) * 100 : 0;

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

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

      {/* Affiliate Carousel */}
      <div className="relative max-w-2xl mx-auto">
        <Carousel className="w-full">
          <CarouselContent>
            <CarouselItem>
              <div className="flex items-center gap-4 bg-white rounded-lg shadow p-4 border border-border">
                <img src="/affiliate1.svg" alt="Healthy Grocer" className="w-16 h-16 rounded" />
                <div>
                  <div className="font-bold text-lg">Healthy Grocer</div>
                  <div className="text-muted-foreground text-sm">Get 10% off your first order of organic produce!</div>
                  <a href="https://healthy-grocer.example.com" target="_blank" rel="noopener" className="text-primary hover:underline font-medium">Shop Now</a>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="flex items-center gap-4 bg-white rounded-lg shadow p-4 border border-border">
                <img src="/affiliate2.svg" alt="Meal Prep Pro" className="w-16 h-16 rounded" />
                <div>
                  <div className="font-bold text-lg">Meal Prep Pro</div>
                  <div className="text-muted-foreground text-sm">Exclusive: 2 weeks free meal planning for Bread & Butter users.</div>
                  <a href="https://mealpreppro.example.com" target="_blank" rel="noopener" className="text-primary hover:underline font-medium">Try Free</a>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="flex items-center gap-4 bg-white rounded-lg shadow p-4 border border-border">
                <img src="/affiliate3.svg" alt="Smart Kitchen" className="w-16 h-16 rounded" />
                <div>
                  <div className="font-bold text-lg">Smart Kitchen</div>
                  <div className="text-muted-foreground text-sm">Upgrade your kitchen with 15% off smart gadgets.</div>
                  <a href="https://smartkitchen.example.com" target="_blank" rel="noopener" className="text-primary hover:underline font-medium">Shop Gadgets</a>
                </div>
              </div>
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious className="-left-4 top-1/2" />
          <CarouselNext className="-right-4 top-1/2" />
        </Carousel>
      </div>

      {/* Budget Overview */}
      <Card className="nutrition-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center">
            <CardTitle className="flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-primary" />
              Budget Overview
            </CardTitle>
          </div>
          <Button size="icon" variant="ghost" className="text-muted-foreground" aria-label="Edit Budget" onClick={onOpenProfile}>
            <Pencil className="w-4 h-4" />
          </Button>
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
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center">
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2 text-primary" />
                Top Nutrition Choices
              </CardTitle>
            </div>
            <Button size="icon" variant="ghost" className="text-muted-foreground" aria-label="Edit Nutrition" onClick={onOpenProfile}>
              <Pencil className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topFoods.map((food: any, index: number) => (
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
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center">
              <CardTitle className="flex items-center">
                <ChefHat className="w-5 h-5 mr-2 text-primary" />
                Recipes for You
              </CardTitle>
            </div>
            <Button size="icon" variant="ghost" className="text-muted-foreground" aria-label="Edit Recipes" onClick={onOpenProfile}>
              <Pencil className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendedRecipes.map((recipe: any) => (
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
            <Button 
              variant="outline" 
              className="h-16 flex-col"
              onClick={() => router.push("/shopping")}
            >
              <ShoppingCart className="w-5 h-5 mb-2" />
              Add Receipt
            </Button>
            <Button 
              variant="outline" 
              className="h-16 flex-col"
              onClick={() => router.push("/recipes")}
            >
              <ChefHat className="w-5 h-5 mb-2" />
              Find Recipe
            </Button>
            <Button 
              variant="outline" 
              className="h-16 flex-col"
              onClick={() => router.push("/price-tracker")}
            >
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