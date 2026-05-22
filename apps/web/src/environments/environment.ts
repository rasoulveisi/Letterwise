import { localEnvironment } from './environment.local';

export const environment = {
  production: false,
  supabaseUrl: localEnvironment.supabaseUrl,
  supabasePublishableKey: localEnvironment.supabasePublishableKey,
  apiBaseUrl: '/api',
};
