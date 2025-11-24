import { create } from 'zustand';
import apiClient from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { Slider, SliderListResponse } from '@/types/slider';

interface SliderStore {
  sliders: Slider[];
  loading: boolean;
  error: string | null;
  fetchSliders: () => Promise<void>;
}

export const useSliderStore = create<SliderStore>((set) => ({
  sliders: [],
  loading: false,
  error: null,

  fetchSliders: async () => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get<SliderListResponse>(
        API_ENDPOINTS.SLIDERS.LIST
      );

      if (response.data.success) {
        set({ sliders: response.data.sliders, loading: false });
      } else {
        set({ error: response.data.message || 'Sliderlar yüklenemedi', loading: false });
      }
    } catch (error) {
      set({ error: 'Sliderlar yüklenirken bir hata oluştu', loading: false });
      console.error('Slider fetch error:', error);
    }
  },
}));
