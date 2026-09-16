import { Input } from '../../../../shared/components/ui/Input'

export function FollowUpScheduleSection({ form, updateForm }) {
  return (
    <div className="min-h-0 overflow-y-auto rounded-xl border border-[#D7EEF0] bg-[#F8FEFF] p-3">
      <label className="flex cursor-pointer items-center justify-between gap-3">
        <span className="min-w-0">
          <span className="block text-sm font-black text-[#111827]">إضافة موعد/اجتماع مرتبط</span>
          <span className="mt-0.5 block text-xs font-bold text-[#64748B]">
            فعّل هذا الجزء لإدخال بيانات المكالمة أو الاجتماع.
          </span>
        </span>
        <input
          type="checkbox"
          checked={Boolean(form.schedule_enabled)}
          onChange={(event) => {
            const checked = event.target.checked
            updateForm('schedule_enabled', checked)
            if (!checked) {
              updateForm('schedule_type', 'none')
            }
          }}
          className="h-5 w-5 rounded border-[#BEEFF2] text-[#00AEB8] focus:ring-[#00C2CB]"
        />
      </label>

      {form.schedule_enabled ? (
        <div className="mt-3 grid gap-2">
          <label className="grid gap-1.5">
            <span className="text-sm font-black text-[#111827]">موعد مرتبط بالمتابعة</span>
            <select
              value={form.schedule_type}
              onChange={(event) => updateForm('schedule_type', event.target.value)}
              className="h-10 rounded-lg border border-[var(--border)] bg-white px-3 text-sm font-arabic text-[var(--text)] outline-none transition-colors focus:border-transparent focus:ring-2 focus:ring-[#00C2CB]"
            >
              <option value="none">بدون موعد</option>
              <option value="call">إنشاء موعد مكالمة</option>
              <option value="meeting">إنشاء موعد ميتنج</option>
            </select>
          </label>

          {form.schedule_type !== 'none' ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                type="text"
                label="عنوان الموعد"
                value={form.schedule_title}
                onChange={(event) => updateForm('schedule_title', event.target.value)}
                placeholder="اختياري"
              />
              <label className="grid gap-1.5">
                <span className="text-sm font-medium font-arabic text-[var(--text)]">الأولوية</span>
                <select
                  value={form.schedule_priority}
                  onChange={(event) => updateForm('schedule_priority', event.target.value)}
                  className="h-10 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-arabic text-[var(--text)] outline-none transition-colors focus:border-transparent focus:ring-2 focus:ring-[#00C2CB]"
                >
                  <option value="low">منخفضة</option>
                  <option value="medium">متوسطة</option>
                  <option value="high">عالية</option>
                  <option value="urgent">عاجلة</option>
                </select>
              </label>
              <Input
                type="datetime-local"
                label="بداية الموعد"
                value={form.schedule_start_at}
                onChange={(event) => updateForm('schedule_start_at', event.target.value)}
              />
              <Input
                type="datetime-local"
                label="نهاية الموعد"
                value={form.schedule_end_at}
                onChange={(event) => updateForm('schedule_end_at', event.target.value)}
              />
              <label className="grid gap-1.5">
                <span className="text-sm font-medium font-arabic text-[var(--text)]">الوضع</span>
                <select
                  value={form.schedule_mode}
                  onChange={(event) => updateForm('schedule_mode', event.target.value)}
                  className="h-10 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-arabic text-[var(--text)] outline-none transition-colors focus:border-transparent focus:ring-2 focus:ring-[#00C2CB]"
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </select>
              </label>
              <Input
                type="text"
                label="الرابط"
                value={form.schedule_meeting_link}
                onChange={(event) => updateForm('schedule_meeting_link', event.target.value)}
                placeholder="اختياري"
              />
              <Input
                type="text"
                label="المكان"
                value={form.schedule_location}
                onChange={(event) => updateForm('schedule_location', event.target.value)}
                placeholder="اختياري"
              />
            </div>

            {form.schedule_type === 'call' ? (
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="grid gap-1.5">
                  <span className="text-sm font-medium font-arabic text-[var(--text)]">مزود المكالمة</span>
                  <select
                    value={form.schedule_call_provider}
                    onChange={(event) => updateForm('schedule_call_provider', event.target.value)}
                    className="h-10 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-arabic text-[var(--text)] outline-none transition-colors focus:border-transparent focus:ring-2 focus:ring-[#00C2CB]"
                  >
                    <option value="manual">manual</option>
                    <option value="cloud_call_center">cloud_call_center</option>
                  </select>
                </label>
                <Input
                  type="text"
                  label="رقم المتصل"
                  value={form.schedule_caller_number}
                  onChange={(event) => updateForm('schedule_caller_number', event.target.value)}
                  placeholder="اختياري"
                />
                <Input
                  type="text"
                  label="رقم العميل"
                  value={form.schedule_callee_number}
                  onChange={(event) => updateForm('schedule_callee_number', event.target.value)}
                  placeholder="رقم العميل"
                />
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-3">
              <label className="grid gap-1.5">
                <span className="text-sm font-medium font-arabic text-[var(--text)]">نوع التذكير</span>
                <select
                  value={form.schedule_reminder_type}
                  onChange={(event) => updateForm('schedule_reminder_type', event.target.value)}
                  className="h-10 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-arabic text-[var(--text)] outline-none transition-colors focus:border-transparent focus:ring-2 focus:ring-[#00C2CB]"
                >
                  <option value="system">system</option>
                  <option value="email">email</option>
                  <option value="both">both</option>
                </select>
              </label>
              <Input
                type="number"
                min="0"
                label="قبل الموعد"
                value={form.schedule_reminder_before}
                onChange={(event) => updateForm('schedule_reminder_before', event.target.value)}
              />
              <label className="grid gap-1.5">
                <span className="text-sm font-medium font-arabic text-[var(--text)]">الوحدة</span>
                <select
                  value={form.schedule_reminder_unit}
                  onChange={(event) => updateForm('schedule_reminder_unit', event.target.value)}
                  className="h-10 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-arabic text-[var(--text)] outline-none transition-colors focus:border-transparent focus:ring-2 focus:ring-[#00C2CB]"
                >
                  <option value="minutes">minutes</option>
                  <option value="hours">hours</option>
                  <option value="days">days</option>
                </select>
              </label>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-sm font-black text-[#111827]">وصف الموعد</span>
              <textarea
                value={form.schedule_description}
                onChange={(event) => updateForm('schedule_description', event.target.value)}
                rows={3}
                className="w-full resize-y rounded-xl border border-[#D8E7EA] bg-white px-3 py-2 text-sm font-bold text-[#111827] outline-none transition focus:border-[#00C2CB] focus:ring-2 focus:ring-[#BEEFF2]"
                placeholder="اختياري"
              />
            </label>
          </>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}