import { auth, db } from '../firebaseConfig';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';

import { User, Event, Note } from '../types';

// --- Authentication ---
// FIX: Wrap Firebase auth functions to automatically pass the 'auth' instance,
// resolving errors where functions were called with missing arguments.
export const onAuthStateChanged = (callback: (user: FirebaseUser | null) => void) => {
  return firebaseOnAuthStateChanged(auth, callback);
};

export const signOut = () => {
  return firebaseSignOut(auth);
};

export const signIn = async (email: string, pass: string) => {
  return await signInWithEmailAndPassword(auth, email, pass);
};

// --- User Data CRUD ---
const usersCollection = collection(db, 'users');
const getUserDocRef = (id: string) => doc(db, 'users', id);

export const getUserById = async (id: string): Promise<User | null> => {
  const docSnap = await getDoc(getUserDocRef(id));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as User;
  }
  return null;
};

export const getUsers = async (): Promise<User[]> => {
  const snapshot = await getDocs(usersCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
};

export const createUser = async (userData: Omit<User, 'id' | 'avatarUrl'> & { email: string; password?: string }) => {
  if (!userData.password) throw new Error("La contraseña es requerida para crear un usuario.");
  
  // 1. Create user in Firebase Auth
  const { user: authUser } = await createUserWithEmailAndPassword(auth, userData.email, userData.password);

  // 2. Create user document in Firestore
  const newUser: Omit<User, 'id'> = {
    name: userData.name,
    role: userData.role,
  };
  await setDoc(getUserDocRef(authUser.uid), newUser);

  return { id: authUser.uid, ...newUser } as User;
};

export const updateUser = async (id: string, updates: Partial<User>) => {
  await updateDoc(getUserDocRef(id), updates);
};

export const deleteUser = async (id: string) => {
  // Note: Deleting a user from Firestore does not delete them from Firebase Auth.
  // A cloud function is recommended for this in a real production environment.
  await deleteDoc(getUserDocRef(id));
};

// --- Event Data CRUD & Real-time ---
const eventsCollection = collection(db, 'events');
const getEventDocRef = (id: string) => doc(db, 'events', id);

export const onEventsSnapshot = (callback: (events: Event[]) => void) => {
  const q = query(eventsCollection, orderBy('updatedAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const events = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Event));
    callback(events);
  });
};

export const createEvent = async (eventData: Omit<Event, 'id' | 'updatedAt'>) => {
  return await addDoc(eventsCollection, {
    ...eventData,
    updatedAt: serverTimestamp(),
  });
};

export const updateEvent = async (id: string, updates: Partial<Omit<Event, 'id' | 'updatedAt'>>) => {
  await updateDoc(getEventDocRef(id), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const deleteEvent = async (id: string) => {
  await deleteDoc(getEventDocRef(id));
};


// --- Notes Data ---
const notesCollection = collection(db, 'notes');
const getNoteDocRef = (date: string) => doc(db, 'notes', date);

export const onAllNotesSnapshot = (callback: (notes: Record<string, Note>) => void) => {
  return onSnapshot(notesCollection, (snapshot) => {
    const notes: Record<string, Note> = {};
    snapshot.forEach(doc => {
      notes[doc.id] = doc.data() as Note;
    });
    callback(notes);
  });
};

export const onNoteSnapshot = (date: string, callback: (note: Note | null) => void) => {
  return onSnapshot(getNoteDocRef(date), (doc) => {
    callback(doc.exists() ? doc.data() as Note : null);
  });
};

export const updateNote = async (date: string, content: string) => {
    const noteData: Note = {
        content,
        updatedAt: new Date().toISOString()
    };
    await setDoc(getNoteDocRef(date), noteData, { merge: true });
};