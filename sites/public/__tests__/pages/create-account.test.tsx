import { getServerSideProps } from "../../src/pages/create-account"

describe("Create Account Page", () => {
  it("should redirect to sign-in", () => {
    expect(
      getServerSideProps({
        resolvedUrl: "/create-account",
      } as never)
    ).toEqual({
      redirect: {
        destination: "/sign-in",
        permanent: false,
      },
    })
  })

  it("should preserve query params when redirecting to sign-in", () => {
    expect(
      getServerSideProps({
        resolvedUrl:
          "/create-account?redirectUrl=/applications/start/choose-language&listingId=listing-123",
      } as never)
    ).toEqual({
      redirect: {
        destination:
          "/sign-in?redirectUrl=/applications/start/choose-language&listingId=listing-123",
        permanent: false,
      },
    })
  })
})
