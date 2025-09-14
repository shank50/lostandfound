import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import imageCompression from "browser-image-compression";
import { InsertPost, insertPostSchema } from "@shared/schema";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Upload, X, Loader2, AlertCircle, Mail, Phone } from "lucide-react";

export default function CreatePostPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InsertPost>({
    resolver: zodResolver(insertPostSchema),
    defaultValues: {
      type: "lost",
      title: "",
      description: "",
      imageUrls: [],
      contactEmail: "",
      contactPhone: "",
      secret: "",
      isResolved: false,
    },
  });

  const postType = form.watch("type");
  const isLost = postType === "lost";

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check if adding these files would exceed the limit of 5
    if (imageFiles.length + files.length > 5) {
      toast({
        title: "Too many images",
        description: "You can upload a maximum of 5 images.",
        variant: "destructive",
      });
      return;
    }

    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file",
          description: `${file.name} is not an image file.`,
          variant: "destructive",
        });
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    try {
      setIsCompressing(true);

      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: "image/webp" as const,
        initialQuality: 0.75,
      };

      const compressedFiles = await Promise.all(
        validFiles.map(file => imageCompression(file, options))
      );

      const newPreviews: string[] = [];
      for (const compressedFile of compressedFiles) {
        const reader = new FileReader();
        const preview = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(compressedFile);
        });
        newPreviews.push(preview);
      }

      setImageFiles(prev => [...prev, ...compressedFiles]);
      setImagePreviews(prev => [...prev, ...newPreviews]);

      toast({
        title: "Images compressed",
        description: `Added ${compressedFiles.length} image(s)`,
      });
    } catch (error) {
      toast({
        title: "Compression failed",
        description: "Failed to compress images. Please try different images.",
        variant: "destructive",
      });
    } finally {
      setIsCompressing(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: InsertPost) => {
    try {
      setIsSubmitting(true);
      
      const formData = new FormData();
      formData.append("type", data.type);
      formData.append("title", data.title);
      if (data.description) {
        formData.append("description", data.description);
      }
      if (data.contactEmail && data.contactEmail.trim()) {
        formData.append("contactEmail", data.contactEmail);
      }
      if (data.contactPhone && data.contactPhone.trim()) {
        formData.append("contactPhone", data.contactPhone);
      }
      if (data.secret && data.secret.trim()) {
        formData.append("secret", data.secret);
      }
      if (imageFiles.length > 0) {
        imageFiles.forEach(file => {
          formData.append("images", file);
        });
      }

      const response = await fetch("/api/posts", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create post");
      }

      const post = await response.json();
      
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Success!",
        description: "Your post has been created.",
      });
      setLocation("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPending = isSubmitting || isCompressing;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 md:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create a Post</CardTitle>
            <CardDescription>
              Report a lost or found item
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="grid grid-cols-2 gap-4"
                        >
                          <FormItem>
                            <FormControl>
                              <div className="relative">
                                <RadioGroupItem
                                  value="lost"
                                  id="lost"
                                  className="peer sr-only"
                                  data-testid="radio-lost"
                                />
                                <label
                                  htmlFor="lost"
                                  className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-card p-4 hover-elevate cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 h-24"
                                >
                                  <span className="text-base font-semibold">Lost</span>
                                  <span className="text-xs text-muted-foreground mt-1">I lost something</span>
                                </label>
                              </div>
                            </FormControl>
                          </FormItem>
                          <FormItem>
                            <FormControl>
                              <div className="relative">
                                <RadioGroupItem
                                  value="found"
                                  id="found"
                                  className="peer sr-only"
                                  data-testid="radio-found"
                                />
                                <label
                                  htmlFor="found"
                                  className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-card p-4 hover-elevate cursor-pointer peer-data-[state=checked]:border-chart-2 peer-data-[state=checked]:bg-chart-2/5 h-24"
                                >
                                  <span className="text-base font-semibold">Found</span>
                                  <span className="text-xs text-muted-foreground mt-1">I found something</span>
                                </label>
                              </div>
                            </FormControl>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Blue backpack with laptop"
                          {...field}
                          data-testid="input-title"
                          className="text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add more details about the item, where it was lost/found, etc."
                          className="resize-none min-h-24 text-sm"
                          {...field}
                          value={field.value || ""}
                          data-testid="input-description"
                        />
                      </FormControl>
                      <FormDescription>
                        {field.value?.length || 0}/500 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel>Images (Optional - Up to 5)</FormLabel>
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <div className="rounded-md overflow-hidden border">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-32 object-cover"
                              data-testid={`img-preview-${index}`}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemoveImage(index)}
                            disabled={isPending}
                            data-testid={`button-remove-image-${index}`}
                            aria-label={`Remove image ${index + 1}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  {imagePreviews.length < 5 && (
                    <div className="grid grid-cols-2 gap-3">
                      {/* Camera Capture Button */}
                      <label
                        htmlFor="camera-upload"
                        className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-muted rounded-md hover-elevate cursor-pointer bg-muted/20 transition-colors"
                      >
                        <div className="flex flex-col items-center">
                          <svg className="h-8 w-8 text-muted-foreground mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-xs text-muted-foreground font-medium">Take Photo</span>
                        </div>
                        <input
                          id="camera-upload"
                          type="file"
                          accept="image/*"
                          capture="environment"
                          multiple
                          className="hidden"
                          onChange={handleImageChange}
                          disabled={isPending}
                          data-testid="input-camera"
                        />
                      </label>

                      {/* Gallery Upload Button */}
                      <label
                        htmlFor="gallery-upload"
                        className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-muted rounded-md hover-elevate cursor-pointer bg-muted/20 transition-colors"
                      >
                        <div className="flex flex-col items-center">
                          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                          <span className="text-xs text-muted-foreground font-medium">Choose from Gallery</span>
                        </div>
                        <input
                          id="gallery-upload"
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleImageChange}
                          disabled={isPending}
                          data-testid="input-image"
                        />
                      </label>
                    </div>
                  )}
                  {imagePreviews.length < 5 && (
                    <p className="text-xs text-center text-muted-foreground">
                      {imagePreviews.length}/5 images • Up to 10MB per image
                    </p>
                  )}
                  {isCompressing && (
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Compressing images...
                    </p>
                  )}
                </div>

                <div className="space-y-4 p-4 rounded-lg border bg-muted/20">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold text-sm">Contact Information (Optional)</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Add your contact details so others can reach you directly. This information will be <strong>visible to everyone</strong> who views your post. The secret password is only used to mark the item as found/returned.
                  </p>
                  
                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="email"
                              placeholder="your.email@example.com"
                              {...field}
                              value={field.value || ""}
                              className="pl-10 text-sm"
                              data-testid="input-contact-email"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="tel"
                              placeholder="+91 98765 43210"
                              {...field}
                              value={field.value || ""}
                              className="pl-10 text-sm"
                              data-testid="input-contact-phone"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {(
                  // Secret is required for both types now
                  true
                ) && (
                  <FormField
                    control={form.control}
                    name="secret"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Secret Password (Required)</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter a secret password"
                            {...field}
                            value={field.value || ""}
                            data-testid="input-secret"
                            className="text-sm"
                          />
                        </FormControl>
                        <FormDescription className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                          <span className="text-xs">
                            You'll need this password to mark the item as found/returned later. Keep it safe!
                          </span>
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation("/")}
                    disabled={isPending}
                    className="flex-1"
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="flex-1"
                    data-testid="button-submit"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Post"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
