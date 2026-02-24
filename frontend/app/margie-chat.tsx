/**
 * Margie Chat - Redirects to unified chat component
 * The unified chat at /chat/margie has full theme support
 */
import { Redirect } from 'expo-router';

export default function MargieChatRedirect() {
  return <Redirect href="/chat/margie" />;
}
