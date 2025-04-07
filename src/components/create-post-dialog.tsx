"use client";

import { useState, useRef } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "@/lib/firebaseConfig"; // Adjust path if needed
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
    let imageUrl = null;

    try {
      // 1. Upload Image if selected
      if (imageFile) {
        const imageRef = ref(
          storage,
          `posts/${user.uid}/${Date.now()}_${imageFile.name}`
        );
        const snapshot = await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      // 2. Add Post to Firestore
      const postsCollectionRef = collection(db, "posts");
      await addDoc(postsCollectionRef, {
        title: title.trim(),
        description: description.trim(),
        link: link.trim() || null,
        imageUrl: imageUrl, // Will be null if no image was uploaded
        authorId: user.uid,
        authorName: user.displayName || user.email || "Anonymous", // Use available user info
        authorAvatar: user.photoURL || null,
        createdAt: serverTimestamp(), // Use server timestamp
        // Add other fields like likes, comments count later
        likes: 0,
      });

      toast.success("Post created successfully!");
      resetForm();
      setIsOpen(false); // Close dialog on success
      onPostCreated?.(); // Callback to trigger refetch or update
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
        <Button>Create New Post</Button>
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
