import { localEnvironment } from './environment.local.prod';

export const environment = {
  production: true,
  supabaseUrl: localEnvironment.supabaseUrl,
  supabasePublishableKey: localEnvironment.supabasePublishableKey,
  apiBaseUrl: '/api',
};
