import { 
  collection, doc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, onSnapshot 
} from 'firebase/firestore';
import { db } from './config';

export const COLLECTIONS = {
  EMPLOYEES: 'employees',
  PROJECTS: 'projects',
  LEAVES: 'leaves',
  ANALYTICS: 'analytics'
};

// Seed initial workforce collections to user's real Firestore database
export async function seedFirestoreWithData(employees, projects, leaves) {
  try {
    for (const emp of employees) {
      await setDoc(doc(db, COLLECTIONS.EMPLOYEES, emp.id), emp, { merge: true });
    }
    for (const proj of projects) {
      await setDoc(doc(db, COLLECTIONS.PROJECTS, proj.id), proj, { merge: true });
    }
    for (const leave of leaves) {
      await setDoc(doc(db, COLLECTIONS.LEAVES, leave.id), leave, { merge: true });
    }
    return { success: true, message: 'All documents successfully pushed to Firestore!' };
  } catch (err) {
    console.error('Firestore push error:', err);
    throw err;
  }
}

// Fetch all employees from Firestore collection
export async function getFirestoreEmployees() {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.EMPLOYEES));
    if (snap.empty) return null;
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn('Firestore fetch fallback:', err.message);
    return null;
  }
}

// Sync single employee to Firestore
export async function syncEmployeeToFirestore(employee) {
  try {
    await setDoc(doc(db, COLLECTIONS.EMPLOYEES, employee.id), employee, { merge: true });
  } catch (err) {
    console.warn('Failed to sync employee to Firestore:', err);
  }
}

// Sync single leave to Firestore
export async function syncLeaveToFirestore(leave) {
  try {
    await setDoc(doc(db, COLLECTIONS.LEAVES, leave.id), leave, { merge: true });
  } catch (err) {
    console.warn('Failed to sync leave to Firestore:', err);
  }
}

// Sync single project to Firestore
export async function syncProjectToFirestore(project) {
  try {
    await setDoc(doc(db, COLLECTIONS.PROJECTS, project.id), project, { merge: true });
  } catch (err) {
    console.warn('Failed to sync project to Firestore:', err);
  }
}
