package com.rozgar360

import android.content.Context
import android.location.Geocoder
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.util.Locale

class GeocoderModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    
    override fun getName(): String {
        return "GeocoderModule"
    }

    @ReactMethod
    fun reverseGeocode(latitude: Double, longitude: Double, promise: Promise) {
        try {
            val context = reactApplicationContext
            val geocoder = Geocoder(context, Locale.getDefault())
            
            if (!Geocoder.isPresent()) {
                promise.reject("GEOCODER_NOT_AVAILABLE", "Geocoder is not available on this device")
                return
            }

            val addresses = geocoder.getFromLocation(latitude, longitude, 1)
            
            if (addresses != null && addresses.isNotEmpty()) {
                val address = addresses[0]
                val addressLines = address.getAddressLine(0) ?: ""
                
                // Build formatted address
                val formattedAddress = StringBuilder()
                
                // Street address
                val streetNumber = address.subThoroughfare ?: ""
                val streetName = address.thoroughfare ?: ""
                if (streetNumber.isNotEmpty() || streetName.isNotEmpty()) {
                    formattedAddress.append("$streetNumber $streetName".trim())
                }
                
                // Locality (city)
                val locality = address.locality ?: ""
                if (locality.isNotEmpty()) {
                    if (formattedAddress.isNotEmpty()) formattedAddress.append(", ")
                    formattedAddress.append(locality)
                }
                
                // Admin area (state)
                val adminArea = address.adminArea ?: ""
                if (adminArea.isNotEmpty()) {
                    if (formattedAddress.isNotEmpty()) formattedAddress.append(", ")
                    formattedAddress.append(adminArea)
                }
                
                // Postal code
                val postalCode = address.postalCode ?: ""
                if (postalCode.isNotEmpty()) {
                    if (formattedAddress.isNotEmpty()) formattedAddress.append(" ")
                    formattedAddress.append(postalCode)
                }
                
                // Country
                val country = address.countryName ?: ""
                if (country.isNotEmpty()) {
                    if (formattedAddress.isNotEmpty()) formattedAddress.append(", ")
                    formattedAddress.append(country)
                }
                
                // Use addressLine if available, otherwise use formatted address
                val finalAddress = if (addressLines.isNotEmpty()) {
                    addressLines
                } else {
                    formattedAddress.toString()
                }
                
                promise.resolve(finalAddress)
            } else {
                promise.reject("NO_ADDRESS_FOUND", "No address found for the given coordinates")
            }
        } catch (e: Exception) {
            promise.reject("GEOCODING_ERROR", "Failed to geocode: ${e.message}", e)
        }
    }
}

