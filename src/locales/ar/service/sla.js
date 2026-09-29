/** `service.sla.*` — عرض مستوى الخدمة (F2). */
export default {
  sla: {
    title: 'مستوى الخدمة (SLA)',
    column: 'مستوى الخدمة',
    none: 'لا توجد سياسة مستوى خدمة تنطبق على هذا الطلب.',
    policy: 'السياسة: {{name}}',
    badgeTitle: '{{state}} · الهدف التالي {{due}}',
    dueAt: 'المطلوب {{time}}',
    completedAt: 'تم {{time}}',
    pausedHint: 'العداد متوقف أثناء انتظار العميل',
    states: {
      on_track: 'في الموعد',
      at_risk: 'مهدد',
      breached: 'متجاوز',
      paused: 'متوقف مؤقتًا',
      met: 'تم الالتزام',
    },
    metrics: {
      first_response: 'أول رد',
      resolution: 'الحل',
    },
    activity: {
      escalated: 'مر {{percent}}% من وقت {{metric}}: {{action}} {{target}}',
    },
  },
}
