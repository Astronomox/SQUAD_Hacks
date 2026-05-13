// useAuditLog - filterable, searchable, exportable log state.

import { useMemo, useState } from 'react';
import { AUDIT_LOG } from '../data/auditLog.js';

export function useAuditLog() {
  const [query,   setQuery]   = useState('');
  const [actor,   setActor]   = useState('all');
  const [outcome, setOutcome] = useState('all');
  const [from,    setFrom]    = useState('');
  const [to,      setTo]      = useState('');

  const list = useMemo(() => {
    return AUDIT_LOG.filter((e) => {
      if (actor !== 'all' && e.actorType !== actor) return false;
      if (outcome !== 'all' && e.outcome !== outcome) return false;
      if (from && new Date(e.timestamp) < new Date(from)) return false;
      if (to   && new Date(e.timestamp) > new Date(to))   return false;
      if (query) {
        const blob = `${e.actor} ${e.action} ${e.entity || ''} ${e.employeeId || ''} ${e.detail || ''} ${e.txRef || ''}`.toLowerCase();
        if (!blob.includes(query.toLowerCase())) return false;
      }
      return true;
    });
  }, [query, actor, outcome, from, to]);

  function clear() {
    setQuery(''); setActor('all'); setOutcome('all'); setFrom(''); setTo('');
  }

  return {
    query, setQuery,
    actor, setActor,
    outcome, setOutcome,
    from, setFrom,
    to,   setTo,
    list,
    total: AUDIT_LOG.length,
    clear,
  };
}
