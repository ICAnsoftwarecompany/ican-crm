import { useState, useEffect, useCallback } from 'react';
import { echo } from './echo';

/**
 * بيجمع بين:
 * 1) جلب القواعد أول مرة من الـ API (زي الـ hook القديم)
 * 2) الاستماع اللحظي لأي تغيير في القواعد المشتركة (shared) عن طريق WebSocket
 *
 * الـ tenantId لازم يوصلك من الـ Auth Context أو أي مكان بتخزن فيه بيانات التانت الحالي
 */
export function useTableFormatRulesRealtime(tableKey, tenantId) {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // connecting | connected | error

  const fetchRules = useCallback(() => {
    setLoading(true);
    fetch(`/api/table-format-rules?tableKey=${tableKey}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
    })
      .then((res) => res.json())
      .then((json) => setRules(json.data || []))
      .finally(() => setLoading(false));
  }, [tableKey]);

  // === التحميل الأولي ===
  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  // === الاستماع اللحظي ===
  useEffect(() => {
    if (!tenantId || !tableKey) return;

    const channelName = `tenant.${tenantId}.table-format-rules.${tableKey}`;
    const channel = echo.private(channelName);

    channel.subscribed(() => setConnectionStatus('connected'));
    channel.error((err) => {
      console.error('Reverb channel error:', err);
      setConnectionStatus('error');
    });

    channel.listen('.rule.changed', (payload) => {
      const { action, rule } = payload;

      setRules((prev) => {
        switch (action) {
          case 'created':
            // تجنب التكرار لو وصل الحدث مرتين بالغلط
            return prev.some((r) => r.id === rule.id) ? prev : [...prev, rule];

          case 'updated':
          case 'toggled':
            return prev.map((r) => (r.id === rule.id ? rule : r));

          case 'deleted':
            return prev.filter((r) => r.id !== rule.id);

          default:
            return prev;
        }
      });
    });

    return () => {
      echo.leave(channelName);
    };
  }, [tableKey, tenantId]);

  return { rules, loading, connectionStatus, refetch: fetchRules };
}
