import React, { useState, useEffect } from 'react';
import { Star, X, CheckCircle2, ShieldCheck, Check, Plus } from 'lucide-react';
import { storage } from '../lib/storage';

interface ReviewModalProps {
  jobId: string;
  artisanId: string;
  onClose: () => void;
  onSubmitted: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  jobId,
  artisanId,
  onClose,
  onSubmitted
}) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [tags, setTags] = useState<string[]>(['Punctual & Fast', 'Clean Workmanship']);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const artisan = storage.getArtisanById(artisanId);
  const availableTags = [
    'Punctual & Fast',
    'Clean Workmanship',
    'Fair Pricing',
    'Polite Communication',
    'Brought Proper Tools',
    'Top Quality Finish'
  ];

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    storage.addReview({
      jobId,
      artisanId,
      rating,
      comment,
      tags
    });

    onSubmitted();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <div>
            <h3 className="font-black text-lg text-[#0B0B0F]">Review Your Artisan</h3>
            <p className="text-xs text-stone-500">
              Verified review for {artisan?.user.fullName}
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-stone-400 hover:text-[#0B0B0F]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium text-stone-700">
          {/* Star selector */}
          <div className="text-center py-2">
            <span className="text-stone-500 font-semibold block mb-2">Overall Craftsmanship Rating</span>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= (hoverRating || rating)
                        ? 'fill-[#F97316] text-[#F97316]'
                        : 'text-stone-200'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Quick compliment tags */}
          <div>
            <label className="font-bold text-[#0B0B0F] block mb-1.5">What stood out?</label>
            <div className="flex flex-wrap gap-1.5">
              {availableTags.map((tag) => {
                const isSelected = tags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all ${
                      isSelected
                        ? 'bg-blue-50 text-[#2563EB] border border-blue-200'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200 border border-stone-200'
                    }`}
                  >
                    {isSelected ? <Check className="w-3 h-3 text-[#2563EB]" /> : <Plus className="w-3 h-3 text-stone-400" />}
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Review text */}
          <div>
            <label className="font-bold text-[#0B0B0F] block mb-1">Your Honest Feedback *</label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was the punctuality, joinery/pipe work, and overall craftsmanship?"
              className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-[#F97316]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#F97316] hover:bg-orange-600 text-white font-bold rounded-xl text-xs shadow-md transition-all"
          >
            Submit Verified Review
          </button>
        </form>
      </div>
    </div>
  );
};
