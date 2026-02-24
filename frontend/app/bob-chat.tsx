/**
 * Bob Chat - Redirects to unified chat component
 * The unified chat at /chat/bob has full theme support
 */
import { Redirect } from 'expo-router';

export default function BobChatRedirect() {
  return <Redirect href="/chat/bob" />;
}
