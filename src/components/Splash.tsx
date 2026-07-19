import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Globe, Droplets, ArrowRight } from 'lucide-react';

export default function Splash() {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-full relative overflow-hidden bg-gradient-to-br from-tea-green via-white to-violet-soft/30 flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center z-10"
      >
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <Globe className="w-24 h-24 text-violet-primary animate-pulse" />
            <Droplets className="w-12 h-12 text-dark-tea absolute -bottom-2 -right-2" />
          </div>
        </div>
        <h1 className="text-6xl font-bold text-violet-deep tracking-tight mb-4">
          Shalom <span className="text-dark-tea">Alkaline</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-lg mx-auto mb-8">
          Saturating the pure sea of the earth with visions of health and purity.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/login')}
          className="bg-violet-primary text-white px-8 py-4 rounded-full font-bold text-lg flex items-center gap-2 mx-auto shadow-xl shadow-violet-primary/20 hover:bg-violet-deep transition-colors"
        >
          Enter the Sanctuary <ArrowRight className="w-5 h-5" />
        </motion.button>
      </motion.div>

      {/* Credit line on lower left */}
      <div className="absolute bottom-8 left-8 flex items-center gap-3">
        <img 
          src="/src/assets/images/shalom_water_logo_1784454262594.jpg" 
          alt="Logo" 
          className="w-12 h-12 rounded-full border-2 border-violet-primary/30"
          referrerPolicy="no-referrer"
        />
        <div className="text-xs text-violet-deep/60 font-medium">
          <p>website made by</p>
          <p className="font-bold text-violet-primary">Mark David Valmores</p>
          <p>a.k.a Usagyuun VTuber</p>
        </div>
      </div>

      {/* Decorative visions */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10">
        <div className="absolute top-10 left-10 w-64 h-64 bg-violet-primary rounded-full blur-[120px]" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-tea-green rounded-full blur-[150px]" />
      </div>
    </div>
  );
}
