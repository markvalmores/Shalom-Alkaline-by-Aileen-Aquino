import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove, collection, query, where, orderBy, getDoc } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { User, Post as PostType } from '../types';
import { PostItem } from './PostItem';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, UserMinus, Calendar, Mail, ShieldCheck, MapPin, X, Key, Save, Edit } from 'lucide-react';

export default function Profile() {
  const { uid } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Edit Profile States
  const [isEditing, setIsEditing] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editPhotoURL, setEditPhotoURL] = useState('');
  const [editCoverURL, setEditCoverURL] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [resetEmailError, setResetEmailError] = useState('');
  const [sendingReset, setSendingReset] = useState(false);

  // Initialize edit fields when profile loads
  useEffect(() => {
    if (profile) {
      setEditDisplayName(profile.displayName || '');
      setEditBio(profile.bio || '');
      setEditPhotoURL(profile.photoURL || '');
      setEditCoverURL(profile.coverURL || '');
    }
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid || !currentUser) return;
    if (currentUser.uid !== uid) return;

    setIsSaving(true);
    setUpdateError('');
    setUpdateSuccess('');

    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        displayName: editDisplayName.trim(),
        bio: editBio.trim(),
        photoURL: editPhotoURL.trim(),
        coverURL: editCoverURL.trim(),
      });
      setUpdateSuccess('Profile updated successfully!');
      setTimeout(() => {
        setIsEditing(false);
        setUpdateSuccess('');
      }, 1500);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setUpdateError(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendResetEmail = async () => {
    if (!profile?.email) return;
    setSendingReset(true);
    setResetEmailSent(false);
    setResetEmailError('');

    try {
      await sendPasswordResetEmail(auth, profile.email);
      setResetEmailSent(true);
    } catch (err: any) {
      console.error('Error sending reset email:', err);
      setResetEmailError(err.message || 'Failed to send reset email.');
    } finally {
      setSendingReset(false);
    }
  };

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
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2 bg-tea-green text-dark-tea font-bold rounded-2xl border-2 border-dark-tea/20 hover:bg-dark-tea hover:text-white transition-all flex items-center gap-1.5"
                >
                  <Edit className="w-4 h-4" /> Edit Profile
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

      {/* Edit Profile & Password Reset Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden my-8"
            >
              {/* Header */}
              <div className="px-8 py-6 bg-violet-deep text-white flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Edit Your Profile</h3>
                  <p className="text-xs text-violet-soft mt-0.5">Customize your digital representation</p>
                </div>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-1.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-8 max-h-[75vh] overflow-y-auto space-y-6">
                {updateError && (
                  <div className="bg-red-50 text-red-500 p-4 rounded-xl text-xs border border-red-100">
                    {updateError}
                  </div>
                )}
                {updateSuccess && (
                  <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl text-xs border border-emerald-100">
                    {updateSuccess}
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      required
                      value={editDisplayName}
                      onChange={(e) => setEditDisplayName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-primary/20 focus:border-violet-primary text-sm transition-all"
                      placeholder="Your Full Name"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bio Description</label>
                    <textarea
                      rows={3}
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-primary/20 focus:border-violet-primary text-sm transition-all resize-none"
                      placeholder="Tell the community about yourself..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Profile Picture URL</label>
                    <input
                      type="url"
                      value={editPhotoURL}
                      onChange={(e) => setEditPhotoURL(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-primary/20 focus:border-violet-primary text-sm transition-all"
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cover Banner URL</label>
                    <input
                      type="url"
                      value={editCoverURL}
                      onChange={(e) => setEditCoverURL(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-primary/20 focus:border-violet-primary text-sm transition-all"
                      placeholder="https://example.com/cover.jpg"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full bg-violet-primary hover:bg-violet-deep text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-sm shadow-md"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving Changes...' : 'Save Profile Details'}
                  </button>
                </form>

                {/* Password / Forgot Section */}
                <div className="border-t border-slate-100 pt-6 mt-6">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Security & Password</h4>
                  
                  {resetEmailSent ? (
                    <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl text-xs border border-emerald-100 font-medium font-sans">
                      Password reset instructions have been sent to <span className="font-bold">{profile.email}</span>. Please check your inbox.
                    </div>
                  ) : (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-xs text-slate-500 leading-relaxed mb-3">
                        Want to update or change your password? Request a safe password reset link sent to your registered email address (<span className="font-semibold">{profile.email}</span>).
                      </p>
                      {resetEmailError && (
                        <p className="text-xs text-red-500 font-bold mb-3">{resetEmailError}</p>
                      )}
                      <button
                        onClick={handleSendResetEmail}
                        disabled={sendingReset}
                        className="bg-white hover:bg-slate-100 border border-slate-200 text-violet-deep text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-all disabled:opacity-50"
                      >
                        <Key className="w-3.5 h-3.5" />
                        {sendingReset ? 'Sending Reset Link...' : 'Request Password Reset Link'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
