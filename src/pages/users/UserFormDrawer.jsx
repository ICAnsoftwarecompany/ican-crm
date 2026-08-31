import { useEffect, useMemo, useState } from 'react'
import { AppDrawer } from '../../shared/components/overlays/AppDrawer'
import { Button } from '../../shared/components/ui/Button'
import { Input } from '../../shared/components/ui/Input'

const INITIAL_FORM = {
  name: '',
  email: '',
  username: '',
  phone: '',
  manager_id: '',
  role: '',
  type: '',
  priority: '',
  team_id: '',
  password: '',
  active: true,
}

function normalizeId(value) {
  if (value === null || value === undefined || value === '') return ''
  return String(value)
}

function getUserLabel(user) {
  return user?.name || user?.username || user?.email || `User #${user?.id}`
}

function getTeamLabel(team) {
  return team?.name || team?.team_name || `Team #${team?.id || team?.team_id}`
}

function toFormState(user) {
  if (!user) return INITIAL_FORM

  return {
    name: user.name || '',
    email: user.email || '',
    username: user.username || '',
    phone: user.phone || '',
    manager_id: normalizeId(user.manager_id || user.manager?.id),
    role: user.role || '',
    type: user.type || '',
    priority: user.priority ?? '',
    team_id: normalizeId(user.team_id || user.team?.id),
    password: '',
    active: Number(user.active ?? 1) === 1,
  }
}

function buildPayload(form, mode) {
  const payload = {
    name: form.name.trim(),
    email: form.email.trim() || null,
    username: form.username.trim() || null,
    phone: form.phone.trim() || null,
    manager_id: form.manager_id ? Number(form.manager_id) : null,
    role: form.role.trim() || null,
    type: form.type.trim() || null,
    priority: form.priority === '' ? null : Number(form.priority),
    team_id: form.team_id ? Number(form.team_id) : null,
    active: form.active ? 1 : 0,
  }

  if (mode === 'create' || form.password.trim()) {
    payload.password = form.password.trim()
  }

  return payload
}

export function UserFormDrawer({
  open,
  mode,
  user,
  users,
  teams,
  loading,
  error,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(INITIAL_FORM)
  const [localError, setLocalError] = useState('')

  useEffect(() => {
    if (!open) return
    setForm(toFormState(user))
    setLocalError('')
  }, [open, user])

  const managerOptions = useMemo(() => {
    const currentUserId = normalizeId(user?.id)
    return users.filter((item) => normalizeId(item.id) !== currentUserId)
  }, [user, users])

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLocalError('')

    if (!form.name.trim()) {
      setLocalError('اسم المستخدم مطلوب')
      return
    }

    if (!form.username.trim() && !form.email.trim()) {
      setLocalError('أدخل اليوزرنيم أو البريد الإلكتروني')
      return
    }

    if (mode === 'create' && !form.password.trim()) {
      setLocalError('كلمة المرور مطلوبة عند إنشاء مستخدم جديد')
      return
    }

    await onSubmit(buildPayload(form, mode))
  }

  return (
    <AppDrawer
      open={open}
      onClose={onClose}
      size="xl"
      title={mode === 'create' ? 'إضافة مستخدم' : 'تعديل المستخدم'}
      description="أدخل بيانات المستخدم وربطه بالمدير أو الفريق عند الحاجة."
    >
      <form onSubmit={handleSubmit} className="flex min-h-[calc(100vh-7.5rem)] flex-col gap-4">
        {(localError || error) && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {localError || error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="الاسم"
            value={form.name}
            onChange={(event) => updateField('name', event.target.value)}
            placeholder="مثال: John Doe"
          />
          <Input
            label="اليوزرنيم"
            value={form.username}
            onChange={(event) => updateField('username', event.target.value)}
            placeholder="johndoe"
          />
          <Input
            label="البريد الإلكتروني"
            type="email"
            value={form.email}
            onChange={(event) => updateField('email', event.target.value)}
            placeholder="john@example.com"
          />
          <Input
            label="الهاتف"
            value={form.phone}
            onChange={(event) => updateField('phone', event.target.value)}
            placeholder="+201234567890"
          />

          <label className="grid gap-1.5 text-sm font-medium text-[var(--text)]">
            المدير
            <select
              value={form.manager_id}
              onChange={(event) => updateField('manager_id', event.target.value)}
              className="h-10 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00C2CB]"
            >
              <option value="">بدون مدير</option>
              {managerOptions.map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {getUserLabel(manager)}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-[var(--text)]">
            الفريق
            <select
              value={form.team_id}
              onChange={(event) => updateField('team_id', event.target.value)}
              className="h-10 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00C2CB]"
            >
              <option value="">بدون فريق</option>
              {teams.map((team) => (
                <option key={team.id || team.team_id} value={team.id || team.team_id}>
                  {getTeamLabel(team)}
                </option>
              ))}
            </select>
          </label>

          <Input
            label="الدور"
            value={form.role}
            onChange={(event) => updateField('role', event.target.value)}
            placeholder="admin"
          />
          <Input
            label="النوع"
            value={form.type}
            onChange={(event) => updateField('type', event.target.value)}
            placeholder="internal"
          />
          <Input
            label="الأولوية"
            type="number"
            value={form.priority}
            onChange={(event) => updateField('priority', event.target.value)}
            placeholder="1"
          />
          <Input
            label={mode === 'create' ? 'كلمة المرور' : 'كلمة المرور الجديدة'}
            type="password"
            value={form.password}
            onChange={(event) => updateField('password', event.target.value)}
            placeholder={mode === 'create' ? 'strongpassword123' : 'اتركها فارغة بدون تغيير'}
          />
        </div>

        <label className="inline-flex items-center gap-2 text-sm text-[var(--text)]">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(event) => updateField('active', event.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
          المستخدم نشط
        </label>

        <div className="mt-auto flex items-center justify-end gap-2 border-t border-[var(--border)] pt-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            إلغاء
          </Button>
          <Button type="submit" loading={loading}>
            {mode === 'create' ? 'إضافة المستخدم' : 'حفظ التعديل'}
          </Button>
        </div>
      </form>
    </AppDrawer>
  )
}
