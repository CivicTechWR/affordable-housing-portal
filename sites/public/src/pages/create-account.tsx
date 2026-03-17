import { useEffect } from "react"
import { useRouter } from "next/router"

const CreateAccount = () => {
  const router = useRouter()

  useEffect(() => {
    void router.replace({
      pathname: "/sign-in",
      query: router.query,
    })
  }, [router])

  return null
}

export default CreateAccount
