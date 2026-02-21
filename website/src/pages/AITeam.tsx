import { Link } from 'react-router-dom'
import { MessageCircle, ChevronRight, Shield, AlertTriangle, Heart, Brain, Leaf, Sparkles } from 'lucide-react'

const AI_TEAM = [
  {
    name: 'Tommy',
    role: 'Your Battle Buddy',
    avatar: '/images/tommy.png',
    description: 'A fellow soldier who understands the weight of service. Tommy speaks your language and provides that comforting presence of a mate who\'s been through it.',
    speciality: 'General support & companionship',
    color: 'from-blue-500/20 to-blue-600/20',
    borderColor: 'border-blue-500/30',
  },
  {
    name: 'Doris',
    role: 'Warm Support',
    avatar: '/images/doris.png',
    description: 'Like the warm, caring presence of a grandmother who\'s seen it all. Doris offers gentle wisdom, patience, and unconditional support.',
    speciality: 'Emotional comfort & listening',
    color: 'from-pink-500/20 to-rose-500/20',
    borderColor: 'border-pink-500/30',
  },
  {
    name: 'Bob',
    role: 'Ex-Para Peer Support',
    avatar: '/images/bob.png',
    description: 'A former paratrooper who knows the airborne brotherhood. Bob brings direct, no-nonsense support with deep understanding of regiment life.',
    speciality: 'Military experience & peer support',
    color: 'from-green-500/20 to-emerald-500/20',
    borderColor: 'border-green-500/30',
  },
  {
    name: 'Finch',
    role: 'Crisis & PTSD Support',
    avatar: '/images/finch.png',
    description: 'Specialised in supporting those dealing with trauma and difficult moments. Finch helps guide you through dark patches with calm, trained expertise.',
    speciality: 'Crisis intervention & trauma support',
    color: 'from-purple-500/20 to-violet-500/20',
    borderColor: 'border-purple-500/30',
  },
  {
    name: 'Margie',
    role: 'Alcohol & Substance Support',
    avatar: '/images/margie.png',
    description: 'Understands the challenges of substance use and recovery. Margie offers non-judgemental support for those struggling with alcohol or other substances.',
    speciality: 'Addiction support & recovery',
    color: 'from-amber-500/20 to-orange-500/20',
    borderColor: 'border-amber-500/30',
  },
  {
    name: 'Hugo',
    role: 'Self-Help & Wellness Guide',
    avatar: '/images/hugo.png',
    description: 'Your daily motivation and wellness companion. Hugo helps with grounding techniques, building positive habits, and maintaining mental fitness.',
    speciality: 'Wellness, motivation & self-care',
    color: 'from-teal-500/20 to-cyan-500/20',
    borderColor: 'border-teal-500/30',
  },
]

export default function AITeam() {
  return (
    <div className="bg-primary min-h-screen">
      {/* Header */}
      <section className="bg-primary-dark py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Meet the AI Team</h1>
          <p className="text-xl text-gray-300">Six unique companions available 24/7 to support you</p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <div className="bg-surface/50 rounded-2xl p-6 md:p-8 border border-white/10 mb-12 text-center">
          <Brain className="w-12 h-12 text-accent-blue mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">AI Companions, Not Replacements</h2>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            Our AI team members are designed to be there when you need someone to talk to. They're not therapists 
            or medical professionals — they're companions who listen, support, and help you through difficult moments 
            until you can speak with a real person.
          </p>
        </div>

        {/* AI Team Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {AI_TEAM.map((member) => (
            <div 
              key={member.name}
              className={`bg-gradient-to-br ${member.color} rounded-2xl p-6 border ${member.borderColor} hover:scale-[1.02] transition-transform`}
            >
              <div className="flex items-start gap-4 mb-4">
                <img 
                  src={member.avatar} 
                  alt={member.name}
                  className="w-16 h-16 rounded-full border-2 border-white/20 object-cover"
                />
                <div>
                  <h3 className="text-xl font-bold text-white">{member.name}</h3>
                  <p className="text-gray-300 text-sm">{member.role}</p>
                </div>
              </div>
              <p className="text-gray-300 mb-4 text-sm leading-relaxed">{member.description}</p>
              <div className="bg-black/20 rounded-lg px-3 py-2">
                <span className="text-gray-400 text-xs uppercase tracking-wider">Speciality</span>
                <p className="text-white text-sm font-medium">{member.speciality}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Important Information */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-green-400" />
              <h3 className="text-xl font-semibold text-white">Built-in Safeguarding</h3>
            </div>
            <p className="text-gray-300">
              All our AI companions are trained to recognise signs of crisis. If you're in danger, they'll 
              gently guide you towards real-world help and emergency services.
            </p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
              <h3 className="text-xl font-semibold text-white">Know the Limits</h3>
            </div>
            <p className="text-gray-300">
              Our AI can't diagnose conditions, prescribe treatment, or handle medical emergencies. 
              They're here to support and listen — not to replace professional care.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-accent-teal/20 to-accent-blue/20 rounded-2xl p-8 text-center border border-white/10">
          <MessageCircle className="w-12 h-12 text-accent-teal mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Ready to Start a Conversation?</h2>
          <p className="text-gray-300 mb-6 max-w-xl mx-auto">
            Open the Radio Check app and choose the AI companion that feels right for you. 
            They're available 24/7, whenever you need to talk.
          </p>
          <a
            href="https://app.radiocheck.me"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-accent-teal hover:bg-accent-teal/90 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:scale-105"
          >
            Open Radio Check
            <ChevronRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  )
}
