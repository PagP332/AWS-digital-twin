export function formatDateTime(value) {
  if (!value) return "Not Available";

  try {
    if (value.toDate) {
      // Firestore Timestamp
      return value.toDate().toLocaleString();
    } else if (value instanceof Date) {
      // Native JS Date
      return value.toLocaleString();
    } else {
      // Unexpected type (string, number, etc.)
      const parsed = new Date(value);
      return isNaN(parsed.getTime()) ? "Invalid Date" : parsed.toLocaleString();
    }
  } catch (error) {
    return "Invalid Date";
  }
}
