import React from "react"
import { Card, Heading } from "@bloom-housing/ui-seeds"
import { t } from "@bloom-housing/ui-components"
import { Unit } from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import unitViewStyles from "../UnitView.module.scss"

type UnitAvailabilityProps = {
  unit: Unit
}

/**
 * Displays the availability/status of a unit.
 *
 * Note: The `status` field exists in the Prisma schema (UnitsStatusEnum:
 * unknown, available, occupied, unavailable) but is not yet exposed in the
 * generated API types (backend-swagger.ts). Once the backend exposes `status`
 * on the Unit type, this component will render it automatically.
 */
export const UnitAvailability = ({ unit }: UnitAvailabilityProps) => {
  // Cast to access status if it exists at runtime even though
  // it's not yet in the generated TypeScript interface
  const status = (unit as unknown as Record<string, unknown>).status as string | undefined

  if (!status || status === "unknown") return null

  const statusLabel = t(`unit.status.${status}`)

  return (
    <Card className={`${unitViewStyles["mobile-full-width-card"]}`}>
      <Card.Section divider="flush">
        <Heading priority={2} size={"lg"}>
          {t("t.availability")}
        </Heading>
      </Card.Section>
      <Card.Section divider="flush">
        <p>{statusLabel}</p>
      </Card.Section>
    </Card>
  )
}
