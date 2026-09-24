import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseClientFactory {
  constructor(private readonly config: ConfigService) {}

  forAnonymous(): SupabaseClient {
    const supabaseUrl =
      this.config.get<string>('SUPABASE_URL') ?? 'http://localhost:54321';
    const supabasePublishableKey =
      this.config.get<string>('SUPABASE_PUBLISHABLE_KEY') ?? 'publishable-key-placeholder';

    return createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  forUserToken(accessToken: string): SupabaseClient {
    const supabaseUrl = this.config.getOrThrow<string>('SUPABASE_URL');
    const supabasePublishableKey =
      this.config.get<string>('SUPABASE_PUBLISHABLE_KEY') ?? 'publishable-key-placeholder';

    return createClient(supabaseUrl, supabasePublishableKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
}
