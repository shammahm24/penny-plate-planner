import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { getProfileByUserId } from '@/api/userProfiles';

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser: any;
  onSave: (data: any) => void;
}

export function ProfileModal({ open, onOpenChange, currentUser, onSave }: ProfileModalProps) {
  const [formData, setFormData] = useState({
    food_budget: '',
    budget_frequency: 'monthly',
    dietary_preferences: [] as string[],
    nutrition_goals: '',
    current_weight: '',
    activity_level: 'moderate',
    height_cm: '',
    preferred_stores: [] as string[]
  });

  useEffect(() => {
    if (currentUser && open) {
      const profile = getProfileByUserId(currentUser.id);
      if (profile) {
        setFormData({
          food_budget: profile.food_budget?.toString() || '',
          budget_frequency: profile.budget_frequency || 'monthly',
          dietary_preferences: profile.dietary_preferences || [],
          nutrition_goals: profile.nutrition_goals || '',
          current_weight: profile.current_weight?.toString() || '',
          activity_level: profile.activity_level || 'moderate',
          height_cm: profile.height_cm?.toString() || '',
          preferred_stores: profile.preferred_stores || []
        });
      }
    }
  }, [currentUser, open]);

  const handleDietaryPreferenceChange = (preference: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      dietary_preferences: checked
        ? [...prev.dietary_preferences, preference]
        : prev.dietary_preferences.filter(p => p !== preference)
    }));
  };

  const handleStorePreferenceChange = (store: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      preferred_stores: checked
        ? [...prev.preferred_stores, store]
        : prev.preferred_stores.filter(s => s !== store)
    }));
  };

  const handleSave = () => {
    onSave({
      ...formData,
      food_budget: parseFloat(formData.food_budget) || 0,
      current_weight: parseFloat(formData.current_weight) || 0,
      height_cm: parseFloat(formData.height_cm) || 0
    });
    onOpenChange(false);
  };

  const dietaryOptions = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'low-sodium', 'organic', 'keto', 'paleo'];
  const storeOptions = ['Whole Foods', 'Trader Joe\'s', 'Walmart', 'Target', 'Kroger', 'Safeway'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Profile Setup</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="budget">Food Budget</Label>
              <Input
                id="budget"
                type="number"
                placeholder="400"
                value={formData.food_budget}
                onChange={(e) => setFormData(prev => ({ ...prev, food_budget: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="frequency">Frequency</Label>
              <Select
                value={formData.budget_frequency}
                onValueChange={(value) => setFormData(prev => ({ ...prev, budget_frequency: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Dietary Preferences</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {dietaryOptions.map(option => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={option}
                    checked={formData.dietary_preferences.includes(option)}
                    onCheckedChange={(checked) => 
                      handleDietaryPreferenceChange(option, checked as boolean)
                    }
                  />
                  <Label htmlFor={option} className="text-sm capitalize">
                    {option.replace('-', ' ')}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="goals">Nutrition Goals</Label>
            <Select
              value={formData.nutrition_goals}
              onValueChange={(value) => setFormData(prev => ({ ...prev, nutrition_goals: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your goal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weight_loss">Weight Loss</SelectItem>
                <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="general_health">General Health</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="weight">Weight (lbs)</Label>
              <Input
                id="weight"
                type="number"
                placeholder="165"
                value={formData.current_weight}
                onChange={(e) => setFormData(prev => ({ ...prev, current_weight: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                placeholder="170"
                value={formData.height_cm}
                onChange={(e) => setFormData(prev => ({ ...prev, height_cm: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="activity">Activity Level</Label>
            <Select
              value={formData.activity_level}
              onValueChange={(value) => setFormData(prev => ({ ...prev, activity_level: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Preferred Stores</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {storeOptions.map(store => (
                <div key={store} className="flex items-center space-x-2">
                  <Checkbox
                    id={store}
                    checked={formData.preferred_stores.includes(store)}
                    onCheckedChange={(checked) => 
                      handleStorePreferenceChange(store, checked as boolean)
                    }
                  />
                  <Label htmlFor={store} className="text-sm">
                    {store}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
          <Button variant="cta" onClick={handleSave} className="flex-1">
            Save Profile
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}