import { GetServerSidePropsContext } from "next"

export const getServerSideProps = ({ resolvedUrl }: GetServerSidePropsContext) => {
  const { search } = new URL(resolvedUrl, "http://localhost")

  return {
    redirect: {
      destination: `/sign-in${search}`,
      permanent: false,
    },
  }
}

const CreateAccount = () => null

export default CreateAccount
