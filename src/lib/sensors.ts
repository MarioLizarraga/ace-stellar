// Camera sensor database for FOV, NPF rule, and DoF calculations

export interface SensorSpec {
  id: string
  name: string
  widthMm: number
  heightMm: number
  widthPx: number
  heightPx: number
  cropFactor: number
}

export const SENSOR_PRESETS: SensorSpec[] = [
  // Full frame (35mm)
  { id: 'full-frame', name: 'Full Frame (35mm)', widthMm: 36, heightMm: 24, widthPx: 6000, heightPx: 4000, cropFactor: 1.0 },
  { id: 'sony-a7iv', name: 'Sony A7 IV (FF)', widthMm: 35.9, heightMm: 23.9, widthPx: 7008, heightPx: 4672, cropFactor: 1.0 },
  { id: 'nikon-z6iii', name: 'Nikon Z6 III (FF)', widthMm: 35.9, heightMm: 23.9, widthPx: 6048, heightPx: 4032, cropFactor: 1.0 },
  { id: 'canon-r6ii', name: 'Canon R6 Mark II (FF)', widthMm: 35.9, heightMm: 23.9, widthPx: 6000, heightPx: 4000, cropFactor: 1.0 },
  { id: 'canon-r8', name: 'Canon EOS R8 (FF)', widthMm: 35.9, heightMm: 23.9, widthPx: 6000, heightPx: 4000, cropFactor: 1.0 },

  // APS-C
  { id: 'apsc-canon', name: 'APS-C Canon (1.6x)', widthMm: 22.2, heightMm: 14.8, widthPx: 6000, heightPx: 4000, cropFactor: 1.6 },
  { id: 'apsc-nikon-sony', name: 'APS-C Nikon/Sony (1.5x)', widthMm: 23.5, heightMm: 15.6, widthPx: 6000, heightPx: 4000, cropFactor: 1.5 },
  { id: 'sony-a6700', name: 'Sony A6700 (APS-C)', widthMm: 23.5, heightMm: 15.6, widthPx: 6192, heightPx: 4128, cropFactor: 1.5 },
  { id: 'fuji-xt5', name: 'Fujifilm X-T5 (APS-C)', widthMm: 23.5, heightMm: 15.6, widthPx: 7728, heightPx: 5152, cropFactor: 1.5 },

  // Micro Four Thirds
  { id: 'mft', name: 'Micro 4/3 (2x)', widthMm: 17.3, heightMm: 13.0, widthPx: 5184, heightPx: 3888, cropFactor: 2.0 },

  // Dedicated astro cameras
  { id: 'zwo-2600mc', name: 'ZWO ASI 2600MC Pro', widthMm: 23.5, heightMm: 15.7, widthPx: 6248, heightPx: 4176, cropFactor: 1.5 },
  { id: 'zwo-533mc', name: 'ZWO ASI 533MC Pro', widthMm: 11.3, heightMm: 11.3, widthPx: 3008, heightPx: 3008, cropFactor: 3.2 },

  // Smartphone (approximate)
  { id: 'phone-main', name: 'Smartphone Main Camera (typical)', widthMm: 7.6, heightMm: 5.7, widthPx: 4000, heightPx: 3000, cropFactor: 4.7 },
]

export function getPixelPitch(sensor: SensorSpec): number {
  // pixel pitch in micrometers (µm)
  return (sensor.widthMm / sensor.widthPx) * 1000
}
