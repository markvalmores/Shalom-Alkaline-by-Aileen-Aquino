import { Mail, ShieldCheck, Heart, Info, Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-violet-deep text-white py-16 px-6 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-tea-green rounded-xl flex items-center justify-center text-violet-deep font-bold italic">S</div>
            <h2 className="text-2xl font-bold tracking-tight">Shalom</h2>
          </div>
          <p className="text-violet-soft text-sm leading-relaxed">
            Saturating the pure sea of the earth with visions of health and purity through premium alkaline water.
          </p>
          <div className="flex gap-4">
            <a href="#" className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="#" className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="#" className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="font-bold mb-6 flex items-center gap-2">
            <Info className="w-4 h-4 text-tea-green" /> Quick Links
          </h3>
          <ul className="space-y-4 text-sm text-violet-soft font-medium">
            <li><a href="/community" className="hover:text-white transition-colors">Community Feed</a></li>
            <li><a href="/messenger" className="hover:text-white transition-colors">Global Messenger</a></li>
            <li><a href="/dashboard" className="hover:text-white transition-colors">About Shalom</a></li>
          </ul>
        </div>

        <div className="md:col-span-2 space-y-6 bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-sm">
          <h3 className="font-bold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-tea-green" /> Direct Support
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-tea-green uppercase tracking-widest">Admin Email</p>
              <p className="text-sm font-mono break-all">aquinoaileen305@gmail.com</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-tea-green uppercase tracking-widest">GCash Payment</p>
              <p className="text-sm font-mono tracking-widest">0997 426 8658</p>
            </div>
          </div>
          <div className="pt-4 border-t border-white/10 text-[10px] text-violet-soft/60 flex items-center justify-between">
            <p>Made by Mark David Valmores a.k.a Usagyuun VTuber</p>
            <p>© 2026 Shalom Alkaline. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
