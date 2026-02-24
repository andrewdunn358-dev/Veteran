/**
 * Sentry/Finch Chat - Redirects to unified chat component
 * The unified chat at /chat/sentry has full theme support
 */
import { Redirect } from 'expo-router';

export default function SentryChatRedirect() {
  return <Redirect href="/chat/sentry" />;
}
