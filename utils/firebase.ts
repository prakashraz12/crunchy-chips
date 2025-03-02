import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { db } from '../firebase.config';

export const firestoreService = {
  create: async (collectionName: string, data: any) => {
    try {
      const { createdAt } = data;

      if (!createdAt) {
        throw new Error("Missing createdAt field");
      }


      const q = query(
        collection(db, collectionName),
        where("createdAt", "==", createdAt)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, data);

        return { id: docRef.id, ...data, updated: true };
      } else {
        const docRef = await addDoc(collection(db, collectionName), data);
        return { id: docRef.id, ...data, created: true };
      }
    } catch (error) {
      console.error("Error in create:", error);
      throw error;
    }
  },

  getAll: async (collectionName: string) => {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error getting documents: ", error);
      throw error;
    }
  },

  // Update a document
  update: async (collectionName: string, docId: string, data: any) => {
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, data);
      return { id: docId, ...data };
    } catch (error) {
      console.error("Error updating document: ", error);
      throw error;
    }
  },

  // Delete a document
  delete: async (collectionName: string, docId: string) => {
    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
      return docId;
    } catch (error) {
      console.error("Error deleting document: ", error);
      throw error;
    }
  },

  deleteByDate: async (collectionNames: string[], date: string) => {
    try {
      if (!date || collectionNames.length === 0) {
        return
      }
      collectionNames?.map(async collectionName => {
        const q = query(collection(db, collectionName), where("createdAt", "==", date));
        const querySnapshot = await getDocs(q);

        querySnapshot.docs.map(async doc => {
          await deleteDoc(doc.ref);
        })
      })
    } catch (error) {
      console.error("Error deleting documents: ", error);
      throw error;
    }
  },
  // Query documents
  query: async (collectionName: string, field: string, operator: any, value: any) => {
    try {
      const q = query(collection(db, collectionName), where(field, operator, value));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error querying documents: ", error);
      throw error;
    }
  }
};