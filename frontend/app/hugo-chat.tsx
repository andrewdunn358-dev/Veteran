/**
 * Hugo Chat - Redirects to unified chat component
 * The unified chat at /chat/hugo has full theme support
 */
import { Redirect } from 'expo-router';

export default function HugoChatRedirect() {
  return <Redirect href="/chat/hugo" />;
}
