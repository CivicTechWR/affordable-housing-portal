import { useEffect } from "react"
import { useRouter } from "next/router"

const CreateAccount = () => {
  const { isReady, query, replace } = useRouter()

  useEffect(() => {
    if (!isReady) return

    void replace({
      pathname: "/sign-in",
      query,
    })
  }, [isReady, query, replace])

  return null
}

export default CreateAccount
