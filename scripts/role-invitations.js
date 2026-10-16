(() => {
  const statuses = new Set(['pending', 'accepted', 'declined', 'expired', 'generating', 'generation_failed', 'created']);
  const transitions = {
    pending: new Set(['accepted', 'declined', 'expired']),
    accepted: new Set(['generating']),
    generation_failed: new Set(['generating']),
    generating: new Set(['generation_failed', 'created']),
    created: new Set(), declined: new Set(), expired: new Set()
  };
  const isoWithZone = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/;
  const boundedText = (value, max) => typeof value === 'string' ? value.trim().slice(0, max) : '';
  const validInstant = value => {
    if (typeof value !== 'string' || !isoWithZone.test(value)) return '';
    const stamp = Date.parse(value);
    return Number.isFinite(stamp) ? new Date(stamp).toISOString() : '';
  };
  const timeNeedsResolution = (timeText, startsAt) => Boolean(timeText && !startsAt && /明天|后天|大后天|今天|今晚|明早|明晚|今早|周[一二三四五六日天]|星期[一二三四五六日天]|下周|本周|这周|周末|下个月|下月|\d{1,2}月\s*\d{1,2}日|\d{1,2}号/.test(timeText));
  const isUnknown = value => !value || /^(?:待定|未定|待确认|尚未确定|未确定|不确定|unknown|tbd)$/i.test(value.trim());
  const normalizeProposal = value => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    const intent = boundedText(value.intent, 240);
    const updateId = boundedText(value.updateId, 100), cancelled = value.cancelled === true;
    if (!intent && !(cancelled && updateId)) return null;
    const timeText = boundedText(value.timeText, 120), startsAt = validInstant(value.startsAt);
    return {
      intent,
      timeText,
      placeText: boundedText(value.placeText, 160),
      startsAt,
      timePending: isUnknown(timeText) || timeNeedsResolution(timeText, startsAt),
      updateId,
      cancelled
    };
  };
  const isExpired = (invite, now = Date.now()) => Boolean(invite?.startsAt && Date.parse(invite.startsAt) < now);
  const isReady = invite => Boolean(!isUnknown(invite?.timeText || '') && !isUnknown(invite?.placeText || '') && !invite?.timePending && !timeNeedsResolution(invite?.timeText || '', invite?.startsAt || ''));
  const transition = (invite, next) => {
    if (!invite || !statuses.has(next) || !transitions[invite.status]?.has(next)) return false;
    invite.status = next;
    invite.updatedAt = Date.now();
    return true;
  };
  const createId = () => globalThis.crypto?.randomUUID?.() || `invite-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const api = { statuses, normalizeProposal, validInstant, timeNeedsResolution, isExpired, isReady, transition, createId };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') window.IrisInvitations = api;
})();
