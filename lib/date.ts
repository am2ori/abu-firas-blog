import { Timestamp } from 'firebase/firestore';

/**
 * Converts a Firestore Timestamp (or null/undefined) to a format suitable for datetime-local input
 * Format: YYYY-MM-DDTHH:mm
 */
export function timestampToInputString(timestamp: Timestamp | null | undefined): string {
    if (!timestamp) return '';

    const date = timestamp.toDate();
    // Get local ISO string parts
    const pad = (n: number) => n.toString().padStart(2, '0');

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * Converts a datetime-local input string back to a Firestore Timestamp
 */
export function inputStringToTimestamp(value: string): Timestamp | null {
    if (!value) return null;
    const date = new Date(value);
    return Timestamp.fromDate(date);
}

/**
 * Gets current date as datetime-local string
 */
export function nowToInputString(): string {
    return timestampToInputString(Timestamp.now());
}
