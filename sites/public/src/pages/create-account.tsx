import { useEffect } from "react"
import { useRouter } from "next/router"

const CreateAccount = () => {
  const router = useRouter()

  useEffect(() => {
    void router.replace("/sign-in")
  }, [router])

  return null
}

export default CreateAccount
