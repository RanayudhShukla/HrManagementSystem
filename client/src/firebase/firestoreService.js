import { 
  collection, doc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, onSnapshot, query, where 
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
export async function seedFirestoreWithData(employees = [], projects = [], leaves = [], tasks = []) {
  try {
    const promises = [];
    for (const emp of employees) {
      if (emp?.id) {
        promises.push(setDoc(doc(db, COLLECTIONS.EMPLOYEES, emp.id), emp, { merge: true }));
      }
    }
    for (const proj of projects) {
      if (proj?.id) {
        promises.push(setDoc(doc(db, COLLECTIONS.PROJECTS, proj.id), proj, { merge: true }));
      }
    }
    for (const leave of leaves) {
      if (leave?.id) {
        promises.push(setDoc(doc(db, COLLECTIONS.LEAVES, leave.id), leave, { merge: true }));
      }
    }
    for (const task of tasks) {
      if (task?.id) {
        promises.push(setDoc(doc(db, COLLECTIONS.TASKS, task.id), task, { merge: true }));
      }
    }
    await Promise.all(promises);
    return { success: true, message: 'All documents successfully pushed to Firestore!' };
  } catch (err) {
    console.warn('Firestore seed notice:', err.message);
    return { success: false, error: err.message };
  }
}

// Realtime listener for employees
export function subscribeToFirestoreEmployees(onUpdate) {
  try {
    return onSnapshot(collection(db, COLLECTIONS.EMPLOYEES), (snapshot) => {
      const emps = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      onUpdate(emps);
    }, (err) => {
      console.warn('Firestore employees subscription warning:', err);
    });
  } catch {
    return () => {};
  }
}

// Realtime listener for projects
export function subscribeToFirestoreProjects(onUpdate) {
  try {
    return onSnapshot(collection(db, COLLECTIONS.PROJECTS), (snapshot) => {
      const projs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      onUpdate(projs);
    }, (err) => {
      console.warn('Firestore projects subscription warning:', err);
    });
  } catch {
    return () => {};
  }
}

// Realtime listener for leaves
export function subscribeToFirestoreLeaves(onUpdate) {
  try {
    return onSnapshot(collection(db, COLLECTIONS.LEAVES), (snapshot) => {
      const leaves = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      onUpdate(leaves);
    }, (err) => {
      console.warn('Firestore leaves subscription warning:', err);
    });
  } catch {
    return () => {};
  }
}

// Realtime listener for tasks
export function subscribeToFirestoreTasks(employeeId, onUpdate) {
  try {
    const q = employeeId 
      ? query(collection(db, COLLECTIONS.TASKS), where('employeeId', '==', employeeId))
      : collection(db, COLLECTIONS.TASKS);
    return onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      onUpdate(tasks);
    }, (err) => {
      console.warn('Firestore tasks subscription warning:', err);
    });
  } catch {
    return () => {};
  }
}

// Fetch all employees from Firestore collection
export async function getFirestoreEmployees() {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.EMPLOYEES));
    if (snap.empty) return [];
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn('getFirestoreEmployees warning:', err);
    return null;
  }
}

// Fetch all projects from Firestore
export async function getFirestoreProjects() {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.PROJECTS));
    if (snap.empty) return [];
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn('getFirestoreProjects warning:', err);
    return null;
  }
}

// Fetch all leaves from Firestore
export async function getFirestoreLeaves() {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.LEAVES));
    if (snap.empty) return [];
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn('getFirestoreLeaves warning:', err);
    return null;
  }
}

// Fetch all tasks from Firestore
export async function getFirestoreTasks(employeeId) {
  try {
    const q = employeeId 
      ? query(collection(db, COLLECTIONS.TASKS), where('employeeId', '==', employeeId))
      : collection(db, COLLECTIONS.TASKS);
    const snap = await getDocs(q);
    if (snap.empty) return [];
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn('getFirestoreTasks warning:', err);
    return null;
  }
}

// Sync single employee to Firestore
export async function syncEmployeeToFirestore(employee) {
  if (!employee?.id) return;
  try {
    await setDoc(doc(db, COLLECTIONS.EMPLOYEES, employee.id), employee, { merge: true });
  } catch (err) {
    console.warn('syncEmployeeToFirestore warning:', err);
  }
}

// Delete single employee from Firestore
export async function deleteEmployeeFromFirestore(employeeId) {
  if (!employeeId) return;
  try {
    await deleteDoc(doc(db, COLLECTIONS.EMPLOYEES, employeeId));
  } catch (err) {
    console.warn('deleteEmployeeFromFirestore warning:', err);
  }
}

// Sync single leave to Firestore
export async function syncLeaveToFirestore(leave) {
  if (!leave?.id) return;
  try {
    await setDoc(doc(db, COLLECTIONS.LEAVES, leave.id), leave, { merge: true });
  } catch (err) {
    console.warn('syncLeaveToFirestore warning:', err);
  }
}

// Delete single leave from Firestore
export async function deleteLeaveFromFirestore(leaveId) {
  if (!leaveId) return;
  try {
    await deleteDoc(doc(db, COLLECTIONS.LEAVES, leaveId));
  } catch (err) {
    console.warn('deleteLeaveFromFirestore warning:', err);
  }
}

// Sync single project to Firestore
export async function syncProjectToFirestore(project) {
  if (!project?.id) return;
  try {
    await setDoc(doc(db, COLLECTIONS.PROJECTS, project.id), project, { merge: true });
  } catch (err) {
    console.warn('syncProjectToFirestore warning:', err);
  }
}

// Delete single project from Firestore
export async function deleteProjectFromFirestore(projectId) {
  if (!projectId) return;
  try {
    await deleteDoc(doc(db, COLLECTIONS.PROJECTS, projectId));
  } catch (err) {
    console.warn('deleteProjectFromFirestore warning:', err);
  }
}

// Sync single task to Firestore
export async function syncTaskToFirestore(task) {
  if (!task?.id) return;
  try {
    await setDoc(doc(db, COLLECTIONS.TASKS, task.id), task, { merge: true });
  } catch (err) {
    console.warn('syncTaskToFirestore warning:', err);
  }
}

// Delete single task from Firestore
export async function deleteTaskFromFirestore(taskId) {
  if (!taskId) return;
  try {
    await deleteDoc(doc(db, COLLECTIONS.TASKS, taskId));
  } catch (err) {
    console.warn('deleteTaskFromFirestore warning:', err);
  }
}
