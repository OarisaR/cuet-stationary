import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
  UserCredential,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

export type UserRole = "student" | "vendor";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: Date;
  phone?: string;
  studentId?: string;
  deliveryAddress?: string;
}

// Pre-defined vendor email addresses (hardcoded - only these can login as vendors)
const VENDOR_EMAILS = [
  "vendor@cuet.com",
];

/**
 * Check if email is a vendor account
 */
export const isVendorEmail = (email: string): boolean => {
  return VENDOR_EMAILS.includes(email.toLowerCase());
};

/**
 * Sign up a new STUDENT account (vendors cannot sign up)
 */
export const signUpWithEmail = async (
  email: string,
  password: string,
  displayName?: string
): Promise<User> => {
  try {
    // Check if email is a vendor email
    if (isVendorEmail(email)) {
      throw new Error("Vendor accounts cannot be created through signup. Please contact admin.");
    }

    console.log("Attempting to create student account with email:", email);
    const userCredential: UserCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    console.log("Student account created successfully:", userCredential.user.uid);

    // Update display name if provided
    if (displayName && userCredential.user) {
      await updateProfile(userCredential.user, {
        displayName,
      });
      console.log("Display name updated to:", displayName);
    }

    // Try to create user profile in Firestore (optional - won't fail if Firestore is not enabled)
    try {
      const userProfile: UserProfile = {
        uid: userCredential.user.uid,
        email: userCredential.user.email || email,
        displayName: displayName || "",
        role: "student",
        createdAt: new Date(),
      };

      await setDoc(doc(db, "users", userCredential.user.uid), userProfile);
      console.log("Student profile created in Firestore");
    } catch (firestoreError) {
      console.warn("Could not create Firestore profile (Firestore may not be enabled):", firestoreError);
      // Continue anyway - account was created successfully
    }

    return userCredential.user;
  } catch (error: any) {
    console.error("Firebase signup error:", error);
    throw error;
  }
};

/**
 * Sign in existing user with email and password
 * Returns both user and their role
 */
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<{ user: User; role: UserRole }> => {
  try {
    const userCredential: UserCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Check if email is a vendor email first (takes priority)
    let role: UserRole = isVendorEmail(email) ? "vendor" : "student";
    
    // Try to get user role from Firestore (but vendor emails always get vendor role)
    try {
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserProfile;
        // Only use Firestore role if email is not a vendor email
        if (!isVendorEmail(email)) {
          role = userData.role;
        } else {
          // If vendor email but wrong role in Firestore, update it
          if (userData.role !== "vendor") {
            try {
              await setDoc(doc(db, "users", userCredential.user.uid), {
                ...userData,
                role: "vendor"
              });
              console.log("Updated Firestore role to vendor");
            } catch (err) {
              console.warn("Could not update vendor role in Firestore:", err);
            }
          }
        }
      } else {
        // If user document doesn't exist and it's a vendor email, create vendor profile
        if (isVendorEmail(email)) {
          try {
            const vendorProfile: UserProfile = {
              uid: userCredential.user.uid,
              email: userCredential.user.email || email,
              displayName: userCredential.user.displayName || "Vendor",
              role: "vendor",
              createdAt: new Date(),
            };
            await setDoc(doc(db, "users", userCredential.user.uid), vendorProfile);
            console.log("Created vendor profile in Firestore");
          } catch (err) {
            console.warn("Could not create vendor profile in Firestore:", err);
          }
        }
      }
    } catch (firestoreError) {
      console.warn("Firestore not available, using email-based role detection:", firestoreError);
      // Already set role based on email above
    }

    return { user: userCredential.user, role };
  } catch (error: any) {
    console.error("Sign in error:", error);
    throw error;
  }
};

/**
 * Get user role from Firestore
 */
export const getUserRole = async (uid: string): Promise<UserRole | null> => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      const userData = userDoc.data() as UserProfile;
      return userData.role;
    }
    return null;
  } catch (error) {
    console.warn("Could not get user role from Firestore:", error);
    return null;
  }
};

/**
 * Sign out current user
 */
export const logOut = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message || "Failed to sign out");
  }
};

/**
 * Get current user
 */
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

/**
 * Get friendly error message from Firebase error code
 */
export const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case "auth/email-already-in-use":
      return "This email is already registered. Please sign in instead.";
    case "auth/invalid-email":
      return "Invalid email address format.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/user-not-found":
      return "No account found with this email.";
    case "auth/wrong-password":
      return "Incorrect password. Please try again.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again later.";
    case "auth/network-request-failed":
      return "Network error. Please check your connection.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/operation-not-allowed":
      return "Email/password authentication is not enabled. Please enable it in Firebase Console.";
    case "auth/invalid-api-key":
      return "Invalid Firebase API key. Please check your configuration.";
    case "auth/app-deleted":
      return "Firebase app has been deleted. Please check your configuration.";
    default:
      return errorCode ? `Authentication error: ${errorCode}` : "An error occurred. Please try again.";
  }
};
