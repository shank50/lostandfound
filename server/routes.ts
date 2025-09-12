import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { imagekit } from "./imagekit";
import { insertPostSchema, markFoundSchema, markReturnedSchema } from "@shared/schema";
import { fromError } from "zod-validation-error";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // GET /api/posts - Get all posts (without secrets, but WITH contact info)
  app.get("/api/posts", async (req, res) => {
    try {
      const posts = await storage.getAllPosts();
      // Remove only secret field - contact info should be public so people can actually reach each other!
      const sanitizedPosts = posts.map(({ secret, ...post }) => post);
      res.json(sanitizedPosts);
    } catch (error: any) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: error.message || "Failed to fetch posts" });
    }
  });

  // POST /api/posts - Create a new post (with optional multiple image upload)
  app.post("/api/posts", upload.array("images", 5), async (req, res) => {
    try {
      // Parse form data
      const postData = {
        type: req.body.type,
        title: req.body.title,
        description: req.body.description || undefined,
        imageUrls: [] as string[],
        contactEmail: req.body.contactEmail || undefined,
        contactPhone: req.body.contactPhone || undefined,
        secret: req.body.secret && req.body.secret.trim() ? req.body.secret : undefined,
        isResolved: false,
      };

      // Upload images to ImageKit if provided
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        try {
          const uploadPromises = req.files.map(file => 
            imagekit.upload({
              file: file.buffer,
              fileName: `${Date.now()}-${file.originalname}`,
              folder: "/lostfound",
              useUniqueFileName: true,
            })
          );

          const uploadResponses = await Promise.all(uploadPromises);
          
          // Store URLs with optimization transformations
          postData.imageUrls = uploadResponses.map(
            response => `${response.url}?tr=w-600,q-80,f-auto`
          );
        } catch (uploadError: any) {
          console.error("Error uploading images:", uploadError);
          return res.status(500).json({ message: "Failed to upload images" });
        }
      }

      // Validate the post data
      const validationResult = insertPostSchema.safeParse(postData);
      
      if (!validationResult.success) {
        const errorMessage = fromError(validationResult.error).toString();
        return res.status(400).json({ message: errorMessage });
      }

      const post = await storage.createPost(validationResult.data);
      // Remove only secret field from response - contact info should be visible
      const { secret, ...sanitizedPost } = post;
      res.status(201).json(sanitizedPost);
    } catch (error: any) {
      console.error("Error creating post:", error);
      res.status(500).json({ message: error.message || "Failed to create post" });
    }
  });

  // POST /api/mark-found - Mark a post as found (requires secret verification)
  app.post("/api/mark-found", async (req, res) => {
    try {
      const validationResult = markFoundSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const errorMessage = fromError(validationResult.error).toString();
        return res.status(400).json({ message: errorMessage });
      }

      const { id, secret } = validationResult.data;
      const post = await storage.markPostFound(id, secret);
      
      // Remove only secret field from response
      const { secret: _, ...sanitizedPost } = post;
      res.json(sanitizedPost);
    } catch (error: any) {
      console.error("Error marking post as found:", error);
      res.status(400).json({ message: error.message || "Failed to mark post as found" });
    }
  });

  // POST /api/mark-returned - Mark a found post as returned to owner (requires secret verification)
  app.post("/api/mark-returned", async (req, res) => {
    try {
      const validationResult = markReturnedSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const errorMessage = fromError(validationResult.error).toString();
        return res.status(400).json({ message: errorMessage });
      }

      const { id, secret } = validationResult.data;
      const post = await storage.markPostReturned(id, secret);
      
      // Remove only secret field from response
      const { secret: _, ...sanitizedPost } = post;
      res.json(sanitizedPost);
    } catch (error: any) {
      console.error("Error marking post as returned:", error);
      res.status(400).json({ message: error.message || "Failed to mark post as returned" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
