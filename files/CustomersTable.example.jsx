import React from 'react';
import { useTableFormatRulesRealtime } from './useTableFormatRulesRealtime';
import { useAuth } from './YourAuthContext'; // بدّلها بمصدر بيانات المستخدم/التانت الحقيقي عندك

function toReactStyle(style = {}) {
  const { bg, ...rest } = style;
  return { ...rest, ...(bg && { backgroundColor: bg }) };
}

function getRowStyle(row, rules) {
  const matched = rules
    .filter((r) => r.scope === 'row' && r.is_active)
    .find((r) => r.conditions.every((c) => row[c.field] == c.value)); // مبسّطة للتوضيح
  return matched ? toReactStyle(matched.style) : {};
}

export default function CustomersTable({ customers }) {
  const { tenantId } = useAuth();
  const { rules, loading, connectionStatus } = useTableFormatRulesRealtime('customers', tenantId);

  return (
    <div>
      {/* ===== مؤشر بسيط لحالة الاتصال اللحظي ===== */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, marginBottom: 10 }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: connectionStatus === 'connected' ? '#22c55e'
                    : connectionStatus === 'error' ? '#ef4444' : '#f59e0b',
        }} />
        {connectionStatus === 'connected' && 'التحديث اللحظي شغال'}
        {connectionStatus === 'connecting' && 'جاري الاتصال...'}
        {connectionStatus === 'error' && 'فشل الاتصال اللحظي'}
      </div>

      {loading ? (
        <p>جاري تحميل قواعد التنسيق...</p>
      ) : (
        <table>
          <tbody>
            {customers.map((row) => (
              <tr key={row.id} style={getRowStyle(row, rules)}>
                <td>{row.name}</td>
                <td>{row.status}</td>
                <td>{row.balance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
