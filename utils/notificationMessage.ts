const extractMeta = (message: string, key: string) => {
  const match = String(message || '').match(new RegExp(`\\[${key}:([^\\]]+)\\]`));
  return match?.[1]?.trim() || '';
};

const cleanReceiptTags = (message: string) => {
  return String(message || '')
    .replace(/\s*\[DUE_ID:[^\]]+\]/g, '')
    .replace(/\s*\[TXN:[^\]]+\]/g, '')
    .trim();
};

export const formatNotificationMessage = (rawMessage: string) => {
  const message = String(rawMessage || '');

  if (message.includes('[PROFILE_UPDATE_REQUEST]')) {
    const currentName = extractMeta(message, 'CURRENT_NAME') || 'Current Name';
    const requestedName = extractMeta(message, 'REQUESTED_NAME') || 'Requested Name';
    return `Parent requested name change: ${currentName} -> ${requestedName}`;
  }

  if (message.includes('[PROFILE_UPDATE_REVIEW]')) {
    const action = extractMeta(message, 'ACTION').toUpperCase();
    const currentName = extractMeta(message, 'CURRENT_NAME') || 'Current Name';
    const requestedName = extractMeta(message, 'REQUESTED_NAME') || 'Requested Name';
    const actionLabel = action === 'APPROVED' ? 'approved' : action === 'REJECTED' ? 'rejected' : 'reviewed';
    return `Name change ${actionLabel}: ${currentName} -> ${requestedName}`;
  }

  return cleanReceiptTags(message);
};
