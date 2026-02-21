import { Link } from 'react-router-dom'
import { Radio, Heart, Users, Shield, MessageCircle, Phone, Smartphone, ChevronRight, CheckCircle, Clock, Brain } from 'lucide-react'

const LOGO_URL = '/images/logo.png'

const features = [
  {
    icon: <MessageCircle className="w-6 h-6" />,
    title: 'AI Companions',
    description: 'Six unique AI characters available 24/7 to listen, support, and help you through tough moments.',
    color: 'bg-blue-500/20 text-blue-400',
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Peer Support',
    description: 'Connect with fellow veterans and serving personnel who truly understand your experiences.',
    color: 'bg-green-500/20 text-green-400',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Safeguarding First',
    description: 'Built with safety at its core. Our AI recognizes crisis situations and guides you to real help.',
    color: 'bg-purple-500/20 text-purple-400',
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: 'Always Available',
    description: 'When a real person isn\'t available straight away, the AI is there so you\'re not carrying things alone.',
    color: 'bg-amber-500/20 text-amber-400',
  },
]

const appFeatures = [
  'Journal your thoughts privately',
  'Track your mood over time',
  'Grounding & breathing exercises',
  'Connect with support organisations',
  'Request callbacks from volunteers',
  'Find your regimental associations',
]

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-dark via-primary to-primary-light opacity-50"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <img src={LOGO_URL} alt="Radio Check" className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-6 drop-shadow-2xl" />
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Your Digital Hand on the Shoulder
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-4 italic">
              "Radio Check" fuses real-time peer support with smart AI insight
            </p>
            
            <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto">
              A mental health and peer support app for veterans and serving military personnel. 
              Talk when you need to, with AI companions or real people who understand.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://app.radiocheck.me"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-accent-teal hover:bg-accent-teal/90 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:scale-105 shadow-lg shadow-accent-teal/20"
              >
                <Smartphone className="w-5 h-5" />
                Open the App
              </a>
              <Link
                to="/about"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all border border-white/20"
              >
                Learn More
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#1a2e44"/>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-primary py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">What Radio Check Offers</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              More than just an app — it's a support network designed by veterans, for veterans and serving personnel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-surface/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all hover:-translate-y-1">
                <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About the App Section */}
      <section className="bg-primary-light py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Tools to Help You Through
              </h2>
              <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                Radio Check includes practical self-care tools alongside our AI companions. 
                Track your wellbeing, practice grounding techniques, and find support services near you.
              </p>
              <ul className="space-y-4">
                {appFeatures.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-accent-green flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-surface/30 rounded-2xl p-8 border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <Brain className="w-8 h-8 text-accent-blue" />
                <h3 className="text-xl font-semibold text-white">AI That Understands</h3>
              </div>
              <p className="text-gray-300 mb-6">
                Our AI companions are designed specifically for the military community. They speak your language, 
                understand your experiences, and know when to step back and encourage real-world support.
              </p>
              <Link
                to="/ai-team"
                className="inline-flex items-center gap-2 text-accent-teal hover:text-accent-teal/80 font-medium transition-colors"
              >
                Meet the AI Team
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-accent-teal/20 to-accent-blue/20 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Someone Is On the Net
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            You don't need to be in crisis to use Radio Check. Whether you're feeling low, stressed, or just need somewhere safe to talk — we're here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://app.radiocheck.me"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-accent-teal hover:bg-accent-teal/90 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:scale-105"
            >
              <Radio className="w-5 h-5" />
              Start a Radio Check
            </a>
          </div>
        </div>
      </section>

      {/* Emergency Notice */}
      <section className="bg-primary-dark py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
            <p className="text-gray-300 mb-2">
              <strong className="text-white">In an emergency, always call 999</strong>
            </p>
            <p className="text-gray-400 text-sm">
              Radio Check is not an emergency service. For immediate danger or medical emergencies, please contact emergency services.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
