import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseBrowserFactory {
  private readonly platformId = inject(PLATFORM_ID);
  private client?: SupabaseClient;

  getClient(): SupabaseClient | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    if (
      environment.supabaseUrl.includes('YOUR_PROJECT_REF') ||
      environment.supabasePublishableKey === 'YOUR_PUBLISHABLE_KEY'
    ) {
      return null;
    }
    this.client ??= createClient(environment.supabaseUrl, environment.supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    return this.client;
  }
}
