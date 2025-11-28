import { create } from 'zustand';
import apiClient from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { Slider, SliderListResponse } from '@/types/slider';

interface SliderStore {
  sliders: Slider[];
  loading: boolean;
  error: string | null;
  lastFetchTime: number | null;
  fetchSliders: () => Promise<void>;
}

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useSliderStore = create<SliderStore>((set, get) => ({
  sliders: [],
  loading: false,
  error: null,
  lastFetchTime: null,

  fetchSliders: async () => {
    const state = get();
    
    // Check cache - if data exists and is fresh, don't fetch again
    if (state.sliders.length > 0 && state.lastFetchTime) {
      const timeSinceLastFetch = Date.now() - state.lastFetchTime;
      if (timeSinceLastFetch < CACHE_DURATION) {
        return; // Use cached data
      }
    }

    // If already loading, don't start another request
    if (state.loading) {
      return;
    }

    set({ loading: true, error: null });

    let lastError: any = null;
    
    // Retry logic
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const response = await apiClient.get<SliderListResponse>(
          API_ENDPOINTS.SLIDERS.LIST
        );

        if (response.data.success) {
          set({ 
            sliders: response.data.sliders || [], 
            loading: false, 
            error: null,
            lastFetchTime: Date.now()
          });
          return; // Success, exit retry loop
        } else {
          set({ error: response.data.message || 'Sliderlar yüklenemedi', loading: false });
          return; // API returned error, don't retry
        }
      } catch (error: any) {
        lastError = error;
        
        // Check if it's a rate limit error (429)
        if (error.response?.status === 429) {
          // Calculate retry delay with exponential backoff
          const retryAfter = error.response.headers['retry-after'] 
            ? parseInt(error.response.headers['retry-after']) * 1000 
            : RETRY_DELAY * Math.pow(2, attempt);
          
          // If not the last attempt, wait and retry
          if (attempt < MAX_RETRIES - 1) {
            console.warn(`Rate limit hit, retrying in ${retryAfter}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
            await delay(retryAfter);
            continue; // Retry
          }
        } else {
          // For non-rate-limit errors, don't retry
          break;
        }
      }
    }

    // All retries failed
    set({ 
      error: lastError?.response?.status === 429 
        ? 'Çok fazla istek gönderildi. Lütfen birkaç saniye sonra tekrar deneyin.' 
        : 'Sliderlar yüklenirken bir hata oluştu', 
      loading: false 
    });
    console.error('Slider fetch error after retries:', lastError);
  },
}));
