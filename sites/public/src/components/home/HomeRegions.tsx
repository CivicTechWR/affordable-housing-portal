import { ClickableCard } from "@bloom-housing/shared-helpers"
import { Grid, Link } from "@bloom-housing/ui-seeds"
import styles from "./HomeRegions.module.scss"

export const HomeRegions = ({ regions }: { regions: string[] }) => {
  return (
    <Grid>
      <Grid.Row columns={4}>
        {regions.map((region) => (
          <Grid.Cell key={region}>
            <ClickableCard className={styles["region-card"]}>
              <div className={styles["region-card-image"]}>
                <img src={"/images/listing-fallback.png"} alt={region} />
              </div>
              <Link
                href={`/listings?configurableRegions=${region}`}
                className={styles["region-card-name"]}
              >
                {region}
              </Link>
            </ClickableCard>
          </Grid.Cell>
        ))}
      </Grid.Row>
    </Grid>
  )
}
