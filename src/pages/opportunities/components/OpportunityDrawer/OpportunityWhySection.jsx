import { Lightbulb } from 'lucide-react'

export function OpportunityWhySection({ opportunity }) {
  if (!opportunity.reason_summary) return null

  return (
    <section className="rounded-xl border border-[#A0ECF0] bg-[#E8F9FA] p-4">
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb size={18} className="text-[#007A80]" />
        <h4 className="font-black text-[#007A80]">لماذا هذه الفرصة؟</h4>
      </div>
      <p className="text-[15px] leading-7 font-semibold text-[#075C61]">
        {opportunity.reason_summary}
      </p>
    </section>
  )
}
