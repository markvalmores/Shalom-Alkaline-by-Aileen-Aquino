import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Post } from '../types';
import { PostItem } from './PostItem';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Send, Loader2, X } from 'lucide-react';

export default function Community() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
      setPosts(newPosts);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!content.trim() && !selectedFile) || !user) return;
    setPosting(true);
    try {
      let fileUrl = '';
      if (selectedFile) {
        const fileRef = storageRef(storage, `posts/${user.uid}/${Date.now()}_${selectedFile.name}`);
        await uploadBytes(fileRef, selectedFile);
        fileUrl = await getDownloadURL(fileRef);
      }

      await addDoc(collection(db, 'posts'), {
        authorId: user.uid,
        authorName: user.displayName,
        authorPhoto: user.photoURL,
        content: content.trim(),
        imageURL: fileUrl || null,
        fileType: selectedFile?.type || null,
        upvotes: [],
        downvotes: [],
        createdAt: serverTimestamp()
      });
      setContent('');
      setSelectedFile(null);
    } catch (err) {
      console.error(err);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Create Post */}
      <div className="bg-white rounded-3xl shadow-sm border border-tea-green/30 p-6 mb-8">
        <div className="flex gap-4">
          <img src={user?.photoURL} alt="" className="w-10 h-10 rounded-full border border-violet-primary/20" />
          <form onSubmit={handlePost} className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Saturate the sea with your visions..."
              className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-700 focus:ring-2 focus:ring-violet-primary/20 min-h-[120px] resize-none"
            />
            {selectedFile && (
              <div className="mt-2 p-2 bg-slate-100 rounded-lg flex items-center justify-between text-sm text-slate-600">
                <span className="truncate">{selectedFile.name}</span>
                <button type="button" onClick={() => setSelectedFile(null)} className="p-1 hover:bg-slate-200 rounded-full"><X className="w-4 h-4" /></button>
              </div>
            )}
            <div className="flex items-center justify-between mt-4">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-tea-green/20 rounded-full text-dark-tea transition-colors">
                <ImageIcon className="w-5 h-5" />
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".mp4,.avi,.webm,.gif,.png,.jpg,.jpeg,.bmp,.flv,.swf" />
              <button 
                type="submit"
                disabled={posting || (!content.trim() && !selectedFile)}
                className="bg-violet-primary text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-violet-deep transition-colors disabled:opacity-50"
              >
                {posting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Post</>}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Feed */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-10 h-10 animate-spin mb-4" />
          <p>Diving into the sea of visions...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {posts.map(post => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <PostItem post={post} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
