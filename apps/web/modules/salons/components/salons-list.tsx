"use client"

import Link from "next/link"
import { MapPin, Phone, Trash2, Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {  useSalons } from "@/hooks/salons/use-salons"
import { DeleteProductButton } from "@/components/delete-product-button"


export function SalonList() {
  const { data: salons, isLoading } = useSalons()
  

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (!salons?.length) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center gap-2 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            No salons yet. Create your first one to get started.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {salons.map((salon) => (
        <Card key={salon.id}>
          <CardHeader className="flex flex-row items-start justify-between gap-2">
            <CardTitle className="text-base">{salon.name}</CardTitle>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" asChild>
                <Link href={`/salons/${salon.id}/edit`}>
                  <Pencil className="size-4" />
                </Link>
              </Button>
              <DeleteProductButton Id={salon.id} />
            </div>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {salon.description && (
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {salon.description}
              </p>
            )}
            {salon.city && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-3.5" />
                {salon.city}
              </div>
            )}
            {salon.phone && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Phone className="size-3.5" />
                {salon.phone}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}