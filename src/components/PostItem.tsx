import React from 'react';
import { Post } from '../types';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { ArrowBigUp, ArrowBigDown, MessageSquare, Share2, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

export const PostItem: React.FC<{ post: Post }> = ({ post }) => {
  const { user } = useAuth();

  const isUpvoted = user ? post.upvotes.includes(user.uid) : false;
  const isDownvoted = user ? post.downvotes.includes(user.uid) : false;

  const handleVote = async (type: 'up' | 'down') => {
    if (!user) return;
    const postRef = doc(db, 'posts', post.id);

    if (type === 'up') {
      if (isUpvoted) {
        await updateDoc(postRef, { upvotes: arrayRemove(user.uid) });
      } else {
        await updateDoc(postRef, { 
          upvotes: arrayUnion(user.uid),
          downvotes: arrayRemove(user.uid)
        });
      }
    } else {
      if (isDownvoted) {
        await updateDoc(postRef, { downvotes: arrayRemove(user.uid) });
      } else {
        await updateDoc(postRef, { 
          downvotes: arrayUnion(user.uid),
          upvotes: arrayRemove(user.uid)
        });
      }
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-tea-green/30 overflow-hidden hover:border-violet-primary/30 transition-colors">
      <div className="flex">
        {/* Voting Sidebar */}
        <div className="bg-slate-50/50 p-4 flex flex-col items-center gap-2 border-r border-tea-green/10">
          <button 
            onClick={() => handleVote('up')}
            className={`p-1 rounded hover:bg-orange-100 transition-colors ${isUpvoted ? 'text-orange-600 bg-orange-50' : 'text-slate-400'}`}
          >
            <ArrowBigUp className={`w-8 h-8 ${isUpvoted ? 'fill-current' : ''}`} />
          </button>
          <span className="font-bold text-sm text-slate-700">
            {post.upvotes.length - post.downvotes.length}
          </span>
          <button 
            onClick={() => handleVote('down')}
            className={`p-1 rounded hover:bg-violet-100 transition-colors ${isDownvoted ? 'text-violet-600 bg-violet-50' : 'text-slate-400'}`}
          >
            <ArrowBigDown className={`w-8 h-8 ${isDownvoted ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link to={`/profile/${post.authorId}`}>
                <img src={post.authorPhoto} alt="" className="w-8 h-8 rounded-full border border-violet-primary/10" />
              </Link>
              <div className="text-xs">
                <Link to={`/profile/${post.authorId}`} className="font-bold text-slate-800 hover:underline">
                  {post.authorName}
                </Link>
                <p className="text-slate-400">
                  {post.createdAt ? formatDistanceToNow(post.createdAt.toDate()) : 'just now'} ago
                </p>
              </div>
            </div>
            <button className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          <div className="text-slate-700 leading-relaxed mb-6 whitespace-pre-wrap">
            {post.content}
          </div>

          {post.imageURL && (
            <div className="mb-6 rounded-2xl overflow-hidden border border-slate-100">
              {post.fileType?.startsWith('video/') ? (
                <video controls className="w-full">
                  <source src={post.imageURL} type={post.fileType} />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img src={post.imageURL} alt="Post media" className="w-full" />
              )}
            </div>
          )}

          <div className="flex items-center gap-6 border-t border-slate-50 pt-4">
            <button className="flex items-center gap-2 text-slate-500 hover:text-violet-primary transition-colors text-sm font-medium p-2 hover:bg-violet-50 rounded-lg">
              <MessageSquare className="w-5 h-5" />
              <span>Comments</span>
            </button>
            <button className="flex items-center gap-2 text-slate-500 hover:text-violet-primary transition-colors text-sm font-medium p-2 hover:bg-violet-50 rounded-lg">
              <Share2 className="w-5 h-5" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
