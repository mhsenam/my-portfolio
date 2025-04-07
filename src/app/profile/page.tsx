"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "../../lib/firebaseConfig"; // Use relative path
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner"; // Import toast from sonner
import { Toaster } from "@/components/ui/sonner"; // Import Toaster from sonner component

export default function ProfilePage() {
  const [user, loading, authError] = useAuthState(auth);
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Fetch user profile data from Firestore on load
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      const fetchProfile = async () => {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          setUsername(data.username || "");
          setAvatarPreview(data.photoURL || user.photoURL || null);
        } else {
          // Initialize profile if it doesn't exist
          await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || "",
            username: "",
            photoURL: user.photoURL || null,
            createdAt: new Date(),
          });
          setAvatarPreview(user.photoURL || null);
        }
      };
      fetchProfile();
    }
  }, [user]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setAvatarFile(file);
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsUpdatingProfile(true);

    let newPhotoURL = user.photoURL; // Keep existing photoURL initially

    try {
      // 1. Upload Avatar if changed
      if (avatarFile) {
        setIsUploading(true);
        const avatarRef = ref(
          storage,
          `avatars/${user.uid}/${avatarFile.name}`
        );
        const snapshot = await uploadBytes(avatarRef, avatarFile);
        newPhotoURL = await getDownloadURL(snapshot.ref);
        setIsUploading(false);
      }

      // 2. Update Firebase Auth Profile
      await updateProfile(user, {
        displayName: displayName,
        photoURL: newPhotoURL, // Use the potentially new URL
      });

      // 3. Update Firestore User Document (including username)
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        displayName: displayName,
        username: username,
        photoURL: newPhotoURL,
      });

      // Update local preview state if upload happened
      if (avatarFile) {
        setAvatarPreview(newPhotoURL);
        setAvatarFile(null); // Clear the file input state after successful upload
      }

      toast.success("Profile Updated Successfully!");
    } catch (error: unknown) {
      console.error("Profile update error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
      toast.error("Update Failed", { description: errorMessage });
      setIsUploading(false);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;
    if (newPassword !== confirmPassword) {
      toast.error("Error", { description: "New passwords do not match." });
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Error", {
        description: "Password must be at least 6 characters.",
      });
      return;
    }

    setIsUpdatingPassword(true);

    try {
      // Re-authenticate user first - THIS IS REQUIRED for password change
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Now update the password
      await updatePassword(user, newPassword);

      toast.success("Password Updated Successfully!");
      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: unknown) {
      console.error("Password update error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Re-authentication failed or password update failed.";
      // Provide more specific feedback if possible based on error codes
      toast.error("Password Update Failed", { description: errorMessage });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Loading and error states
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }
  if (authError) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Error: {authError.message}
      </div>
    );
  }
  if (!user) {
    // This case is handled by the useEffect redirect, but good practice to have
    return null;
  }

  return (
    <div className="container mx-auto px-4 pt-24 pb-12 min-h-screen">
      <Toaster /> {/* Add Toaster component */}
      <h1 className="text-3xl font-bold mb-8 text-center">
        Manage Your Profile
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Profile Update Card */}
        <Card>
          <CardHeader>
            <CardTitle>Update Profile</CardTitle>
            <CardDescription>
              Update your display name, username, and avatar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar
                  className="h-24 w-24 cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <AvatarImage
                    src={avatarPreview || undefined}
                    alt={displayName || username || "User avatar"}
                  />
                  <AvatarFallback>
                    {displayName?.charAt(0) || username?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <Input
                  id="avatarFile"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? "Uploading..." : "Change Avatar"}
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Unique identifier for mentions, etc.
                </p>
              </div>

              <Button
                type="submit"
                disabled={isUpdatingProfile || isUploading}
                className="w-full"
              >
                {isUpdatingProfile ? "Updating..." : "Save Profile Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password Change Card */}
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Enter your current password and a new password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={isUpdatingPassword}
                className="w-full"
              >
                {isUpdatingPassword ? "Changing..." : "Change Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
