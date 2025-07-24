import { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Camera, Upload, Search, ShoppingCart, Scan, Receipt, DollarSign, AlertTriangle } from 'lucide-react';
import { getUserByEmail, updateUser } from '@/api/users';
import { createOrUpdateProfile } from '@/api/userProfiles';
import { useToast } from '@/hooks/use-toast';

interface ScannedItem {
  name: string;
  price: number;
  quantity: number;
  category: string;
  nutrition_score: number;
  alternatives?: Array<{ name: string; price: number; savings: number }>;
}

const Shopping = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [receiptText, setReceiptText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStore, setSelectedStore] = useState('Trader Joe\'s');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  // Mock product database
  const productDatabase = [
    {
      name: "Quinoa", 
      price: 4.49, 
      category: "Grains", 
      nutrition_score: 95,
      alternatives: [
        { name: "Brown Rice", price: 2.99, savings: 1.50 },
        { name: "Bulgur", price: 3.49, savings: 1.00 }
      ]
    },
    {
      name: "Avocados", 
      price: 1.99, 
      category: "Healthy Fats", 
      nutrition_score: 86,
      alternatives: [
        { name: "Olive Oil", price: 0.50, savings: 1.49 },
        { name: "Nuts", price: 1.25, savings: 0.74 }
      ]
    },
    {
      name: "Sweet Potatoes", 
      price: 1.49, 
      category: "Vegetables", 
      nutrition_score: 92,
      alternatives: [
        { name: "Regular Potatoes", price: 0.99, savings: 0.50 },
        { name: "Carrots", price: 1.19, savings: 0.30 }
      ]
    },
    {
      name: "Black Beans", 
      price: 1.29, 
      category: "Proteins", 
      nutrition_score: 88,
      alternatives: [
        { name: "Chickpeas", price: 1.19, savings: 0.10 },
        { name: "Lentils", price: 1.09, savings: 0.20 }
      ]
    }
  ];

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

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsScanning(true);
      toast({
        title: "Camera Started 📸",
        description: "Point your camera at a product to scan it",
      });
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const simulateProductScan = () => {
    // Simulate scanning a random product
    const randomProduct = productDatabase[Math.floor(Math.random() * productDatabase.length)];
    const scannedItem: ScannedItem = {
      ...randomProduct,
      quantity: 1
    };
    
    setScannedItems(prev => [...prev, scannedItem]);
    toast({
      title: "Product Scanned! 🎯",
      description: `Found ${randomProduct.name} - ${randomProduct.alternatives?.length || 0} alternatives available`,
    });
    stopCamera();
  };

  const processReceiptText = () => {
    // Simple receipt processing simulation
    const lines = receiptText.split('\n').filter(line => line.trim());
    const newItems: ScannedItem[] = [];
    
    lines.forEach(line => {
      const product = productDatabase.find(p => 
        line.toLowerCase().includes(p.name.toLowerCase())
      );
      if (product) {
        // Extract price from line (simple regex)
        const priceMatch = line.match(/\$?(\d+\.?\d*)/);
        const price = priceMatch ? parseFloat(priceMatch[1]) : product.price;
        
        newItems.push({
          ...product,
          price,
          quantity: 1
        });
      }
    });

    if (newItems.length > 0) {
      setScannedItems(prev => [...prev, ...newItems]);
      toast({
        title: "Receipt Processed! 📝",
        description: `Found ${newItems.length} items with alternatives`,
      });
    } else {
      toast({
        title: "No Items Found",
        description: "Try typing item names like 'quinoa' or 'avocado'",
        variant: "destructive"
      });
    }
    
    setReceiptText('');
    setShowReceiptModal(false);
  };

  const searchProducts = () => {
    if (!searchQuery.trim()) return;
    
    const foundProduct = productDatabase.find(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (foundProduct) {
      const newItem: ScannedItem = {
        ...foundProduct,
        quantity: 1
      };
      setScannedItems(prev => [...prev, newItem]);
      toast({
        title: "Product Found! 🔍",
        description: `Added ${foundProduct.name} to your shopping list`,
      });
      setSearchQuery('');
    } else {
      toast({
        title: "Product Not Found",
        description: "Try searching for quinoa, avocados, sweet potatoes, or black beans",
        variant: "destructive"
      });
    }
  };

  const getTotalSavings = () => {
    return scannedItems.reduce((total, item) => {
      const bestAlternative = item.alternatives?.[0];
      return total + (bestAlternative ? bestAlternative.savings * item.quantity : 0);
    }, 0);
  };

  const getTotalCost = () => {
    return scannedItems.reduce((total, item) => total + (item.price * item.quantity), 0);
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
          <h1 className="text-3xl font-bold mb-2">Smart Shopping 🛒</h1>
          <p className="text-muted-foreground">Scan products and find better alternatives</p>
        </div>

        {/* Store Selection */}
        <Card className="nutrition-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Label>Shopping at:</Label>
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {selectedStore}
                </Badge>
              </div>
              <Button variant="outline" size="sm">
                Change Store
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="scan" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="scan">Scan Products</TabsTrigger>
            <TabsTrigger value="receipt">Upload Receipt</TabsTrigger>
            <TabsTrigger value="list">Shopping List</TabsTrigger>
          </TabsList>

          <TabsContent value="scan" className="space-y-6">
            {/* Scanning Interface */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="nutrition-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Camera className="w-5 h-5 mr-2" />
                    Product Scanner
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isScanning ? (
                      <div className="relative">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          className="w-full h-64 bg-black rounded-lg"
                        />
                        <div className="absolute inset-0 border-2 border-primary rounded-lg flex items-center justify-center">
                          <div className="w-32 h-32 border-2 border-white rounded-lg"></div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-muted-foreground">Camera not active</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      {!isScanning ? (
                        <Button onClick={startCamera} className="flex-1" variant="cta">
                          <Camera className="w-4 h-4 mr-2" />
                          Start Camera
                        </Button>
                      ) : (
                        <>
                          <Button onClick={simulateProductScan} className="flex-1" variant="cta">
                            <Scan className="w-4 h-4 mr-2" />
                            Scan Product
                          </Button>
                          <Button onClick={stopCamera} variant="outline">
                            Stop
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Search Products */}
              <Card className="nutrition-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Search className="w-5 h-5 mr-2" />
                    Search Products
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Product Name</Label>
                      <Input
                        placeholder="Search for quinoa, avocados, etc..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && searchProducts()}
                      />
                    </div>
                    <Button onClick={searchProducts} className="w-full" variant="cta">
                      <Search className="w-4 h-4 mr-2" />
                      Find Product
                    </Button>
                    
                    <div className="pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground mb-2">Available in our database:</p>
                      <div className="flex flex-wrap gap-1">
                        {productDatabase.map(product => (
                          <Badge 
                            key={product.name} 
                            variant="outline" 
                            className="cursor-pointer hover:bg-primary hover:text-white"
                            onClick={() => {
                              setSearchQuery(product.name);
                              searchProducts();
                            }}
                          >
                            {product.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="receipt" className="space-y-6">
            <Card className="nutrition-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Receipt className="w-5 h-5 mr-2" />
                  Receipt Processing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Button 
                      onClick={() => setShowReceiptModal(true)}
                      className="w-full h-32" 
                      variant="outline"
                    >
                      <div className="text-center">
                        <Upload className="w-8 h-8 mx-auto mb-2" />
                        <p>Upload Receipt Photo</p>
                        <p className="text-xs text-muted-foreground">or enter text manually</p>
                      </div>
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label>Recent Receipts</Label>
                      <div className="space-y-2 mt-2">
                        <div className="p-3 border border-border rounded-lg">
                          <div className="flex justify-between">
                            <span className="text-sm">Trader Joe's - Jan 15</span>
                            <span className="text-sm text-muted-foreground">$23.45</span>
                          </div>
                        </div>
                        <div className="p-3 border border-border rounded-lg">
                          <div className="flex justify-between">
                            <span className="text-sm">Whole Foods - Jan 12</span>
                            <span className="text-sm text-muted-foreground">$41.22</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="list" className="space-y-6">
            {scannedItems.length > 0 ? (
              <>
                {/* Summary */}
                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="nutrition-card">
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-muted-foreground">Total Cost</p>
                      <p className="text-2xl font-bold">${getTotalCost().toFixed(2)}</p>
                    </CardContent>
                  </Card>
                  <Card className="nutrition-card">
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-muted-foreground">Potential Savings</p>
                      <p className="text-2xl font-bold text-green-600">${getTotalSavings().toFixed(2)}</p>
                    </CardContent>
                  </Card>
                  <Card className="nutrition-card">
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-muted-foreground">Items</p>
                      <p className="text-2xl font-bold">{scannedItems.length}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Items List */}
                <div className="space-y-4">
                  {scannedItems.map((item, index) => (
                    <Card key={index} className="nutrition-card">
                      <CardContent className="p-4">
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">{item.category}</p>
                            <div className="flex items-center mt-1">
                              <Badge variant="secondary">
                                Score: {item.nutrition_score}/100
                              </Badge>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm text-muted-foreground">Current Choice</p>
                            <p className="font-bold">${item.price} × {item.quantity}</p>
                            <p className="text-sm">= ${(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                          
                          <div>
                            {item.alternatives && item.alternatives.length > 0 ? (
                              <div>
                                <p className="text-sm text-muted-foreground">Best Alternative</p>
                                <p className="font-medium">{item.alternatives[0].name}</p>
                                <p className="text-sm text-green-600">
                                  Save ${item.alternatives[0].savings.toFixed(2)}
                                </p>
                                <Button size="sm" variant="outline" className="mt-1">
                                  Switch
                                </Button>
                              </div>
                            ) : (
                              <div className="text-center">
                                <AlertTriangle className="w-6 h-6 mx-auto mb-1 text-yellow-500" />
                                <p className="text-xs text-muted-foreground">No alternatives</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <Card className="nutrition-card">
                <CardContent className="p-12 text-center">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No items scanned yet</h3>
                  <p className="text-muted-foreground">Use the scanner or search to add products</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Receipt Input Modal */}
      <Dialog open={showReceiptModal} onOpenChange={setShowReceiptModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Receipt Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Receipt Text</Label>
              <textarea
                className="w-full h-32 p-3 border border-border rounded-lg"
                placeholder="Paste receipt text or type item names like:&#10;Quinoa $4.49&#10;Avocados $1.99&#10;Sweet Potatoes $1.49"
                value={receiptText}
                onChange={(e) => setReceiptText(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowReceiptModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button variant="cta" onClick={processReceiptText} className="flex-1">
                Process Receipt
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Shopping;