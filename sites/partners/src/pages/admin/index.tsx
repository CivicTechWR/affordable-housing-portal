import { useContext, useEffect, useMemo, useState } from "react"
import Head from "next/head"
import { AuthContext } from "@bloom-housing/shared-helpers"
import { Field, MinimalTable, t } from "@bloom-housing/ui-components"
import { Button, Card, Heading } from "@bloom-housing/ui-seeds"
import Layout from "../../layouts"
import { NavigationHeader } from "../../components/shared/NavigationHeader"

const Admin = () => {
  const { profile, featureFlagService } = useContext(AuthContext)
  const [isLoading, setIsLoading] = useState(true)
  const [featureFlags, setFeatureFlags] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      const retrievedFeatureFlags = await featureFlagService.list()
      setFeatureFlags(retrievedFeatureFlags)
      setIsLoading(false)
    }
    if (isLoading) {
      void fetchData()
    }
  }, [featureFlagService, isLoading])

  const onAddAll = async () => {
    await featureFlagService.addAllNewFeatureFlags()
    setIsLoading(true)
  }

  const onFeatureFlagToggle = async (featureFlag: { id: string; description: string; active: boolean }) => {
    await featureFlagService.update({
      body: {
        id: featureFlag.id,
        description: featureFlag.description,
        active: !featureFlag.active,
      },
    })
    setIsLoading(true)
  }

  const featureFlagTableData = useMemo(() => {
    return featureFlags?.map((flag) => {
      return {
        featureFlag: {
          content: <b>{flag.name}</b>,
        },
        description: {
          content: flag.description,
        },
        active: {
          content: (
            <Field
              type="checkbox"
              id={flag.id}
              name={flag.name}
              label={flag.active ? t("t.enabled") : t("t.disabled")}
              inputProps={{
                checked: flag.active,
              }}
              bordered
              onChange={() => onFeatureFlagToggle(flag)}
            />
          ),
        },
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [featureFlags])

  if (!profile || !profile?.userRoles?.isSuperAdmin) {
    window.location.href = "/unauthorized"
    return null
  }

  return (
    <Layout>
      <Head>
        <title>{`Admin Panel - ${t("nav.siteTitlePartners")}`}</title>
      </Head>
      <NavigationHeader className="relative" title={t("t.administration")} />
      <section>
        <article className="flex-row flex-wrap relative max-w-screen-xl mx-auto py-8 px-4">
          <Card.Header className={"seeds-m-be-header"}>
            <Heading size="2xl" priority={2}>
              {t("t.featureFlag")}
            </Heading>
          </Card.Header>
          <Card.Section>
            <MinimalTable
              headers={{
                featureFlag: "t.featureFlag",
                description: "t.descriptionTitle",
                active: "t.status",
              }}
              data={featureFlagTableData}
              cellClassName={"px-5 py-3"}
            />
          </Card.Section>
          <div className="seeds-m-bs-content">
            <Button onClick={onAddAll}>{t("admin.addFeatureFlags")}</Button>
          </div>
        </article>
      </section>
    </Layout>
  )
}

export default Admin
