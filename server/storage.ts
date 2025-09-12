// Referenced from javascript_database blueprint integration
import { posts, type Post, type InsertPost } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getAllPosts(): Promise<Post[]>;
  getPost(id: number): Promise<Post | undefined>;
  createPost(insertPost: InsertPost): Promise<Post>;
  markPostFound(id: number, secret: string): Promise<Post>;
  markPostReturned(id: number, secret: string): Promise<Post>;
}

export class DatabaseStorage implements IStorage {
  async getAllPosts(): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .orderBy(desc(posts.createdAt));
  }

  async getPost(id: number): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post || undefined;
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const [post] = await db
      .insert(posts)
      .values(insertPost)
      .returning();
    return post;
  }

  async markPostFound(id: number, secret: string): Promise<Post> {
    const post = await this.getPost(id);
    
    if (!post) {
      throw new Error("Post not found");
    }

    if (post.type !== "lost") {
      throw new Error("Only lost items can be marked as found");
    }

    if (post.isResolved) {
      throw new Error("This item is already marked as found");
    }

    if (!post.secret) {
      throw new Error("This post has no secret set");
    }

    if (post.secret !== secret) {
      throw new Error("Incorrect secret password");
    }

    const [updatedPost] = await db
      .update(posts)
      .set({ isResolved: true })
      .where(eq(posts.id, id))
      .returning();

    return updatedPost;
  }

  async markPostReturned(id: number, secret: string): Promise<Post> {
    const post = await this.getPost(id);

    if (!post) {
      throw new Error("Post not found");
    }

    if (post.type !== "found") {
      throw new Error("Only found items can be marked as returned");
    }

    if (post.isResolved) {
      throw new Error("This item is already marked as returned");
    }

    if (!post.secret) {
      throw new Error("This post has no secret set");
    }

    if (post.secret !== secret) {
      throw new Error("Incorrect secret password");
    }

    const [updatedPost] = await db
      .update(posts)
      .set({ isResolved: true })
      .where(eq(posts.id, id))
      .returning();

    return updatedPost;
  }
}

export const storage = new DatabaseStorage();
