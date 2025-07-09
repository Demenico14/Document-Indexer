import { PWAInstallPrompt } from "@/components/pwa-install-prompt"

export default function Home() {
  return (
    <div>
      <h1>Welcome to my PWA!</h1>
      <p>This is a simple Progressive Web App.</p>
      <PWAInstallPrompt />
    </div>
  )
}
