import React, { useRef } from "react"
import { useLoadScript, Autocomplete } from "@react-google-maps/api"

const libraries: ("places")[] = ["places"]

export default function LocationSearch({ onSelect }: any) {
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyAMihaWVEsD5coLV6wDz20Gkt6oddicvCg",
    libraries,
  })

  if (!isLoaded) return <p>Loading...</p>

  const onLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete
  }

  const onPlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace()

    if (!place?.geometry) return

    const lat = place.geometry.location?.lat()
    const lng = place.geometry.location?.lng()

    onSelect({
      lat,
      lng,
      address: place.formatted_address,
    })
  }

  return (
    <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
      <input
        type="text"
        placeholder="Search location..."
        className="w-full border p-2 rounded"
      />
    </Autocomplete>
  )
}