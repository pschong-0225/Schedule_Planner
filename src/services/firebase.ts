import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  getDocFromServer,
  Firestore,
} from 'firebase/firestore';
import { getAuth, signInAnonymously, Auth, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { PlannerState } from '../types';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(
  app,
  firebaseConfig.firestoreDatabaseId || undefined
);

// Validate connection to Firestore as mandated by integration guidelines
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

let authReadyPromise: Promise<string> | null = null;

export function ensureAuthenticated(): Promise<string> {
  if (authReadyPromise) return authReadyPromise;

  authReadyPromise = new Promise((resolve) => {
    onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        resolve(user.uid);
      } else {
        try {
          const userCredential = await signInAnonymously(auth);
          resolve(userCredential.user.uid);
        } catch (err) {
          console.warn('Anonymous sign-in failed, falling back to guest_planner:', err);
          resolve('guest_planner');
        }
      }
    });
  });

  return authReadyPromise;
}

export async function savePlannerToCloud(state: PlannerState): Promise<boolean> {
  try {
    const userId = await ensureAuthenticated();
    const plannerId = userId === 'guest_planner' ? 'guest_planner' : userId;
    const docRef = doc(db, 'planners', plannerId);

    await setDoc(docRef, {
      userId: userId === 'guest_planner' ? 'guest' : userId,
      stateJson: JSON.stringify(state),
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.error('Failed to save planner to Firestore:', err);
    return false;
  }
}

export async function loadPlannerFromCloud(): Promise<PlannerState | null> {
  try {
    const userId = await ensureAuthenticated();
    const plannerId = userId === 'guest_planner' ? 'guest_planner' : userId;
    const docRef = doc(db, 'planners', plannerId);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data();
      if (data?.stateJson) {
        const parsed = JSON.parse(data.stateJson);
        return parsed as PlannerState;
      }
    }
    return null;
  } catch (err) {
    console.warn('Could not load planner from Firestore:', err);
    return null;
  }
}
