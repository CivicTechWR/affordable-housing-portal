import { Address, MultiLineAddress, t } from "@bloom-housing/ui-components"
import { Button } from "@bloom-housing/ui-seeds"
import { forwardGeocode } from "@bloom-housing/shared-helpers"

export interface FoundAddress {
  newAddress?: Address
  originalAddress?: Address
  invalid?: boolean
}

const hasAddressLevelMatch = (street?: string, zipCode?: string, hasHouseNumber?: boolean) => {
  const hasStreet = typeof street === "string" && street.trim().length > 0
  const hasZipCode = typeof zipCode === "string" && zipCode.trim().length > 0

  return hasStreet && hasZipCode && hasHouseNumber === true
}

export const findValidatedAddress = (
  address: Address,
  setFoundAddress: React.Dispatch<React.SetStateAction<FoundAddress>>,
  setNewAddressSelected: React.Dispatch<React.SetStateAction<boolean>>
) => {
  return forwardGeocode(
    `${address.street}, ${address.city}, ${address.state} ${address.zipCode}, United States`
  )
    .then((geocodedAddress) => {
      if (
        !geocodedAddress ||
        !hasAddressLevelMatch(
          geocodedAddress.street,
          geocodedAddress.zipCode,
          geocodedAddress.hasHouseNumber
        )
      ) {
        setNewAddressSelected(false)
        setFoundAddress({ invalid: true, originalAddress: address })
      } else {
        setNewAddressSelected(true)
        setFoundAddress({
          originalAddress: address,
          newAddress: {
            street: geocodedAddress.street,
            street2: address.street2 && address.street2 !== "" ? address.street2 : undefined,
            city: geocodedAddress.city || address.city,
            state: geocodedAddress.state || address.state,
            zipCode: geocodedAddress.zipCode,
            longitude: geocodedAddress.longitude,
            latitude: geocodedAddress.latitude,
          },
        })
      }
    })
    .catch((err) => {
      console.error(`Error calling Photon API: ${err}`)
      setNewAddressSelected(false)
      setFoundAddress({ invalid: true, originalAddress: address })
    })
}

interface AddressValidationSelectionProps {
  foundAddress: FoundAddress
  newAddressSelected: boolean
  setVerifyAddress: React.Dispatch<React.SetStateAction<boolean>>
  setNewAddressSelected: React.Dispatch<React.SetStateAction<boolean>>
  setVerifyAddressStep?: React.Dispatch<React.SetStateAction<number>>
}

export const AddressValidationSelection = (props: AddressValidationSelectionProps) => {
  const {
    foundAddress,
    newAddressSelected,
    setNewAddressSelected,
    setVerifyAddress,
    setVerifyAddressStep,
  } = props

  return (
    <>
      {foundAddress.newAddress && (
        <fieldset>
          <legend className="field-note mb-4">{t("application.contact.suggestedAddress")}</legend>

          <div className="field field--inline">
            <input
              type="radio"
              name="chooseaddress"
              id="foundaddress"
              value="found"
              checked={newAddressSelected}
              onChange={(e) => setNewAddressSelected(e.target.checked)}
              data-testid="app-found-address-choice"
            />
            <label
              htmlFor="foundaddress"
              className="font-alt-sans font-semibold"
              data-testid="app-found-address-label"
            >
              <MultiLineAddress
                address={{
                  street: foundAddress.newAddress.street2
                    ? `${foundAddress.newAddress.street}<br/>${foundAddress.newAddress.street2}`
                    : foundAddress.newAddress.street,
                  city: foundAddress.newAddress.city,
                  state: foundAddress.newAddress.state,
                  zipCode: foundAddress.newAddress.zipCode,
                }}
              />
            </label>
          </div>
        </fieldset>
      )}
      {foundAddress.originalAddress && (
        <fieldset className="mt-6">
          <legend className="field-note mb-4">{t("application.contact.youEntered")}</legend>

          <div className="flex items-start">
            <div className="field field--inline">
              <input
                type="radio"
                name="chooseaddress"
                id="originaladdress"
                value="original"
                checked={!newAddressSelected}
                onChange={(e) => setNewAddressSelected(!e.target.checked)}
              />
              <label htmlFor="originaladdress" className="font-alt-sans font-semibold">
                <MultiLineAddress
                  address={{
                    street: foundAddress.originalAddress.street2
                      ? `${foundAddress.originalAddress.street}<br/>${foundAddress.originalAddress.street2}`
                      : foundAddress.originalAddress.street,
                    city: foundAddress.originalAddress.city,
                    state: foundAddress.originalAddress.state,
                    zipCode: foundAddress.originalAddress.zipCode,
                  }}
                />
              </label>
            </div>
            <Button
              variant={"text"}
              className="font-alt-sans font-semibold mt-0 mr-0"
              onClick={() => {
                setVerifyAddress(false)
                setVerifyAddressStep?.(0)
              }}
              id="app-edit-original-address"
            >
              {t("t.edit")}
            </Button>
          </div>
        </fieldset>
      )}
    </>
  )
}
