"use client";

import { useState, useRef } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebaseConfig"; // Adjust path if needed
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogOverlay,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import Image from "next/image";

interface CreatePostDialogProps {
  // Add any props needed, e.g., a function to refetch posts after creation
  onPostCreated?: () => void;
}

export function CreatePostDialog({ onPostCreated }: CreatePostDialogProps) {
  const [user] = useAuthState(auth);
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      // Basic validation (optional)
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file.");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setLink("");
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset file input
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to create a post.");
      return;
    }
    if (!title.trim() && !description.trim()) {
      toast.error("Please provide at least a title or description.");
      return;
    }

    setIsSubmitting(true);
    let imageUrl: string | null = null; // Ensure imageUrl is typed as string | null

    try {
      // 1. Upload Image via API route if selected
      if (imageFile) {
        console.log("Uploading post image via API route...");
        const formData = new FormData();
        formData.append("file", imageFile);

        const response = await fetch("/api/upload-post-image", {
          method: "POST",
          body: formData,
          // Optional: Add auth header if API route requires it
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `API Error: ${response.statusText}`
          );
        }

        const result = await response.json();
        imageUrl = result.secureUrl;

        if (!imageUrl) {
          throw new Error("Post image API did not return a secure URL.");
        }
        console.log("Cloudinary URL for post image:", imageUrl);
      }

      // 2. Add Post to Firestore
      console.log("Adding post document to Firestore...");
      const postsCollectionRef = collection(db, "posts");
      await addDoc(postsCollectionRef, {
        title: title.trim(),
        description: description.trim(),
        link: link.trim() || null,
        imageUrl: imageUrl, // Use Cloudinary URL or null
        authorId: user.uid,
        authorName: user.displayName || user.email || "Anonymous",
        authorAvatar: user.photoURL || null,
        createdAt: serverTimestamp(),
        likes: 0,
      });
      console.log("Post document added.");

      toast.success("Post created successfully!");
      resetForm();
      setIsOpen(false);
      onPostCreated?.();
    } catch (error: unknown) {
      console.error("Error creating post:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
      toast.error("Failed to create post", { description: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="
            px-6 py-3 text-base font-semibold text-white rounded-lg shadow-lg 
            bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 
            hover:scale-105 hover:shadow-xl hover:brightness-110 
            active:scale-100 active:brightness-100 
            transition-all duration-300 ease-in-out
            animate-pulse-slow
          "
        >
          ✨ Create New Post ✨
        </Button>
      </DialogTrigger>
      <DialogOverlay className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm" />
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px] bg-card z-[70]">
        <DialogHeader>
          <DialogTitle>Create New Fan Hub Post</DialogTitle>
          <DialogDescription>
            Share your thoughts, links, or images with the community.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title (optional)"
              disabled={isSubmitting}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's on your mind?"
              rows={4}
              disabled={isSubmitting}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="link">Link (Optional)</Label>
            <Input
              id="link"
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://example.com"
              disabled={isSubmitting}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="image">Image (Optional)</Label>
            <Input
              id="image"
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              disabled={isSubmitting}
            />
            {imagePreview && (
              <div className="mt-2 relative w-full h-48">
                <Image
                  src={imagePreview}
                  alt="Image preview"
                  layout="fill"
                  objectFit="contain"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 h-6 w-6 p-0"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  disabled={isSubmitting}
                >
                  X
                </Button>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Create Post"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
