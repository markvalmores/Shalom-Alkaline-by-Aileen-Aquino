import { Globe, ShieldCheck, Mail, Phone, CreditCard, MessageCircle, Heart, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const features = [
    { icon: <Globe className="w-6 h-6" />, title: "Pure Sea Visions", desc: "Our water is sourced from the most pristine visions of Earth's oceans." },
    { icon: <ShieldCheck className="w-6 h-6" />, title: "Certified Alkaline", desc: "Rigorous testing ensures the perfect pH balance for your vitality." },
    { icon: <MessageCircle className="w-6 h-6" />, title: "Real-time Support", desc: "Direct line to our customer care team via Messenger." },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 sm:p-10 space-y-12">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-r from-violet-deep to-violet-primary rounded-[3rem] p-8 md:p-16 overflow-hidden shadow-2xl"
      >
        <div className="relative z-10 max-w-2xl">
          <span className="bg-tea-green/20 text-tea-green px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-6 inline-block">Premium Hydration</span>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Elevate Your <span className="text-tea-green">Vitality</span> with Shalom
          </h1>
          <p className="text-violet-soft text-lg mb-8 leading-relaxed">
            Experience the future of alkaline water. Real-time community insights, secure transactions, and unparalleled purity.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-6 py-3 rounded-2xl border border-white/20">
              <CreditCard className="w-5 h-5 text-tea-green" />
              <span className="text-white font-bold">GCash Ready</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-6 py-3 rounded-2xl border border-white/20">
              <Mail className="w-5 h-5 text-tea-green" />
              <span className="text-white font-bold">Active Support</span>
            </div>
          </div>
        </div>
        
        <div className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-20">
          <Globe className="w-[500px] h-[500px] text-white absolute -top-20 -right-20 animate-spin-slow" />
        </div>
      </motion.div>

      {/* Stats/Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-[2.5rem] border border-tea-green/30 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
          >
            <div className="w-14 h-14 bg-violet-soft/30 rounded-2xl flex items-center justify-center text-violet-primary mb-6">
              {f.icon}
            </div>
            <h3 className="text-xl font-bold text-violet-deep mb-3">{f.title}</h3>
            <p className="text-slate-500 leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Info Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="bg-tea-green/10 rounded-[3rem] p-10 border border-dark-tea/20">
          <h2 className="text-3xl font-bold text-violet-deep mb-6">Payment Method</h2>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-tea-green/30 flex items-center gap-6">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl italic shadow-lg">
              G
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">GCash Account</p>
              <p className="text-3xl font-mono font-bold text-violet-deep tracking-tighter">0997 426 8658</p>
              <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-green-500" /> Secure Payment Gateway
              </p>
            </div>
          </div>
        </div>

        <div className="bg-violet-soft/10 rounded-[3rem] p-10 border border-violet-primary/20">
          <h2 className="text-3xl font-bold text-violet-deep mb-6">Support & Inquiries</h2>
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-violet-primary/10 flex items-center gap-4">
              <Mail className="w-6 h-6 text-violet-primary" />
              <div>
                <p className="text-xs font-bold text-slate-400">EMAIL SUPPORT</p>
                <p className="text-lg font-bold text-slate-700">aquinoaileen305@gmail.com</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-violet-primary/10 flex items-center gap-4">
              <Phone className="w-6 h-6 text-violet-primary" />
              <div>
                <p className="text-xs font-bold text-slate-400">HOTLINE</p>
                <p className="text-lg font-bold text-slate-700">+63 997 426 8658</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
