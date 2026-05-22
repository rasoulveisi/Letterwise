import { computed, inject, Injectable, signal } from '@angular/core';
import type { Session, User } from '@supabase/supabase-js';
import { SupabaseBrowserFactory } from './supabase-browser.factory';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase = inject(SupabaseBrowserFactory);

  readonly session = signal<Session | null>(null);
  readonly user = computed<User | null>(() => this.session()?.user ?? null);
  readonly accessToken = computed(() => this.session()?.access_token ?? null);
  readonly signedIn = computed(() => !!this.session());

  constructor() {
    const client = this.supabase.getClient();
    if (!client) {
      return;
    }

    void client.auth.getSession().then(({ data }) => this.session.set(data.session));
    client.auth.onAuthStateChange((_event, session) => this.session.set(session));
  }

  async signInWithGoogle(): Promise<void> {
    const client = this.supabase.getClient();
    if (!client) {
      return;
    }
    await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: globalThis.location?.href,
      },
    });
  }

  async signOut(): Promise<void> {
    const client = this.supabase.getClient();
    this.session.set(null);
    await client?.auth.signOut();
  }

  async refreshSession(): Promise<boolean> {
    const client = this.supabase.getClient();
    if (!client) {
      return false;
    }
    const { data, error } = await client.auth.refreshSession();
    this.session.set(data.session);
    return !error && !!data.session;
  }
}
