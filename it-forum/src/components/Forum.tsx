import { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, MessageCircle, Clock, Send, User } from 'lucide-react';
import { ForumPost, ForumReply } from '../types';
import { api } from '../api';
import { toast } from 'sonner';

interface ForumProps {
  posts: ForumPost[];
  setPosts: (posts: ForumPost[]) => void;
}

export function Forum({ posts, setPosts }: ForumProps) {
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostAuthor, setNewPostAuthor] = useState('');
  const [newPostRole, setNewPostRole] = useState('Оқушы'); // Default role
  const [replyContent, setReplyContent] = useState('');
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync selectedPost with posts when posts update (e.g. from Realtime)
  useEffect(() => {
    if (selectedPost) {
      const updatedPost = posts.find(p => p.id === selectedPost.id);
      if (updatedPost) {
        setSelectedPost(updatedPost);
      }
    }
  }, [posts, selectedPost?.id]); // Only dependency on posts and ID is safer

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return 'дәл қазір';
    if (diffInMins < 60) return `${diffInMins} мин бұрын`;
    if (diffInHours < 24) return `${diffInHours} сағ бұрын`;
    return `${diffInDays} күн бұрын`;
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!(newPostTitle.trim() && newPostContent.trim() && newPostAuthor.trim())) return;
    setIsSubmitting(true);
    try {
      await api.createPost({
        author: `${newPostAuthor.trim()} [${newPostRole}]`,
        title: newPostTitle,
        content: newPostContent,
      });
      toast.success('Пост жарияланды');
      setNewPostTitle('');
      setNewPostContent('');
      setNewPostAuthor('');
      setShowNewPostForm(false);
    } catch (error: any) {
      toast.error('Қате: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPost || !replyContent.trim()) return;
    setIsSubmitting(true);
    try {
      await api.addReply(selectedPost.id, { content: replyContent });
      toast.success('Жауап қосылды');
      setReplyContent('');
    } catch (error: any) {
      toast.error('Қате: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (postId: number) => {
    try {
      await api.like(postId); // сервер бір IP-ден бір лайкқа рұқсат етеді
    } catch (error: any) {
      toast.error('Қате: ' + error.message);
    }
  };

  if (selectedPost) {
    const replies = selectedPost.replies || []; // Safe access

    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedPost(null)}
          className="text-blue-600 hover:text-blue-700"
        >
          ← Форумға қарай
        </button>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="mb-4">{selectedPost.title}</h2>
          <div className="flex items-center gap-3 mb-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <User size={16} />
              <span className="font-medium">{selectedPost.author}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{formatTimeAgo(selectedPost.timestamp)}</span>
            </div>
          </div>
          <p className="text-gray-700 mb-6">{selectedPost.content}</p>
          
          <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => handleLike(selectedPost.id)}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
            >
              <ThumbsUp size={18} />
              <span>{selectedPost.likes}</span>
            </button>
            <div className="flex items-center gap-2 text-gray-600">
              <MessageCircle size={18} />
              <span>{replies.length}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="mb-4">Жауаптар ({replies.length})</h3>
          
          <div className="space-y-4 mb-6">
            {replies.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Әлі жауап жоқ. Алғашқы жауап беруші болыңыз!</p>
            ) : (
              replies.map(reply => (
                <div key={reply.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span>{reply.author}</span>
                    <span className="text-sm text-gray-500">{formatTimeAgo(reply.timestamp)}</span>
                  </div>
                  <p className="text-gray-700">{reply.content}</p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleAddReply}>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Сіздің жауабыңыз..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
              rows={4}
            />
            <div className="flex justify-end mt-3">
              <button
                type="submit"
                disabled={!replyContent.trim() || isSubmitting}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
                {isSubmitting ? 'Жіберілуде...' : 'Жауап жазу'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2">Форум</h1>
          <p className="text-gray-600">Талқылаңыз, сұрақтар қойыңыз және біліміңізбен бөлісіңіз</p>
        </div>
        <button
          onClick={() => setShowNewPostForm(!showNewPostForm)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <MessageSquare size={20} />
          Жаңа пост
        </button>
      </div>

      {showNewPostForm && (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="mb-4">Жаңа пост жасау</h3>
          <form onSubmit={handleCreatePost} className="space-y-4">
             <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2 text-gray-700">Атыңыз</label>
                <input
                  type="text"
                  value={newPostAuthor}
                  onChange={(e) => setNewPostAuthor(e.target.value)}
                  placeholder="Аты-жөніңіз"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-700">Санатыңыз</label>
                <select
                  value={newPostRole}
                  onChange={(e) => setNewPostRole(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                >
                  <option value="Оқушы">Оқушы</option>
                  <option value="Мұғалім">Мұғалім</option>
                  <option value="Ата-ана">Ата-ана</option>
                  <option value="Қонақ">Қонақ</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">Тақырып</label>
              <input
                type="text"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                placeholder="Посттың тақырыбы"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">Мазмұны</label>
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Не туралы ойлайсыз?"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                rows={4}
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowNewPostForm(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Болдырмау
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Жариялануда...' : 'Пост жасау'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="bg-white rounded-lg p-12 shadow-sm text-center text-gray-500">
            <MessageSquare size={48} className="mx-auto mb-4 text-gray-400" />
            <p>Әлі пост жоқ</p>
            <p className="text-sm">Алғашқы постты жасаушы болыңыз!</p>
          </div>
        ) : (
          posts.map(post => (
            <div
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <h3 className="mb-3">{post.title}</h3>
              <p className="text-gray-600 mb-4 line-clamp-2">{post.content}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <User size={16} />
                    <span className="font-medium">{post.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{formatTimeAgo(post.timestamp)}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <ThumbsUp size={16} />
                    <span>{post.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle size={16} />
                    <span>{(post.replies || []).length}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
