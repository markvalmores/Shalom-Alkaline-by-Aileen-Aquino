import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove, collection, query, where, orderBy, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { User, Post as PostType } from '../types';
import { PostItem } from './PostItem';
import { motion } from 'framer-motion';
import { UserPlus, UserMinus, Calendar, Mail, ShieldCheck, MapPin } from 'lucide-react';

export default function Profile() {
  const { uid } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    
    // Listen to profile
    const unsubProfile = onSnapshot(doc(db, 'users', uid), (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data() as User);
      }
      setLoading(false);
    });

    // Listen to user posts
    const q = query(collection(db, 'posts'), where('authorId', '==', uid), orderBy('createdAt', 'desc'));
    const unsubPosts = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PostType)));
    });

    return () => {
      unsubProfile();
      unsubPosts();
    };
  }, [uid]);

  useEffect(() => {
    if (currentUser && profile && uid !== currentUser.uid) {
      // Check if following
      // Simplified: Just check if current user is in profile's followers (not efficient but okay for this scale)
      // Actually, better to have a separate collection for following logic as per skill but keeping it simple for now
    }
  }, [currentUser, profile]);

  if (loading) return <div className="h-screen flex items-center justify-center">Loading profile...</div>;
  if (!profile) return <div className="h-screen flex items-center justify-center">User not found</div>;

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="bg-white rounded-b-[3rem] shadow-sm overflow-hidden border-b border-tea-green/30">
        <div className="h-64 w-full relative">
          <img src={profile.coverURL} alt="Cover" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
        
        <div className="px-8 pb-8 relative">
          <div className="flex justify-between items-end -mt-16 mb-6">
            <div className="relative">
              <img 
                src={profile.photoURL} 
                alt="Avatar" 
                className="w-32 h-32 rounded-3xl border-4 border-white shadow-xl object-cover" 
              />
              {profile.isAdmin && (
                <div className="absolute -top-2 -right-2 bg-violet-primary text-white p-1.5 rounded-xl shadow-lg">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              {currentUser && currentUser.uid !== uid && (
                <button 
                  className={`px-6 py-2 rounded-2xl font-bold flex items-center gap-2 transition-all ${
                    isFollowing 
                    ? 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600' 
                    : 'bg-violet-primary text-white shadow-lg shadow-violet-primary/20 hover:bg-violet-deep'
                  }`}
                >
                  {isFollowing ? <><UserMinus className="w-5 h-5" /> Unfollow</> : <><UserPlus className="w-5 h-5" /> Follow</>}
                </button>
              )}
              {currentUser?.uid === uid && (
                <button className="px-6 py-2 bg-tea-green text-dark-tea font-bold rounded-2xl border-2 border-dark-tea/20 hover:bg-dark-tea hover:text-white transition-all">
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-violet-deep flex items-center gap-2">
                {profile.displayName}
                {profile.isAdmin && <span className="text-xs bg-violet-soft text-violet-deep px-2 py-0.5 rounded-md uppercase tracking-widest font-bold">Admin</span>}
              </h1>
              <p className="text-slate-500 font-medium">@{profile.email.split('@')[0]}</p>
            </div>

            <p className="text-slate-700 max-w-2xl leading-relaxed">
              {profile.bio}
            </p>

            <div className="flex flex-wrap gap-6 text-sm text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" /> Earth
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> Joined July 2026
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-4 h-4" /> {profile.email}
              </div>
            </div>

            <div className="flex gap-8 pt-4 border-t border-slate-50">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-violet-deep">{profile.followersCount}</span>
                <span className="text-slate-500 text-sm">Followers</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-violet-deep">{profile.followingCount}</span>
                <span className="text-slate-500 text-sm">Following</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="mt-8 px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-violet-deep px-2 flex items-center gap-2">
            <span className="w-2 h-8 bg-violet-primary rounded-full" />
            Visions by {profile.displayName.split(' ')[0]}
          </h2>
          {posts.length > 0 ? (
            posts.map(post => <PostItem key={post.id} post={post} />)
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-tea-green/20">
              No visions saturating the sea yet.
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-tea-green/30">
            <h3 className="font-bold text-violet-deep mb-4 uppercase tracking-wider text-xs">Pure Sea Info</h3>
            <div className="space-y-4 text-sm text-slate-600">
              <div className="p-4 bg-tea-green/20 rounded-2xl border border-dark-tea/20">
                <p className="font-bold text-dark-tea mb-1">GCash Payment</p>
                <p className="text-lg font-mono text-violet-deep">09974268658</p>
              </div>
              <div className="p-4 bg-violet-soft/20 rounded-2xl border border-violet-primary/20">
                <p className="font-bold text-violet-primary mb-1">Customer Service</p>
                <p className="break-all font-medium">aquinoaileen305@gmail.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
