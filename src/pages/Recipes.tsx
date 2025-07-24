import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, DollarSign, Star, Search, Filter, ChefHat, Zap } from 'lucide-react';
import { getUserByEmail, updateUser } from '@/api/users';
import { createOrUpdateProfile } from '@/api/userProfiles';
import { getRecommendedRecipes, getAllRecipes, addRecipe } from '@/api/recipes';
import { useToast } from '@/hooks/use-toast';

const Recipes = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    const demoUser = getUserByEmail('demo@user.com');
    if (demoUser) {
      setCurrentUser(demoUser);
      const userRecipes = getRecommendedRecipes(demoUser.id);
      const allRecipes = getAllRecipes();
      const combinedRecipes = [...userRecipes, ...allRecipes.filter(r => r.user_id !== demoUser.id)];
      setRecipes(combinedRecipes);
      setFilteredRecipes(combinedRecipes);
    }
  }, []);

  useEffect(() => {
    let filtered = recipes;
    
    if (searchTerm) {
      filtered = filtered.filter(recipe => 
        recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.ingredients.some(ing => ing.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (filterType !== 'all') {
      if (filterType === 'recommended') {
        filtered = filtered.filter(recipe => recipe.is_recommended);
      } else if (filterType === 'budget') {
        filtered = filtered.filter(recipe => recipe.estimated_cost < 7);
      } else if (filterType === 'healthy') {
        filtered = filtered.filter(recipe => recipe.nutrition_score > 85);
      }
    }
    
    setFilteredRecipes(filtered);
  }, [searchTerm, filterType, recipes]);

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

  const handleSaveRecipe = (recipe: any) => {
    if (currentUser) {
      const savedRecipe = addRecipe({
        ...recipe,
        user_id: currentUser.id,
        is_recommended: false
      });
      setRecipes(prev => [savedRecipe, ...prev]);
      toast({
        title: "Recipe Saved! 📖",
        description: `${recipe.name} has been added to your recipes.`,
      });
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
          <h1 className="text-3xl font-bold mb-2">Your Recipe Collection 👨‍🍳</h1>
          <p className="text-muted-foreground">Discover healthy recipes tailored to your budget and goals</p>
        </div>

        {/* Search and Filter */}
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

        {/* Recipe Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
            <Card key={recipe.id} className="nutrition-card hover:shadow-lg transition-smooth">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{recipe.name}</CardTitle>
                  {recipe.is_recommended && (
                    <Badge variant="default" className="text-xs">
                      <Star className="w-3 h-3 mr-1" />
                      For You
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <DollarSign className="w-3 h-3 mr-1" />
                        ${recipe.estimated_cost}
                      </span>
                      <span className="flex items-center">
                        <Zap className="w-3 h-3 mr-1" />
                        {recipe.nutrition_score}/100
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm mb-2">Ingredients:</h4>
                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {recipe.ingredients.slice(0, 4).join(', ')}
                      {recipe.ingredients.length > 4 && '...'}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm mb-2">Instructions:</h4>
                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {recipe.instructions}
                    </p>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="cta" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleSaveRecipe(recipe)}
                    >
                      <ChefHat className="w-3 h-3 mr-1" />
                      Save Recipe
                    </Button>
                    <Button variant="outline" size="sm">
                      <Clock className="w-3 h-3 mr-1" />
                      Cook
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRecipes.length === 0 && (
          <Card className="nutrition-card">
            <CardContent className="p-12 text-center">
              <ChefHat className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No recipes found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Recipes;