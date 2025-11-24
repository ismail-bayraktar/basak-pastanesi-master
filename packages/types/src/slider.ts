export interface Slider {
  _id: string;
  template: 'split-left' | 'split-right' | 'centered' | 'overlay' | 'full-width';
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  buttonStyle: 'primary' | 'secondary' | 'outline';
  image: string;
  mobileImage?: string;
  backgroundImage?: string;
  overlayOpacity: number;
  textColor: 'light' | 'dark' | 'auto';
  viewCount: number;
  clickCount: number;
  lastViewed?: Date;
  altText: string;
  seoTitle: string;
  order: number;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SliderListResponse {
  success: boolean;
  sliders: Slider[];
  message?: string;
}
