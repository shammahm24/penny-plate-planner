"use client";
import { useState, useEffect } from 'react';
import { Header } from '../../components/Header';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Search, Filter, ChefHat } from 'lucide-react';
import { useToast } from '../../components/ui/use-toast';

const DEMO_EMAIL = "demo@user.com";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function RecipesPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    async function fetchUserAndRecipes() {
      const usersRes = await fetch(`${API_URL}/users`);
      const users = await usersRes.json();
      const demoUser = users.find((u: any) => u.email === DEMO_EMAIL);
      setCurrentUser(demoUser);
      if (demoUser) {
        const recipesRes = await fetch(`${API_URL}/recipes`);
        const allRecipes = await recipesRes.json();
        setRecipes(allRecipes);
        setFilteredRecipes(allRecipes);
      }
    }
    fetchUserAndRecipes();
  }, []);

  useEffect(() => {
    let filtered = recipes;
    if (searchTerm) {
      filtered = filtered.filter((recipe: any) =>
        recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (recipe.ingredients && recipe.ingredients.some((ing: string) => ing.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }
    if (filterType !== 'all') {
      if (filterType === 'recommended') {
        filtered = filtered.filter((recipe: any) => recipe.is_recommended);
      } else if (filterType === 'budget') {
        filtered = filtered.filter((recipe: any) => recipe.estimated_cost < 7);
      } else if (filterType === 'healthy') {
        filtered = filtered.filter((recipe: any) => recipe.nutrition_score > 85);
      }
    }
    setFilteredRecipes(filtered);
  }, [searchTerm, filterType, recipes]);

  if (!currentUser) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header currentUser={currentUser} onProfileUpdate={() => {}} />
      <div className="container mx-auto p-6 space-y-6">
        <div className="gradient-subtle p-6 rounded-lg">
          <h1 className="text-3xl font-bold mb-2">Your Recipe Collection 👨‍🍳</h1>
          <p className="text-muted-foreground">Discover healthy recipes tailored to your budget and goals</p>
        </div>
        <Card className="nutrition-card">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search recipes or ingredients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter recipes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Recipes</SelectItem>
                  <SelectItem value="recommended">Recommended for You</SelectItem>
                  <SelectItem value="budget">Budget Friendly (Under $7)</SelectItem>
                  <SelectItem value="healthy">High Nutrition Score (85+)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        <div className="grid md:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe: any) => (
            <Card key={recipe.id} className="nutrition-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-bold text-lg flex items-center"><ChefHat className="w-5 h-5 mr-2 text-primary" />{recipe.name}</h2>
                  <Badge variant="secondary">{recipe.nutrition_score}/100</Badge>
                </div>
                <div className="text-sm text-muted-foreground mb-2">{recipe.description}</div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {recipe.ingredients && recipe.ingredients.map((ing: string) => (
                    <Badge key={ing} variant="outline">{ing}</Badge>
                  ))}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-700 font-semibold">${recipe.estimated_cost?.toFixed(2) ?? 'N/A'}</span>
                  <Button size="sm" variant="cta">Save</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 