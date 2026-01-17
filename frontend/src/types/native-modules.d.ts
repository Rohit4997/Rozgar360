import 'react-native';

declare module 'react-native' {
  namespace NativeModules {
    interface GeocoderModule {
      reverseGeocode(
        latitude: number,
        longitude: number
      ): Promise<string>;
    }
  }
}

