// app/(protected)/dashboard/moderation/page.tsx
import { ModerationPanel } from "@/components/moderation/ModerationPanel"
import { DemoData } from "@/components/moderation/DemoData"

export default function ModerationPage() {
  return (
    <>
      <ModerationPanel />
      <DemoData />
    </>
  )
}
