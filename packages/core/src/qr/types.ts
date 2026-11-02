export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export type DotType =
  | 'square'
  | 'rounded'
  | 'dots'
  | 'classy'
  | 'classy-rounded'
  | 'extra-rounded'
  | 'diamond'
  | 'star'
  | 'horizontal-bars'
  | 'vertical-bars';

export type CornerSquareType = 'square' | 'rounded' | 'extra-rounded' | 'dot' | 'leaf' | 'diamond';
export type CornerDotType = 'square' | 'dot' | 'rounded' | 'diamond' | 'star';

export interface ColorStop {
  offset: number;
  color: string;
}

export interface GradientOptions {
  type: 'linear' | 'radial';
  rotation?: number; // degrees for linear
  colorStops: ColorStop[];
}

export interface ColorOrGradient {
  color?: string;
  gradient?: GradientOptions;
}

export interface LogoOptions {
  url?: string;
  sizeRatio?: number; // 0.1 to 0.35 of total size
  padding?: number; // margin around logo in modules
  backgroundColor?: string;
  borderRadius?: number; // in px
  protectZone?: boolean; // clear QR dots under logo
}

export interface FrameOptions {
  style: 'none' | 'simple-box' | 'banner-bottom' | 'balloon-top' | 'badge-polaroid';
  text?: string;
  textColor?: string;
  backgroundColor?: string;
  fontFamily?: string;
}

export interface QRCodeOptions {
  width: number;
  height: number;
  margin: number;
  data: string;
  errorCorrectionLevel: ErrorCorrectionLevel;
  dotsOptions: {
    type: DotType;
    colorOrGradient: ColorOrGradient;
  };
  cornersSquareOptions: {
    type: CornerSquareType;
    colorOrGradient: ColorOrGradient;
  };
  cornersDotOptions: {
    type: CornerDotType;
    colorOrGradient: ColorOrGradient;
  };
  backgroundOptions: {
    color: string;
    transparent?: boolean;
  };
  logoOptions?: LogoOptions;
  frameOptions?: FrameOptions;
}
