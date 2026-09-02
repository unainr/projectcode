// app/(dashboard)/salons/[id]/edit/page.tsx

import { SalonEditForm } from "@/modules/salons/components/update-salons"


export default async function EditSalonPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className="mx-auto flex max-w-4xl justify-center p-6">
      <SalonEditForm salonId={id} />
    </div>
  )
}