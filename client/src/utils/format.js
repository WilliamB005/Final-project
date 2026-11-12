// Populated refs come back as objects ({ _id, username }), unpopulated ones as plain id strings
export const refId = (ref) => (ref && typeof ref === 'object' ? ref._id : ref);

export const isMine = (ref, user) => Boolean(user) && String(refId(ref)) === String(user.id);

export function formatDate(value) {
  return new Date(value).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatTime(value) {
  const date = new Date(value);
  const sameDay = date.toDateString() === new Date().toDateString();
  return sameDay
    ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
