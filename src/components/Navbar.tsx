import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { auth } from '../lib/firebase';
import { LogOut, User, MessageCircle, Users, Globe, Search, Bell, ShoppingBag } from 'lucide-react';

export default function Navbar() {
  const { user } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const handleSignOut = () => {
    auth.signOut();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-tea-green/30 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
        <Link to="/community" className="flex items-center gap-2 group">
          <Globe className="w-8 h-8 text-violet-primary group-hover:rotate-12 transition-transform" />
          <span className="text-xl font-bold text-violet-deep hidden md:block">Shalom</span>
        </Link>

        <div className="flex-1 max-w-xl relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search Shalom..."
            className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full focus:ring-2 focus:ring-violet-primary/20 focus:bg-white transition-all text-sm"
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link to="/community" className="p-2 hover:bg-tea-green/20 rounded-full text-slate-600 transition-colors" title="Community">
            <Users className="w-6 h-6" />
          </Link>
          <Link to="/messenger" className="p-2 hover:bg-tea-green/20 rounded-full text-slate-600 transition-colors" title="Messenger">
            <MessageCircle className="w-6 h-6" />
          </Link>
          <Link to="/shop" className="p-2 hover:bg-tea-green/20 rounded-full text-slate-600 transition-colors relative" title="Shop & Orders">
            <ShoppingBag className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-violet-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-black">
                {cartCount}
              </span>
            )}
          </Link>
          <button className="p-2 hover:bg-tea-green/20 rounded-full text-slate-600 transition-colors" title="Notifications">
            <Bell className="w-6 h-6" />
          </button>

          <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block" />

          {user && (
            <div className="flex items-center gap-3">
              <Link to={`/profile/${user.uid}`} className="flex items-center gap-2 hover:bg-tea-green/20 p-1 pr-3 rounded-full transition-colors">
                <img 
                  src={user.photoURL} 
                  alt="Avatar" 
                  className="w-8 h-8 rounded-full border border-violet-primary/20"
                />
                <span className="text-sm font-semibold text-slate-700 hidden lg:block">{user.displayName}</span>
              </Link>
              <button 
                onClick={handleSignOut}
                className="p-2 hover:bg-red-50 text-red-500 rounded-full transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
