import { Link } from 'react-router-dom'
import { Radio, CheckCircle, XCircle, HelpCircle, Shield, ChevronRight, AlertTriangle, Heart } from 'lucide-react'

export default function About() {
  return (
    <div className="bg-primary min-h-screen">
      {/* Header */}
      <section className="bg-primary-dark py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">About Radio Check</h1>
          <p className="text-xl text-gray-300">Understanding what the app is, and what it isn't</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* What Is Radio Check */}
        <section className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Radio className="w-7 h-7 text-blue-400" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">What Is Radio Check?</h2>
          </div>
          <div className="bg-surface/50 rounded-2xl p-6 border border-white/10 mb-6">
            <p className="text-gray-300 text-lg leading-relaxed mb-4">
              Radio Check combines peer support and AI conversation to give veterans and serving military personnel 
              a place to talk when it matters.
            </p>
            <div className="bg-primary-light/50 rounded-xl p-4 border-l-4 border-accent-blue">
              <p className="text-blue-300 italic">
                "Sometimes a real person isn't available straight away. When that happens, 
                the chat is there — so you're not carrying things alone."
              </p>
            </div>
          </div>
          <p className="text-accent-green text-xl font-semibold text-center">
            Talking helps. Even talking here.
          </p>
        </section>

        {/* What the AI Is For */}
        <section className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-xl bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-green-400" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">What the AI Is For</h2>
          </div>
          <p className="text-gray-400 mb-6">The AI is here to:</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              'Listen without judgement',
              'Help you slow things down',
              'Let you get things off your chest',
              'Encourage healthy coping and real-world support',
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-surface/50 rounded-xl p-4 border border-white/10">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-gray-300">{item}</span>
              </div>
            ))}
          </div>
          <p className="text-gray-400 italic mt-6 text-center">You're always in control of the conversation.</p>
        </section>

        {/* What the AI Is Not For */}
        <section className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-xl bg-red-500/20 flex items-center justify-center">
              <XCircle className="w-7 h-7 text-red-400" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">What the AI Is Not For</h2>
          </div>
          <p className="text-gray-400 mb-6">The AI does not:</p>
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            {[
              'Give medical or legal advice',
              'Diagnose or treat conditions',
              'Replace professionals',
              'Handle emergencies on its own',
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-surface/50 rounded-xl p-4 border border-white/10">
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span className="text-gray-300">{item}</span>
              </div>
            ))}
          </div>
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5 flex gap-4">
            <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-amber-200">
              If you're in immediate danger, human help matters most — and we'll always encourage that. 
              Our AI is designed to recognise crisis situations and guide you towards real support.
            </p>
          </div>
        </section>

        {/* Is This Right for Me */}
        <section className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <HelpCircle className="w-7 h-7 text-amber-400" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Is This Right for Me?</h2>
          </div>
          <p className="text-gray-400 mb-6">Radio Check may help if you:</p>
          <div className="space-y-3 mb-6">
            {[
              'Feel low, stressed, angry, or stuck',
              'Find it easier to talk in writing',
              "Don't want to feel like a burden",
              'Just need somewhere safe to talk',
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-surface/30 rounded-lg p-4">
                <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                <span className="text-gray-300">{item}</span>
              </div>
            ))}
          </div>
          <p className="text-accent-green text-lg font-semibold text-center">
            You don't need to be in crisis to use this.
          </p>
        </section>

        {/* Safety & Trust */}
        <section className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Shield className="w-7 h-7 text-purple-400" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Safety & Trust</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            {[
              { icon: <Shield className="w-5 h-5" />, text: 'Safeguarding comes first' },
              { icon: <Heart className="w-5 h-5" />, text: 'Conversations handled with care' },
              { icon: '🤚', text: 'No judgement. No pressure.' },
              { icon: '🔒', text: 'Your privacy matters' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-surface/50 rounded-xl p-4 border border-white/10">
                <span className="text-purple-400">{typeof item.icon === 'string' ? item.icon : item.icon}</span>
                <span className="text-gray-300">{item.text}</span>
              </div>
            ))}
          </div>
          <p className="text-gray-400 italic text-center">
            We're upfront about what this is — and what it isn't.
          </p>
        </section>

        {/* The Bottom Line */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-primary-light to-accent-teal/20 rounded-2xl p-8 text-center border border-white/10">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">The Bottom Line</h2>
            <p className="text-blue-200 text-lg mb-6">
              If Radio Check helps you feel even a little less alone, it's doing its job.
            </p>
            <div className="inline-flex items-center gap-3 bg-primary-dark/50 rounded-full px-6 py-3">
              <Radio className="w-6 h-6 text-accent-green" />
              <span className="text-accent-green font-semibold text-lg">Someone is on the net.</span>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center">
          <Link
            to="/ai-team"
            className="inline-flex items-center justify-center gap-2 bg-accent-teal hover:bg-accent-teal/90 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:scale-105"
          >
            Meet the AI Team
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
