import { 
  collection, doc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, onSnapshot 
} from 'firebase/firestore';
import { db } from './config';

export const COLLECTIONS = {
  EMPLOYEES: 'employees',
  PROJECTS: 'projects',
  LEAVES: 'leaves',
  TASKS: 'tasks',
  ANALYTICS: 'analytics'
};

// Seed initial workforce collections to user's real Firestore database
export async function seedFirestoreWithData(employees, projects, leaves, tasks = []) {
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
    for (const task of tasks) {
      await setDoc(doc(db, COLLECTIONS.TASKS, task.id), task, { merge: true });
    }
    return { success: true, message: 'All documents successfully pushed to Firestore!' };
  } catch (err) {
    console.warn('Firestore seed notice (rules may require test mode):', err.message);
    return { success: false, error: err.message };
  }
}

// Fetch all employees from Firestore collection
export async function getFirestoreEmployees() {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.EMPLOYEES));
    if (snap.empty) return null;
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    return null;
  }
}

// Fetch all projects from Firestore
export async function getFirestoreProjects() {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.PROJECTS));
    if (snap.empty) return null;
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    return null;
  }
}

// Fetch all leaves from Firestore
export async function getFirestoreLeaves() {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.LEAVES));
    if (snap.empty) return null;
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    return null;
  }
}

// Fetch all tasks from Firestore
export async function getFirestoreTasks() {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.TASKS));
    if (snap.empty) return null;
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    return null;
  }
}

// Sync single employee to Firestore
export async function syncEmployeeToFirestore(employee) {
  try {
    await setDoc(doc(db, COLLECTIONS.EMPLOYEES, employee.id), employee, { merge: true });
  } catch (err) {
    // silent catch if rules locked
  }
}

// Sync single leave to Firestore
export async function syncLeaveToFirestore(leave) {
  try {
    await setDoc(doc(db, COLLECTIONS.LEAVES, leave.id), leave, { merge: true });
  } catch (err) {
    // silent catch if rules locked
  }
}

// Sync single project to Firestore
export async function syncProjectToFirestore(project) {
  try {
    await setDoc(doc(db, COLLECTIONS.PROJECTS, project.id), project, { merge: true });
  } catch (err) {
    // silent catch if rules locked
  }
}

// Sync single task to Firestore
export async function syncTaskToFirestore(task) {
  try {
    await setDoc(doc(db, COLLECTIONS.TASKS, task.id), task, { merge: true });
  } catch (err) {
    // silent catch if rules locked
  }
}
