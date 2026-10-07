/**
 * AccessFix - Cloud Firestore Service Boundary
 *
 * INTEGRATION NOTICE:
 * Member 3 - Sravani (Firebase/Firestore Integration):
 * Use this service to persist audit sessions, repair histories, and user reports.
 * Connect your Firestore collection schemas and queries here.
 */

import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { AuditHistoryRecord } from '../types';

export interface IFirestoreService {
  /**
   * Saves a completed audit run to Firestore.
   */
  saveAuditSession(record: Omit<AuditHistoryRecord, 'id'>): Promise<string>;

  /**
   * Retrieves recent audit sessions.
   */
  getRecentAudits(maxCount?: number): Promise<AuditHistoryRecord[]>;
}

// Fallback in-memory / local storage key when Firestore offline or unconfigured
const LOCAL_STORAGE_KEY = 'accessfix_audit_history_v1';

function getLocalHistory(): AuditHistoryRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalHistory(record: AuditHistoryRecord): void {
  try {
    const current = getLocalHistory();
    const updated = [record, ...current].slice(0, 20);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Could not save to localStorage:', err);
  }
}

// Maximum milliseconds to wait for a Firestore write before falling back locally.
// When the Firebase API key is undefined the SDK's gRPC stream connects (HTTP 200)
// but the Promise returned by addDoc never settles because no auth token can be
// issued.  The timeout guarantees the caller's finally block always runs.
const FIRESTORE_WRITE_TIMEOUT_MS = 8_000;

export const firestoreService: IFirestoreService = {
  async saveAuditSession(record: Omit<AuditHistoryRecord, 'id'>): Promise<string> {
    const localId = `hist-${Date.now()}`;
    const fullRecord: AuditHistoryRecord = { ...record, id: localId };

    // Always keep local fallback up to date for smooth demo flow
    saveLocalHistory(fullRecord);

    // Build the Firestore write promise
    const firestoreWrite = addDoc(collection(db, 'auditHistory'), {
      ...record,
      createdAt: new Date().toISOString(),
    });

    // Build a timeout promise that resolves (not rejects) after the limit so
    // Promise.race always settles regardless of the Firestore SDK state.
    const timeout = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), FIRESTORE_WRITE_TIMEOUT_MS)
    );

    try {
      const result = await Promise.race([firestoreWrite, timeout]);

      if (result === null) {
        // Timeout fired before Firestore responded — use the local fallback id
        console.info(
          'Firestore write timed out after',
          FIRESTORE_WRITE_TIMEOUT_MS,
          'ms. Session persisted locally. (Ready for Sravani\'s Firestore branch or valid API key.)'
        );
        return localId;
      }

      // Firestore responded in time
      return result.id;
    } catch (err) {
      // Firestore rejected (e.g. permission-denied) — surface to caller and fall back
      console.info('Firestore sync note: write failed, using local fallback:', err);
      // Re-throw so saveToHistory can surface the error to the UI error banner
      throw err;
    }
  },

  async getRecentAudits(maxCount: number = 5): Promise<AuditHistoryRecord[]> {
    try {
      const q = query(collection(db, 'auditHistory'), orderBy('createdAt', 'desc'), limit(maxCount));
      const querySnapshot = await getDocs(q);
      const results: AuditHistoryRecord[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        results.push({
          id: doc.id,
          timestamp: data.createdAt || data.timestamp || new Date().toISOString(),
          htmlSnippetTitle: data.htmlSnippetTitle,
          originalScore: data.originalScore ?? 0,
          finalScore: data.finalScore ?? 0,
          originalIssueCount: data.originalIssueCount ?? 0,
          repairedIssueCount: data.repairedIssueCount ?? 0,
          remainingIssueCount: data.remainingIssueCount ?? 0,
          status: data.status || 'completed',
        });
      });

      if (results.length > 0) return results;
    } catch (err) {
      console.info('Firestore fetch note: Falling back to local demo history:', err);
    }

    return getLocalHistory().slice(0, maxCount);
  },
};
