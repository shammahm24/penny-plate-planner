"use client";
import { useState, useEffect, useRef } from 'react';
import { Header } from '../../components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Camera, Scan, Upload as UploadIcon } from 'lucide-react';
import { UploadButton } from '@/lib/uploadthing';
import Image from 'next/image';
import Cropper from 'react-easy-crop';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';

const DEMO_EMAIL = "demo@user.com";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function ShoppingPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedItems, setScannedItems] = useState<any[]>([]);
  const [selectedStore, setSelectedStore] = useState("Trader Joe's");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>("");
  const [showCameraInput, setShowCameraInput] = useState(false);
  const [showFileInput, setShowFileInput] = useState(false);
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string>("");
  const [capturedImage, setCapturedImage] = useState<string>("");
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [croppedImage, setCroppedImage] = useState<string>("");
  const videoRefCamera = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- Add mock product database and state for search, receipt text, modal, and recent receipts ---
  const productDatabase = [
    {
      name: "Quinoa",
      price: 4.49,
      category: "Grains",
      nutrition_score: 95,
      alternatives: [
        { name: "Brown Rice", price: 2.99, savings: 1.50 },
        { name: "Bulgur", price: 3.49, savings: 1.00 },
      ],
    },
    {
      name: "Avocados",
      price: 1.99,
      category: "Healthy Fats",
      nutrition_score: 86,
      alternatives: [
        { name: "Olive Oil", price: 0.50, savings: 1.49 },
        { name: "Nuts", price: 1.25, savings: 0.74 },
      ],
    },
    {
      name: "Sweet Potatoes",
      price: 1.49,
      category: "Vegetables",
      nutrition_score: 92,
      alternatives: [
        { name: "Regular Potatoes", price: 0.99, savings: 0.50 },
        { name: "Carrots", price: 1.19, savings: 0.30 },
      ],
    },
    {
      name: "Black Beans",
      price: 1.29,
      category: "Proteins",
      nutrition_score: 88,
      alternatives: [
        { name: "Chickpeas", price: 1.19, savings: 0.10 },
        { name: "Lentils", price: 1.09, savings: 0.20 },
      ],
    },
  ];
  const [searchQuery, setSearchQuery] = useState("");
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptText, setReceiptText] = useState("");
  const [recentReceipts] = useState([
    { store: "Trader Joe's", date: "Jan 15", total: 23.45 },
    { store: "Whole Foods", date: "Jan 12", total: 41.22 },
  ]);

  useEffect(() => {
    async function fetchUser() {
      const usersRes = await fetch(`${API_URL}/users`);
      const users = await usersRes.json();
      const demoUser = users.find((u: any) => u.email === DEMO_EMAIL);
      setCurrentUser(demoUser);
    }
    fetchUser();
  }, []);

  // Camera simulation functions omitted for brevity
  // Camera functionality
  const startCamera = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        streamRef.current = stream;
        setIsScanning(true);
      } catch (err) {
        alert('Unable to access camera. Please check permissions.');
      }
    } else {
      alert('Camera not supported on this device/browser.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  // --- Add scan simulation, product search, receipt processing, and shopping list logic ---
  const simulateProductScan = () => {
    const randomProduct = productDatabase[Math.floor(Math.random() * productDatabase.length)];
    const scannedItem = { ...randomProduct, quantity: 1 };
    setScannedItems((prev) => [...prev, scannedItem]);
    stopCamera();
  };
  const searchProducts = () => {
    if (!searchQuery.trim()) return;
    const foundProduct = productDatabase.find((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (foundProduct) {
      const newItem = { ...foundProduct, quantity: 1 };
      setScannedItems((prev) => [...prev, newItem]);
      setSearchQuery("");
    }
  };
  const processReceiptText = () => {
    const lines = receiptText.split("\n").filter((line) => line.trim());
    const newItems: any[] = [];
    lines.forEach((line) => {
      const product = productDatabase.find((p) =>
        line.toLowerCase().includes(p.name.toLowerCase())
      );
      if (product) {
        const priceMatch = line.match(/\$?(\d+\.?\d*)/);
        const price = priceMatch ? parseFloat(priceMatch[1]) : product.price;
        newItems.push({ ...product, price, quantity: 1 });
      }
    });
    if (newItems.length > 0) {
      setScannedItems((prev) => [...prev, ...newItems]);
    }
    setReceiptText("");
    setShowReceiptModal(false);
  };
  const getTotalSavings = () => {
    return scannedItems.reduce((total, item) => {
      const bestAlternative = item.alternatives?.[0];
      return total + (bestAlternative ? bestAlternative.savings * item.quantity : 0);
    }, 0);
  };
  const getTotalCost = () => {
    return scannedItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setFilePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleDirectUpload = async () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append("file", selectedFile);
    // Replace with your UploadThing endpoint if needed
    const res = await fetch("/api/uploadthing", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (data?.url) setReceiptUrl(data.url);
  };

  const handleCameraButton = () => {
    openCameraModal();
  };
  const handleFileButton = () => {
    setShowFileInput(true);
    setShowCameraInput(false);
    document.getElementById('receipt-file-input')?.click();
  };

  const openCameraModal = async () => {
    setCameraModalOpen(true);
    setCapturedImage("");
    setCroppedImage("");
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setCameraStream(stream);
      setTimeout(() => {
        if (videoRefCamera.current) {
          videoRefCamera.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      setCameraError('Unable to access camera. Please check permissions.');
    }
  };
  const closeCameraModal = () => {
    setCameraModalOpen(false);
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setCapturedImage("");
    setCroppedImage("");
  };
  const capturePhoto = () => {
    if (videoRefCamera.current && canvasRef.current) {
      const video = videoRefCamera.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
      }
    }
  };
  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };
  const getCroppedImg = async (imageSrc: string, crop: any) => {
    const image = new window.Image();
    image.src = imageSrc;
    await new Promise((resolve) => { image.onload = resolve; });
    const canvas = document.createElement('canvas');
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(
      image,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      crop.width,
      crop.height
    );
    return canvas.toDataURL('image/jpeg');
  };
  const confirmCrop = async () => {
    if (capturedImage && croppedAreaPixels) {
      const cropped = await getCroppedImg(capturedImage, croppedAreaPixels);
      if (cropped) {
        setCroppedImage(cropped);
        setFilePreview(cropped);
        setSelectedFile(dataURLtoFile(cropped, 'receipt.jpg'));
        setCameraModalOpen(false);
        closeCameraModal();
      }
    }
  };
  function dataURLtoFile(dataurl: string, filename: string) {
    const arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1], bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    for (let i = 0; i < n; i++) u8arr[i] = bstr.charCodeAt(i);
    return new File([u8arr], filename, { type: mime });
  }

  if (!currentUser) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header currentUser={currentUser} onProfileUpdate={() => {}} />
      <div className="container mx-auto p-6 space-y-6">
        <div className="gradient-subtle p-6 rounded-lg">
          <h1 className="text-3xl font-bold mb-2">Smart Shopping 🛒</h1>
          <p className="text-muted-foreground">Scan products and find better alternatives</p>
        </div>
        <Card className="nutrition-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Label>Shopping at:</Label>
                <Badge variant="outline" className="text-lg px-3 py-1">{selectedStore}</Badge>
              </div>
              <Button variant="outline" size="sm">Change Store</Button>
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
                        <video ref={videoRef} autoPlay playsInline className="w-full h-64 bg-black rounded-lg" />
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
                        <Button className="flex-1" variant="cta" onClick={startCamera}>Start Camera</Button>
                      ) : (
                        <>
                          <Button className="flex-1" variant="cta" onClick={simulateProductScan}>Scan Product</Button>
                          <Button variant="outline" onClick={stopCamera}>Stop</Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* Product Search */}
              <Card className="nutrition-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Scan className="w-5 h-5 mr-2" />
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
                      <Scan className="w-4 h-4 mr-2" />
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
                  <UploadIcon className="w-5 h-5 mr-2" />
                  Receipt Processing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="block font-semibold mb-2">Take Photo or Upload Image</label>
                    <div className="flex items-center gap-2 mb-2">
                      <Button type="button" variant="cta" onClick={openCameraModal}>
                        Take Photo
                      </Button>
                      <Button type="button" variant="cta" onClick={handleFileButton}>
                        Upload Image
                      </Button>
                    </div>
                    {/* Hidden camera input */}
                    <input
                      id="receipt-camera-input"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    {/* Hidden file input */}
                    <input
                      id="receipt-file-input"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    {selectedFile && (
                      <span className="text-sm text-muted-foreground">{selectedFile.name}</span>
                    )}
                    {filePreview && (
                      <div className="mb-2">
                        <img src={filePreview} alt="Receipt preview" className="w-full max-h-64 object-contain border rounded" />
                        <Button onClick={handleDirectUpload} className="mt-2 w-full" variant="cta" disabled={!selectedFile}>Upload Selected Image</Button>
                      </div>
                    )}
                    {/* Existing UploadButton for fallback/alternative */}
                    <UploadButton
                      endpoint="imageUploader"
                      onClientUploadComplete={(res) => {
                        if (res && res[0]?.url) setReceiptUrl(res[0].url);
                      }}
                      onUploadError={(error) => {
                        alert(`ERROR! ${error.message}`);
                      }}
                    />
                    {receiptUrl ? (
                      <div className="space-y-2">
                        <div className="font-medium">Receipt Preview:</div>
                        <Image src={receiptUrl} alt="Receipt" width={400} height={300} className="rounded border" />
                        <div className="text-muted-foreground text-sm">Image uploaded!</div>
                      </div>
                    ) : null}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label>Recent Receipts</Label>
                      <div className="space-y-2 mt-2">
                        {recentReceipts.map((r, i) => (
                          <div key={i} className="p-3 border border-border rounded-lg">
                            <div className="flex justify-between">
                              <span className="text-sm">{r.store} - {r.date}</span>
                              <span className="text-sm text-muted-foreground">${r.total.toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Manual Receipt Entry Modal */}
            {showReceiptModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                  <h2 className="text-lg font-bold mb-4">Enter Receipt Details</h2>
                  <textarea
                    className="w-full h-32 p-3 border border-border rounded-lg mb-4"
                    placeholder={`Paste receipt text or type item names like:\nQuinoa $4.49\nAvocados $1.99`}
                    value={receiptText}
                    onChange={(e) => setReceiptText(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowReceiptModal(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button variant="cta" onClick={processReceiptText} className="flex-1">
                      Process Receipt
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
          <TabsContent value="list" className="space-y-6">
            {scannedItems.length > 0 ? (
              <>
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
                <div className="space-y-4">
                  {scannedItems.map((item, index) => (
                    <Card key={index} className="nutrition-card">
                      <CardContent className="p-4">
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">{item.category}</p>
                            <div className="flex items-center mt-1">
                              <Badge variant="secondary">Score: {item.nutrition_score}/100</Badge>
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
                                <p className="text-sm text-green-600">Save ${item.alternatives[0].savings.toFixed(2)}</p>
                                <Button size="sm" variant="outline" className="mt-1">Switch</Button>
                              </div>
                            ) : (
                              <div className="text-center">
                                <span className="text-xs text-muted-foreground">No alternatives</span>
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
                  <span className="text-lg font-medium mb-2">No items scanned yet</span>
                  <p className="text-muted-foreground">Use the scanner or search to add products</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <Dialog open={cameraModalOpen} onOpenChange={open => { if (!open) closeCameraModal(); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Take Photo of Receipt</DialogTitle>
          </DialogHeader>
          {!capturedImage ? (
            <div className="flex flex-col items-center">
              {cameraError && <div className="text-red-500 mb-2">{cameraError}</div>}
              <video ref={videoRefCamera} autoPlay playsInline className="w-full max-w-md rounded border mb-4" />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              <Button variant="cta" onClick={capturePhoto} className="mt-2">Capture</Button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="relative w-full h-72 bg-black">
                <Cropper
                  image={capturedImage}
                  crop={{ x: 0, y: 0 }}
                  zoom={1}
                  aspect={4 / 3}
                  onCropChange={() => {}}
                  onCropComplete={onCropComplete}
                  onZoomChange={() => {}}
                />
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="cta" onClick={confirmCrop}>Confirm Crop</Button>
                <Button variant="outline" onClick={() => setCapturedImage("")}>Retake</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ReceiptUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<{ item: string; price: string | null }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);
    setItems([]);
    const formData = new FormData();
    formData.append("receipt", file);
    try {
      const res = await fetch("http://localhost:4000/api/receipts/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setItems(data.items || []);
      } else {
        setError(data.error || "Failed to process receipt");
      }
    } catch (err: any) {
      setError("Network error");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleUpload} className="mt-8 p-4 border rounded-lg bg-white max-w-md mx-auto">
      <label className="block mb-2 font-semibold">Upload or Take a Photo of Your Receipt</label>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="mb-2"
      />
      {preview && (
        <img src={preview} alt="Receipt preview" className="mb-2 w-full max-h-64 object-contain border rounded" />
      )}
      <button
        type="submit"
        disabled={loading || !file}
        className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-green-600 text-white rounded-lg font-semibold text-lg shadow hover:bg-green-700 transition mb-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <UploadIcon className="w-5 h-5" />
        {loading ? "Processing..." : "Upload Receipt"}
      </button>
      {loading && <div className="w-full h-2 bg-gray-200 rounded"><div className="h-2 bg-green-500 rounded animate-pulse w-3/4"></div></div>}
      {error && <div className="text-red-500 mt-2">{error}</div>}
      {items.length > 0 && (
        <ul className="mt-4 space-y-1">
          {items.map((item, i) => (
            <li key={i} className="flex justify-between border-b pb-1">
              <span>{item.item}</span>
              {item.price && <span className="font-mono">${item.price}</span>}
            </li>
          ))}
        </ul>
      )}
    </form>
  );
} 